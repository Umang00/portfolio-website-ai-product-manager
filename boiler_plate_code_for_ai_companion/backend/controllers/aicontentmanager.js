// controllers/aiContextManager.js
const fs = require("fs");
const path = require("path");
const { getDB, getDBAI } = require("../config/mongodb");
const pdfParse = require("pdf-parse");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const openai = require("../config/openai");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─────────── PRIORITIZATION CONFIG ───────────
const CATEGORY_WEIGHTS = { db: 0.7, resume: 0.3, github: 0.1 };
const QUERY_BOOST = { db: 0.1, resume: 0.1, github: 0.1 };
const DB_TERMS = [
  "experience",
  "project",
  "honors",
  "skills",
  "involvement",
  "yearInReview",
];
const MAX_COUNTS = { db: 6, resume: 3, github: 3 };
const TOTAL_BUDGET = 12;
const MIN_SCORE_THRESH = 0.075; // drop anything below 0.15 after weighting
const MAX_CONTEXT_CHARS = 8000;
// ─────────────────────────────────────────────

// Vector Search index name and definition
const SEARCH_INDEX_NAME = "chunkEmbeddingsIndex";
const SEARCH_INDEX_DEF = {
  mappings: {
    dynamic: false,
    fields: {
      category: { type: "string" },
      embedding: {
        type: "knnVector",
        dimensions: 1536,
        similarity: "cosine",
      },
      text: { type: "string" },
    },
  },
};

// Path to your resume PDF in data/
const resumeFilePath = path.join(
  __dirname,
  "../data/Singh_Kartavya_Resume2026.pdf"
);

// In-memory caches
let memoryIndex = [];
let contextMeta = {};
let memoryIndexMeta = {};

/**
 * Recursively remove empty or null fields from objects/arrays.
 */
function removeEmptyFields(obj) {
  if (Array.isArray(obj)) {
    return obj
      .map(removeEmptyFields)
      .filter(
        (x) =>
          x != null &&
          !(typeof x === "string" && x.trim() === "") &&
          !(Array.isArray(x) && x.length === 0) &&
          !(
            typeof x === "object" &&
            !Array.isArray(x) &&
            !Object.keys(x).length
          )
      );
  } else if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      obj[k] = removeEmptyFields(obj[k]);
      if (
        obj[k] == null ||
        (typeof obj[k] === "string" && obj[k].trim() === "") ||
        (Array.isArray(obj[k]) && obj[k].length === 0) ||
        (typeof obj[k] === "object" &&
          !Array.isArray(obj[k]) &&
          !Object.keys(obj[k]).length)
      ) {
        delete obj[k];
      }
    }
    return obj;
  }
  return obj;
}

function mmrSelect(candidates, k, lambda = 0.7) {
  if (!candidates.length || k <= 0) return [];
  const selected = [];
  // init: pick highest‐weighted
  candidates.sort((a, b) => b.weightedScore - a.weightedScore);
  selected.push(candidates.shift());
  while (selected.length < k && candidates.length) {
    let bestIdx = 0,
      bestScore = -Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      const relevance = cand.weightedScore;
      // dissimilarity = max cosine to any already‐selected
      const maxSim = Math.max(
        ...selected.map((s) =>
          computeCosineSimilarity(cand.embedding, s.embedding)
        )
      );
      const mmrScore = lambda * relevance - (1 - lambda) * maxSim;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }
    selected.push(candidates.splice(bestIdx, 1)[0]);
  }
  return selected;
}

/**
 * Given per-category “signal” scores and a total budget,
 * returns integer allocations that (1) sum to TOTAL_BUDGET,
 * (2) are proportional to signals, (3) honor optional min/max.
 */
function allocateBudget(signals, totalBudget, minPerCat = {}, maxPerCat = {}) {
  // 1) compute float allocations
  const totalSignal = Object.values(signals).reduce((a, b) => a + b, 0) || 1;
  const floats = Object.fromEntries(
    Object.entries(signals).map(([cat, sig]) => [
      cat,
      (sig / totalSignal) * totalBudget,
    ])
  );

  // 2) floor them
  let allocs = Object.fromEntries(
    Object.entries(floats).map(([cat, f]) => [cat, Math.floor(f)])
  );

  // 3) distribute leftover by largest fractional
  let left = totalBudget - Object.values(allocs).reduce((a, b) => a + b, 0);
  const fracs = Object.entries(floats)
    .map(([cat, f]) => [cat, f - Math.floor(f)])
    .sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < left; i++) {
    allocs[fracs[i][0]]++;
  }

  // 4) clamp to per-cat min/max if given
  for (const cat of Object.keys(allocs)) {
    if (minPerCat[cat] != null)
      allocs[cat] = Math.max(allocs[cat], minPerCat[cat]);
    if (maxPerCat[cat] != null)
      allocs[cat] = Math.min(allocs[cat], maxPerCat[cat]);
  }
  return allocs;
}

/*===============================================
  Context Meta (single‐doc in collection "contextMeta")
===============================================*/
async function loadContextMeta() {
  const db = getDBAI();
  const doc = await db
    .collection("contextMeta")
    .findOne({ _id: "contextMeta" });
  contextMeta = doc || {};
}

async function saveContextMeta() {
  const db = getDBAI();
  await db
    .collection("contextMeta")
    .updateOne(
      { _id: "contextMeta" },
      { $set: { ...contextMeta, _id: "contextMeta" } },
      { upsert: true }
    );
}

/*===============================================
  DB Context Snapshots ("dbContexts")
===============================================*/
async function aggregateDbContext() {
  const db = getDB();
  // Fetch data from each collection, excluding unwanted fields
  const experienceData = await db
    .collection("experienceTable")
    .find(
      { deleted: { $ne: true } },
      {
        projection: {
          _id: 0,
          experienceLink: 0,
          experienceURLs: 0,
          likesCount: 0,
          experienceImages: 0,
        },
      }
    )
    .toArray();
  const honorsData = await db
    .collection("honorsExperienceTable")
    .find(
      { deleted: { $ne: true } },
      {
        projection: {
          _id: 0,
          honorsExperienceLink: 0,
          honorsExperienceURLs: 0,
          likesCount: 0,
          honorsExperienceImages: 0,
        },
      }
    )
    .toArray();
  const involvementData = await db
    .collection("involvementTable")
    .find(
      { deleted: { $ne: true } },
      {
        projection: {
          _id: 0,
          involvementLink: 0,
          involvementURLs: 0,
          likesCount: 0,
          involvementImages: 0,
        },
      }
    )
    .toArray();
  const projectData = await db
    .collection("projectTable")
    .find(
      { deleted: { $ne: true } },
      {
        projection: {
          _id: 0,
          projectLink: 0,
          projectURLs: 0,
          likesCount: 0,
          projectImages: 0,
        },
      }
    )
    .toArray();
  const skillsCollectionData = await db
    .collection("skillsCollection")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const skillsTableData = await db
    .collection("skillsTable")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const yearData = await db
    .collection("yearInReviewTable")
    .find(
      { deleted: { $ne: true } },
      {
        projection: {
          _id: 0,
          yearInReviewLink: 0,
          yearInReviewURLs: 0,
          likesCount: 0,
          yearInReviewImages: 0,
        },
      }
    )
    .toArray();
  const aggregated = {
    experienceTable: experienceData,
    honorsExperienceTable: honorsData,
    involvementTable: involvementData,
    projectTable: projectData,
    skillsCollection: skillsCollectionData,
    skillsTable: skillsTableData,
    yearInReviewTable: yearData,
  };
  return removeEmptyFields(aggregated);
}
async function updateDbContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateDbContext();
  // await db.collection("dbContexts").deleteMany({});
  // Upsert a single 'current' document
  await db.collection("dbContexts").updateOne(
    { _id: "current" },
    {
      $set: {
        data: snapshot,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  contextMeta.dbContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(
    `✅ dbContexts snapshot saved (${Object.keys(snapshot).length} tables)`
  );
}

async function getDbContextFile() {
  const db = getDBAI();
  const doc = await db.collection("dbContexts").findOne({ _id: "current" });

  if (doc) {
    return JSON.stringify(doc.data);
  } else {
    // fallback: build & upsert
    await updateDbContextFile();
    return JSON.stringify(await aggregateDbContext());
  }
}

/*===============================================
  GitHub Context Snapshots ("githubContexts")
===============================================*/
async function fetchAllRepos() {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN not set");
  let repos = [],
    page = 1;
  while (1) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const arr = await res.json();
    if (!arr.length) break;
    repos = repos.concat(arr);
    page++;
  }
  return repos;
}

async function fetchRepoReadme(fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub README ${res.status}`);
  return (await res.text()).trim();
}

async function aggregateGithubContext() {
  const repos = await fetchAllRepos();
  const out = [];
  for (const r of repos) {
    const info = {
      name: r.name,
      full_name: r.full_name,
      description: r.description || "",
      html_url: r.html_url,
      language: r.language || "",
      visibility: r.private ? "private" : "public",
      created_at: r.created_at,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
    };
    try {
      const md = await fetchRepoReadme(r.full_name);
      if (md) info.readme = md.length > 3000 ? md.slice(0, 2995) + "..." : md;
    } catch (e) {
      console.error(`README error ${r.full_name}:`, e.message);
    }
    out.push(removeEmptyFields(info));
  }
  return out;
}

async function updateGithubContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateGithubContext();
  // await db.collection("githubContexts").deleteMany({});
  await db
    .collection("githubContexts")
    .updateOne(
      { _id: "current" },
      { $set: { data: snapshot, createdAt: new Date() } },
      { upsert: true }
    );
  contextMeta.githubContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(`✅ githubContexts snapshot saved (${snapshot.length} repos)`);
}

async function getGithubContextFile() {
  const db = getDBAI();
  const doc = await db.collection("githubContexts").findOne({ _id: "current" });

  if (doc) return JSON.stringify(doc.data);
  await updateGithubContextFile();
  return JSON.stringify(await aggregateGithubContext());
}

/*===============================================
  Resume Context Snapshots ("resumeContexts")
===============================================*/
async function aggregateResumeContext() {
  if (!fs.existsSync(resumeFilePath)) return { resume_text: "" };
  const pdf = await pdfParse(await fs.promises.readFile(resumeFilePath));
  return { resume_text: pdf.text.trim() };
}

async function updateResumeContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateResumeContext();
  // await db.collection("resumeContexts").deleteMany({});
  await db
    .collection("resumeContexts")
    .updateOne(
      { _id: "current" },
      { $set: { data: snapshot, createdAt: new Date() } },
      { upsert: true }
    );
  contextMeta.resumeContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(
    `✅ resumeContexts snapshot saved (${snapshot.resume_text.length} chars)`
  );
}

async function getResumeContextFile() {
  const db = getDBAI();
  const doc = await db.collection("resumeContexts").findOne({ _id: "current" });

  if (doc) return JSON.stringify(doc.data);
  await updateResumeContextFile();
  return JSON.stringify(await aggregateResumeContext());
}

/*===============================================
  Chunking Functions (unchanged implementation)
===============================================*/
// function chunkDbItem(tableName, item) {
//   const chunks = [];
//   let summaryLines = [];
//   let longTextFields = {};

//   let itemLabel = "";
//   for (const key of Object.keys(item)) {
//     if (/title|name/i.test(key) && typeof item[key] === "string") {
//       itemLabel = item[key];
//       break;
//     }
//   }

//   for (const [key, value] of Object.entries(item)) {
//     if (value == null) continue;
//     if (Array.isArray(value)) {
//       if (!value.length) continue;
//       if (typeof value[0] === "string") {
//         if (value.length > 1 || value[0].length > 200) {
//           longTextFields[key] = value;
//         } else {
//           summaryLines.push(`${key}: ${value[0]}`);
//         }
//       } else {
//         summaryLines.push(`${key}: ${JSON.stringify(value)}`);
//       }
//     } else if (typeof value === "string") {
//       if (value.length > 200 || value.includes("\n")) {
//         longTextFields[key] = value;
//       } else {
//         summaryLines.push(`${key}: ${value}`);
//       }
//     } else {
//       summaryLines.push(`${key}: ${value}`);
//     }
//   }

//   if (summaryLines.length) {
//     chunks.push(`${tableName} - ${itemLabel}\n${summaryLines.join("\n")}`);
//   }

//   for (const [fieldKey, value] of Object.entries(longTextFields)) {
//     if (Array.isArray(value)) {
//       const paragraphs = value.map((p) => p.trim()).filter(Boolean);
//       let subchunks = [];
//       if (paragraphs.length <= 3) {
//         subchunks = paragraphs;
//       } else {
//         const groupSize = Math.ceil(paragraphs.length / 3);
//         for (let i = 0; i < paragraphs.length; i += groupSize) {
//           subchunks.push(paragraphs.slice(i, i + groupSize).join(" "));
//         }
//       }
//       for (const sub of subchunks) {
//         if (sub) chunks.push(`${tableName} - ${itemLabel}: ${sub}`);
//       }
//     } else {
//       const text = value.trim();
//       if (text.length <= 400) {
//         chunks.push(`${tableName} - ${itemLabel}: ${text}`);
//       } else {
//         const sentences = text.split(/(?<=[.?!])\s+(?=[A-Z])/);
//         let part = "";
//         const subchunks = [];
//         for (const sent of sentences) {
//           if ((part + sent).length > 400) {
//             if (part) subchunks.push(part.trim());
//             part = sent;
//           } else {
//             part += (part ? " " : "") + sent;
//           }
//         }
//         if (part) subchunks.push(part.trim());
//         if (subchunks.length > 3) {
//           const merged = [];
//           const gs = Math.ceil(subchunks.length / 3);
//           for (let i = 0; i < subchunks.length; i += gs) {
//             merged.push(subchunks.slice(i, i + gs).join(" "));
//           }
//           subchunks.splice(0, subchunks.length, ...merged);
//         }
//         for (const sub of subchunks) {
//           if (sub) chunks.push(`${tableName} - ${itemLabel}: ${sub}`);
//         }
//       }
//     }
//   }

//   return chunks;
// }
function chunkDbItem(tableName, item) {
  // emit the entire JSON of the item as one chunk
  const label =
    Object.entries(item).find(
      ([k, v]) => /title|name/i.test(k) && typeof v === "string"
    )?.[1] || "";
  const text = `${tableName} - ${label}: ${JSON.stringify(item)}`;
  return [text];
}

function chunkDbContext(dbContextObj) {
  return Object.entries(dbContextObj)
    .flatMap(([tableName, items]) =>
      Array.isArray(items)
        ? items.flatMap((it) => chunkDbItem(tableName, it))
        : []
    )
    .map((text) => ({ category: "db", text }));
}

function chunkGithubContext(repoArray) {
  const chunks = [];
  for (const repo of repoArray) {
    const name = repo.name || repo.full_name || "Repository";
    let baseText = `Repository: ${name}`;
    if (repo.description) baseText += `\nDescription: ${repo.description}`;
    if (repo.language) baseText += `\nLanguage: ${repo.language}`;
    const readme = repo.readme || "";
    if (!readme) {
      chunks.push({ category: "github", text: baseText });
    } else {
      const paras = readme
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      let current = "",
        first = true;
      for (const p of paras) {
        const withNewline = p + "\n";
        if ((current + withNewline).length > 1000) {
          const label = first ? "README:" : "README (contd):";
          chunks.push({
            category: "github",
            text: `${baseText}\n${label}\n${current.trim()}`,
          });
          first = false;
          current = withNewline;
        } else {
          current += withNewline;
        }
      }
      if (current.trim()) {
        const label = first ? "README:" : "README (contd):";
        chunks.push({
          category: "github",
          text: `${baseText}\n${label}\n${current.trim()}`,
        });
      }
    }
  }
  return chunks;
}

function chunkResumeContext(resumeText) {
  const chunks = [];
  if (!resumeText.trim()) return chunks;

  const lines = resumeText.split("\n");
  const headingIndices = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line &&
      line === line.toUpperCase() &&
      /^[A-Z\s&]+$/.test(line) &&
      line.length < 60 &&
      !(i < 5 && /\d/.test(lines[i + 1] || ""))
    ) {
      headingIndices.push(i);
    }
  }
  if (!headingIndices.length) {
    chunks.push({ category: "resume", text: resumeText.trim() });
    return chunks;
  }

  const firstHeadingIdx = headingIndices[0];
  const sections = headingIndices.map((start, idx) => {
    const end =
      idx < headingIndices.length - 1 ? headingIndices[idx + 1] : lines.length;
    return {
      heading: lines[start].trim(),
      content: lines.slice(start + 1, end),
    };
  });

  for (const { heading, content } of sections) {
    const merged = [];
    for (let i = 0; i < content.length; i++) {
      let line = content[i];
      if (!line.trim()) {
        merged.push("");
      } else if (line.trim().endsWith(":")) {
        let agg = line.trim();
        while (
          i + 1 < content.length &&
          content[i + 1].trim() &&
          !content[i + 1].trim().endsWith(":") &&
          !content[i + 1].trim().startsWith("•")
        ) {
          agg += " " + content[++i].trim();
        }
        merged.push(agg);
      } else if (line.trim().startsWith("•")) {
        merged.push(line.trim());
      } else {
        if (
          merged.length &&
          merged[merged.length - 1] &&
          !merged[merged.length - 1].startsWith("•") &&
          !merged[merged.length - 1].endsWith(":")
        ) {
          merged[merged.length - 1] += " " + line.trim();
        } else {
          merged.push(line.trim());
        }
      }
    }

    let i = 0;
    while (i < merged.length) {
      if (!merged[i]) {
        i++;
        continue;
      }
      if (!merged[i].startsWith("•")) {
        const entryLines = [merged[i++]];
        while (i < merged.length && merged[i] && !merged[i].startsWith("•")) {
          break;
        }
        const bullets = [];
        while (i < merged.length && merged[i].startsWith("•")) {
          let b = merged[i++];
          while (i < merged.length && merged[i] && !merged[i].startsWith("•")) {
            b += " " + merged[i++];
          }
          bullets.push(b);
        }
        let text = `${heading}\n${entryLines.join("\n")}`;
        if (bullets.length) text += "\n" + bullets.join("\n");
        chunks.push({ category: "resume", text: text.trim() });
      } else {
        const b = merged[i++];
        chunks.push({ category: "resume", text: `${heading}\n${b}` });
      }
    }
  }

  return chunks;
}

/*===============================================
  Load & Persist Chunks ("chunkContents")
===============================================*/
async function loadAndChunkData() {
  const dbData = JSON.parse(await getDbContextFile());
  const ghData = JSON.parse(await getGithubContextFile());
  const resData = JSON.parse(await getResumeContextFile());
  let chunksDbContext = chunkDbContext(dbData);
  let chunksGithubContext = chunkGithubContext(ghData);
  let chunksResumeContext = chunkResumeContext(resData.resume_text || "");

  const allChunks = [
    ...chunksDbContext,
    ...chunksGithubContext,
    ...chunksResumeContext,
  ];

  const db = getDBAI();
  await db.collection("chunkContents").deleteMany({});
  if (allChunks.length) {
    const now = new Date();
    await db.collection("chunkContents").insertMany(
      allChunks.map((c) => ({
        category: c.category,
        text: c.text,
        createdAt: now,
      }))
    );
  }
  console.log(`✅ Stored ${chunksDbContext.length} chunks in dbContexts`);
  console.log(
    `✅ Stored ${chunksGithubContext.length} chunks in githubContexts`
  );
  console.log(
    `✅ Stored ${chunksResumeContext.length} chunks in resumeContexts`
  );
  console.log(`✅ Stored ${allChunks.length} chunks in chunkContents`);
  return allChunks;
}

/*===============================================
  Embedding & Memory Index ("memoryIndex", "memoryIndexMeta")
===============================================*/
async function loadMemoryIndexMeta() {
  const db = getDBAI();
  const doc = await db
    .collection("memoryIndexMeta")
    .findOne({ _id: "memoryIndexMeta" });
  memoryIndexMeta = doc || {};
}

async function getEmbedding(text) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

function computeCosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Ensure MongoDB Atlas Search index exists with correct mappings.
 */
async function ensureSearchIndex() {
  const db = getDBAI();
  // 1) List existing search indexes on memoryIndex
  const { indexes } = await db.command({ listSearchIndexes: "memoryIndex" });
  const existing = indexes.find((i) => i.name === SEARCH_INDEX_NAME);

  // 2) If exists but mappings differ, drop it
  if (existing) {
    const same =
      JSON.stringify(existing.definition) === JSON.stringify(SEARCH_INDEX_DEF);
    if (!same) {
      console.log(`🔄 Updating index ${SEARCH_INDEX_NAME} mappings`);
      await db.command({
        dropSearchIndex: { collection: "memoryIndex", name: SEARCH_INDEX_NAME },
      });
    } else if (
      (await db.collection("memoryIndex").countDocuments()) ===
      memoryIndex.length
    ) {
      console.log(`✅ ${SEARCH_INDEX_NAME} is up to date`);
      return;
    }
  }

  // 3) Create or recreate the index
  console.log(`🛠 Creating index ${SEARCH_INDEX_NAME}`);
  await db.command({
    createSearchIndexes: {
      collection: "memoryIndex",
      indexes: [{ name: SEARCH_INDEX_NAME, definition: SEARCH_INDEX_DEF }],
    },
  });
  console.log(`✅ ${SEARCH_INDEX_NAME} created, reindexing...`);
}

async function buildMemoryIndex(forceRebuild = false) {
  const db = getDBAI();
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  let lastUpdateMonth = -1;
  if (memoryIndexMeta.lastUpdate) {
    const d = new Date(memoryIndexMeta.lastUpdate);
    lastUpdateMonth = d.getFullYear() * 12 + d.getMonth();
  }

  const existingCount = await db.collection("memoryIndex").countDocuments();
  if (!forceRebuild && lastUpdateMonth === currentMonth && existingCount > 0) {
    memoryIndex = await db.collection("memoryIndex").find().toArray();
    console.log(
      `Memory index up-to-date (${memoryIndex.length} items), skipping rebuild.`
    );
    return;
  }

  console.log("🔄 Rebuilding memory index…");
  const chunks = await loadAndChunkData();
  const out = [];
  for (const { category, text } of chunks) {
    if (!text.trim()) continue;
    try {
      const embedding = await getEmbedding(text);
      out.push({
        category,
        text,
        embedding,
        createdAt: now,
      });
    } catch (e) {
      console.error("Embed error:", e.message);
    }
  }

  await db.collection("memoryIndex").deleteMany({});
  if (out.length) await db.collection("memoryIndex").insertMany(out);
  memoryIndex = out;

  memoryIndexMeta.lastUpdate = now.toISOString();
  await db
    .collection("memoryIndexMeta")
    .updateOne(
      { _id: "memoryIndexMeta" },
      { $set: { lastUpdate: memoryIndexMeta.lastUpdate } },
      { upsert: true }
    );

  console.log(`✅ Memory index rebuilt (${out.length} items)`);
}

/**
 * Use Atlas Vector Search to retrieve top-K per category.
 */
async function semanticSearchWithAtlas(
  queryEmbedding,
  topK = { db: 10, github: 5, resume: 3 }
) {
  const db = getDBAI();
  const pipelines = Object.entries(topK).map(async ([cat, k]) => {
    const hits = await db
      .collection("memoryIndex")
      .aggregate([
        {
          $vectorSearch: {
            index: SEARCH_INDEX_NAME,
            queryVector: queryEmbedding,
            path: "embedding",
            filter: { term: { category: cat } },
            k,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            score: { $meta: "vectorSearchScore" },
            category: "$" + cat,
          },
        },
      ])
      .toArray();
    return hits.map((h) => ({ ...h, category: cat }));
  });
  const resultsArr = await Promise.all(pipelines);
  return resultsArr.flat();
}

/**
 * RAG-style prompt: retrieve via Atlas and generate answer.
 */
async function askWithRAG(query) {
  if (!query.trim()) throw new Error("Query cannot be empty");

  // 1) Ensure memoryIndex loaded
  if (!memoryIndex.length) await buildMemoryIndex(false);

  // 2) Create embedding for query
  const qemb = await getEmbedding(query);

  // 3) Retrieve top hits
  const hits = await semanticSearchWithAtlas(qemb);

  // 4) Sort by score and pick top overall (e.g. 15)
  const top = hits.sort((a, b) => b.score - a.score).slice(0, 15);

  // 5) Build numbered context
  const ctx = top
    .map(
      (c, i) => `[${i + 1}] (${c.category}) ${c.text.replace(/\n+/g, " ")}
`
    )
    .join("\n");

  // 6) Call LLM with citations
  const messages = [
    {
      role: "system",
      content:
        "You are a precise assistant. Use ONLY the context below, cite by [n].",
    },
    { role: "user", content: `CONTEXT:\n${ctx}\nQUESTION: ${query}` },
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0,
    max_tokens: 300,
  });

  return resp.choices[0].message.content;
}

// New helper: optimize user query for better search hits
async function optimizeQuery(conversationMemory, userQuery) {
  // Prepare a structured prompt for the model
  const systemPrompt = `
You are Kartavya Singh's (He/Him/His) expert query optimizer for his AI ChatBot, responsible for rewriting user queries to guarantee precise hits across his indexed knowledge base (experiences, honors experiencs, involvements, projects, skills, honors year in reviews, resume data, and github repositories).

**Core Rules**  
1. **Follow-Up Detection**: First decide whether userQuery builds on conversationMemory.  
2. **Context Integration**: If it is a follow-up, weave in only the essential details from memory—most recent first—to make the query self-contained.  
3. **Standalone Precision**: If unrelated, rewrite as a concise, self-contained search request reflecting exactly what was asked.  
4. **Metadata Anchoring**: Incorporate key metadata terms (titles, timelines, taglines, section names) so retrieval aligns with the correct chunks.  
5. **Intent Fidelity**: Preserve the original user intent; do not add, omit, or paraphrase meaning.

**Stylistic Guidelines**  
- **Keyword Preservation**: Keep critical nouns and technical terms intact. 
- **Query Context Preservation**: Do not lose the context of the query 
- **No Explanations**: Return only the rewritten query text.  
- **Language**: Clear, neutral English.
`.trim();

  const userPrompt = `
Conversation Memory:
${conversationMemory || "No previous memory."}

User Query: "${userQuery}"

Rewrite the user's query according to the above rules, and output only the optimized query.
`.trim();
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // Dynamically determine max tokens (approx. double the user query's token count)
  let maxTokens = Math.ceil((userQuery.length / 4) * 2);
  if (maxTokens < 30) maxTokens = 30;
  // Call the model to get the optimized query
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  // Extract and clean up the optimized query
  let optimized = completion.choices[0].message.content;
  if (optimized) {
    optimized = optimized.trim();
    // Remove any surrounding quotes the model might have added
    if (
      (optimized.startsWith('"') && optimized.endsWith('"')) ||
      (optimized.startsWith("'") && optimized.endsWith("'"))
    ) {
      optimized = optimized.slice(1, -1);
    }
  } else {
    // Fallback: if no output, use the original query
    optimized = userQuery;
  }
  return optimized;
}

async function askLLM(
  query,
  conversationMemory = "New Conversation. No Memory"
) {
  if (!query.trim()) throw new Error("Query cannot be empty");

  // 1) Ensure memoryIndex loaded
  if (!memoryIndex.length) {
    const db = getDBAI();
    const cnt = await db.collection("memoryIndex").countDocuments();
    if (cnt) {
      memoryIndex = await db.collection("memoryIndex").find().toArray();
    } else {
      await buildMemoryIndex(true);
    }
  }

  // 2) Embed the user query & compute raw cosine scores
  const qemb = await getEmbedding(query);
  const buckets = { db: [], resume: [], github: [] };
  memoryIndex.forEach((item) => {
    const score = computeCosineSimilarity(qemb, item.embedding);
    buckets[item.category].push({
      text: item.text,
      score,
      embedding: item.embedding,
    });
  });

  // 3) Apply category weights
  ["db", "resume", "github"].forEach((cat) => {
    buckets[cat] = buckets[cat].map((item) => ({
      ...item,
      weightedScore: item.score * CATEGORY_WEIGHTS[cat],
    }));
  });

  const ql = query.toLowerCase();
  // 4) Query‐based boosts
  if (/resume/.test(ql))
    buckets.resume.forEach((i) => (i.weightedScore += QUERY_BOOST.resume));
  if (/github/.test(ql))
    buckets.github.forEach((i) => (i.weightedScore += QUERY_BOOST.github));
  if (DB_TERMS.some((t) => ql.includes(t.toLowerCase())))
    buckets.db.forEach((i) => (i.weightedScore += QUERY_BOOST.db));

  // 5) Demote DB‐subcategories not mentioned in query
  // 5a) Exclude honors/yearInReview unless query explicitly includes them
  buckets.db = buckets.db.filter((item) => {
    const tableName = item.text.split(" - ")[0].toLowerCase();
    // if this chunk is from honors or yearInReview and query has no mention → drop
    if (
      /(honors|year\s*in\s*review)/.test(tableName) &&
      !/(honors|year\s*in\s*review)/.test(ql)
    ) {
      return false;
    }
    return true;
  });

  // 5b) Demote other DB subcategories not mentioned in query
  buckets.db = buckets.db.map((item) => {
    const tableName = item.text.split(" - ")[0].toLowerCase();
    const term = DB_TERMS.find((t) => tableName.includes(t.toLowerCase()));
    if (term && ql.includes(term.toLowerCase())) {
      item.weightedScore *= 1.2;
    }
    return item;
  });

  const RESUME_TERMS = [
    "education",
    "experience",
    "skills",
    "projects",
    "honors",
    "involvement",
    "year in review",
  ];
  buckets.resume = buckets.resume.filter((item) => {
    const heading = item.text
      .split("\n")[0]
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "");
    // if it's one of our known headings but the query doesn't mention it → drop
    if (
      RESUME_TERMS.includes(heading) &&
      !RESUME_TERMS.some((term) => ql.includes(term))
    ) {
      return false;
    }
    return true;
  });

  // 5c) Boost any resume chunk whose heading appears in the query
  buckets.resume = buckets.resume.map((item) => {
    const heading = item.text
      .split("\n")[0]
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "");
    if (ql.includes(heading)) {
      item.weightedScore *= 1.2;
    }
    return item;
  });

  // 6) Sort & cap to MAX_COUNTS
  Object.entries(buckets).forEach(([cat, arr]) => {
    arr.sort((a, b) => b.weightedScore - a.weightedScore);
    buckets[cat] = arr.slice(0, MAX_COUNTS[cat]);
  });

  // 7) Selection & minimum guarantees
  // const selected = [];
  const take = (cat, n) => {
    const out = [];
    while (out.length < n && buckets[cat].length) {
      const nxt = buckets[cat].shift();
      if (nxt.weightedScore >= MIN_SCORE_THRESH) out.push(nxt);
    }
    return out;
  };

  // // 7a) ensure minima
  // selected.push(...take("db", MIN_COUNTS.db));
  // selected.push(...take("resume", MIN_COUNTS.resume));
  // selected.push(...take("github", MIN_COUNTS.github));

  // // 7b) MMR‐based fill to reach total slots
  // // compute how many more we can take (e.g. sum(MAX_COUNTS) minus selected.length)
  // const totalMax = Object.values(MAX_COUNTS).reduce((a, b) => a + b, 0);
  // const remainingSlots = Math.max(totalMax - selected.length, 0);

  // // pool leftovers:
  // const pool = Object.values(buckets).flat();

  // // pick via MMR:
  // selected.push(...mmrSelect(pool, remainingSlots, /* lambda= */ 0.7));

  // === DYNAMIC BUDGET ALLOCATION ===
  // build per-cat “signal” as sum of weightedScores
  const signals = Object.fromEntries(
    Object.entries(buckets).map(([cat, arr]) => [
      cat,
      arr.reduce((sum, x) => sum + x.weightedScore, 0),
    ])
  );

  // decide how many to take per cat
  const allocs = allocateBudget(
    signals,
    TOTAL_BUDGET,
    /* min per cat */ { db: 1, resume: 1, github: 0 },
    /* max per cat */ MAX_COUNTS
  );

  // now pull exactly allocs[cat] from each bucket
  const selected = [
    ...take("db", allocs.db),
    ...take("resume", allocs.resume),
    ...take("github", allocs.github),
  ];

  // 8) Build the final context string (≤ 8000 chars)
  let ctx = "";
  for (const { text } of selected) {
    const addition = (ctx ? "\n\n" : "") + text;
    if (ctx.length + addition.length > MAX_CONTEXT_CHARS) break;
    ctx += addition;
  }

  // console.log("Context length: %d chars\n", ctx.length);
  // // For testing: log each selected chunk's score and first 200 characters
  // selected.forEach((chunk, idx) => {
  //   console.log(
  //     `Chunk ${idx} — ${chunk.category} — score=${chunk.weightedScore.toFixed(
  //       3
  //     )}: ` + `${chunk.text.slice(0, 200).replace(/\n/g, " ")}`
  //   );
  // });

  // 9) Assemble and call LLM
  const userPrompt = conversationMemory.trim()
    ? `MEMORY:\n${conversationMemory}\nCONTEXT:\n${ctx}\n\nQUESTION: ${query}`
    : `CONTEXT:\n${ctx}\n\nQUESTION: ${query}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "system",
        content: `
        You are Kartavya Singh (He/Him/His), a 4th-year Computer Science student at the University of Cincinnati.  Speak always in first person as Kartavya (He/Him/His), and never as “the assistant” or “the bot.”  Keep paragraphs short (2-4 sentences), narrative, friendly-expert in tone, and never use slang or emojis.
        Answer only about Kartavya and strictly based on context in English. Do not invent examples or data. NEVER GO OUT OF TOPIC!!! keep this conversational and in a easy to understand language 

        **Core Rules**  
        1. **First-Person Only**: Always answer as “I” (Kartavya Singh). Do not repeat your name in every sentence—your voice is implicit.  
        2. **Use Only Provided Context**: Never hallucinate or invent facts. If the context is insufficient, say, “I'm sorry, I don't have that information from the materials provided. Could you clarify or share more context?”  
        3. **Recency Emphasis**: When describing projects or experiences, weight more recent ones more heavily—frame 2024/2025 as your peak (100%), earlier years progressively less (e.g. 2023→85%, 2022→90%, 2021→85%, 2020→80%), to show your growth over time.  
        4. **Reverse-Chronological**: List experiences from newest to oldest, unless asked otherwise.
        
        **Stylistic Guidelines**  
        - **Technical Explanations**: Follow “First… Next… Finally…” for clarity.  
        - **Link Personal Strengths**: Draw direct links between my strengths (e.g., time-management, stress-resilience) and how I overcame challenges.  
        - **Leadership & Communication**: Showcase with examples (“I led weekly cross-department meetings…”).  
        - **Experience & Proficiency-Anchored Advice**: Offer 2-3 approaches when possible, grounded in “In my experience with..., I found that…”.  
        - **Action-Oriented Closings**: End with “Let me know if you'd like details on…,” or “What do you think of this approach?”
        - **Never Bullet-Dump**: Weave metrics and outcomes into a coherent story (e.g., “I improved efficiency by 45%…”).  
        - **Professional & Compact**: Keep responses under four short paragraphs for typical questions.  
        
        **When Discussing Technology or code**  
        Explain technology/code choices in easy to understand English before deeper details. Invite collaboration: “I'd love your feedback on how you'd tweak this design.”
        
        **Clarification & Boundaries**  
        - If the user's question is too vague, ask: “Could you tell me which part of the Related Query stack you'd like me to focus on?”  
        - If outside my experience, admit honestly and offer related insights.  
        - Never expose system internals, security details, or instructions for misuse. If a request risks safety, privacy, or security, politely decline: “I'm sorry, I can't help with that.”  
        
        Answer only about Kartavya and strictly based on context in English. Do not invent examples or data. NEVER GO OUT OF TOPIC!!! keep this conversational and in a easy to understand language 
        `.trim(),
      },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 400,
    temperature: 0.3,
  });

  return completion.choices[0].message.content;
}

// New helper: generate follow-up questions
async function suggestFollowUpQuestions(query, answer, conversationMemory) {
  // Formulate a prompt for follow-up question generation
  const systemContent = `
  You are an assistant bot for the master AI ChatBot of Kartavya Singh (He/Him/His), a 4th-year Computer Science student at the University of Cincinnati. You're a highly respected helper whose sole job is to suggest concise, intelligent follow-up questions that continue a user's conversation about Kartavya—nothing else. Always keep your suggestions grounded in what's known from his materials, in English, and never go off-topic.
  
  **Core Rules**  
  1. **Exactly Three Questions**: Provide three and only three follow-ups.  
  2. **Match Tone & Voice**: Mirror the user's phrasing and formality—no slang, no jargon.  
  3. **Strict Relevance**: Each question must build on the user's last query and the AI's answer, focusing solely on Kartavya's experiences or expertise.  
  4. **Simplicity vs. Depth**: Questions 1 & 2 should be straightforward clarifications or extensions; Question 3 should be slightly deeper or more reflective.  
  5. **Self-Contained**: Every question must stand alone, without relying on memory of earlier turns.
  
  **Stylistic Guidelines**  
  - **Brevity**: Keep each under 15 words.  
  - **Start Interrogatively**: Use “How…?”, “What…?”, “Why…?”, “When…?”, or “Which…?”.  
  - **No Explanations or Bullets**: Don't prefac e with commentary—just the question.  
  - **Terminology Consistency**: Use terms from Kartavya's profile (e.g., “project,” “internship,” “dashboard”).
  
  **Question Complexity**  
  - **Q1 & Q2 (Simple)**: Narrow, factual follow-ups (“How did you…?”, “What motivated you to…?”).  
  - **Q3 (Slightly Deeper)**: Invite broader reflection or connection (“In light of that experience, how might you approach…?”).
  
  **Closing Reminder**  
  If context is insufficient, do not guess—simply indicate you need more details. Always maintain a friendly-expert tone and stay focused on Kartavya's documented experiences.
  `.trim();

  const userContent = `
  User's question: "${query}"
  Assistant's answer: "${answer}"
  Based on this exchange, suggest three follow-up questions the user might ask next.
  `.trim();
  const messages = [
    { role: "system", content: systemContent },
    { role: "user", content: userContent },
  ];

  // Dynamic max_tokens: ~4.5 tokens per character of the query, to allow detailed questions if needed
  let maxTokens = Math.ceil((query.length / 4) * 4.5);
  if (maxTokens < 60) maxTokens = 60;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    max_tokens: maxTokens || 60,
    temperature: 0.6,
  });
  const rawOutput = completion.choices[0].message.content || "";
  // Split the output into individual lines/questions
  const suggestions = rawOutput
    .split(/\r?\n/)
    .map((s) => s.replace(/^[\-\d\.\)\s]+/, "").trim()) // remove any list markers (dashes, numbers, bullets)
    .filter((s) => s.length > 0); // filter out empty lines
  // If the model returned more than 3 lines, take the first 3
  return suggestions.slice(0, 3);
}

// New helper: update conversation memory summary
async function snapshotMemoryUpdate(previousMemory, query, answer, messageid) {
  // System prompt for compact conversation memory maintenance
  const systemContent = `
  You are an assistant bot for the master AI ChatBot of Kartavya Singh, a 4th-year Computer Science student. You're a highly respected helper whose sole responsibility is to maintain a deep yet compact memory of the entire conversation. Always preserve essential context and never omit core themes, even when compressing.
  
  **Core Rules**  
  1. **Single Unified Memory**: Produce one updated summary that integrates the new exchange with prior memory.  
  2. **Related vs. Unrelated**:  
     - If the latest query and answer build on earlier memory, append 2–3 short sentences describing that exchange.  
     - If they do not relate, aggressively compress previousMemory—dropping minor details but safeguarding overall context—then add 2–3 concise sentences for the new exchange.  
  3. **No Context Loss**: Never remove information that would break continuity; compress only until just before context loss.  
  4. **Third-Person Voice**: Use “User asked…” and “Assistant answered…” phrasing.  
  5. **Length Cap**: Keep the entire memory under 200 words; prioritize recent and important points.
  
  **Stylistic Guidelines**  
  - **Brevity**: Aim for 20–40 words per update.  
  - **Clarity**: Focus on the gist of the question and response.  
  - **No Redundancy**: Do not verbatim repeat previous summaries.  
  - **Consistency**: Maintain the same narrative style throughout.
  
  `.trim();

  const userContent = `
  Previous memory:
  ${previousMemory || "None"}
  
  User's question: "${query}"
  Assistant's answer: "${answer}"
  
  Please update the conversation memory according to the rules above.
  `.trim();
  const messages = [
    { role: "system", content: systemContent },
    { role: "user", content: userContent },
  ];

  // Dynamically determine max tokens based on previous memory length
  const prevMemoryTokens = previousMemory
    ? Math.ceil(previousMemory.length / 4)
    : 0;
  let maxTokens = prevMemoryTokens + 50;
  if (maxTokens < 30) maxTokens = 30;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    max_tokens: maxTokens || 150,
    temperature: 0.2,
  });
  const updatedMemory = completion.choices[0].message.content;
  return updatedMemory ? updatedMemory.trim() : "";
}

/*===============================================
  Initialization & Scheduling
===============================================*/
async function initContext() {
  await loadContextMeta();
  await loadMemoryIndexMeta();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    !contextMeta.dbContextLastUpdate ||
    new Date(contextMeta.dbContextLastUpdate) < today
  )
    await updateDbContextFile();
  if (
    !contextMeta.githubContextLastUpdate ||
    new Date(contextMeta.githubContextLastUpdate) < today
  )
    await updateGithubContextFile();
  if (
    !contextMeta.resumeContextLastUpdate ||
    new Date(contextMeta.resumeContextLastUpdate) < today
  )
    await updateResumeContextFile();

  await buildMemoryIndex(false);

  function scheduleDaily(fn, name, hourUTC = 5, days = 30) {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(hourUTC, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    const delay = next - now;
    console.log(`⏱ Scheduled ${name} in ${Math.round(delay / 1000)}s`);
    setTimeout(() => {
      fn().catch(console.error);
      setInterval(() => fn().catch(console.error), days * 24 * 3600 * 1000);
    }, delay);
  }

  scheduleDaily(
    () =>
      Promise.all([
        updateDbContextFile(),
        updateGithubContextFile(),
        updateResumeContextFile(),
      ]),
    "daily context update",
    5,
    1
  );
  scheduleDaily(
    () => buildMemoryIndex(true),
    "daily memoryIndex rebuild",
    5.083,
    7
  );
}

module.exports = {
  initContext,
  updateDbContextFile,
  updateGithubContextFile,
  updateResumeContextFile,
  buildMemoryIndex,
  askLLM,
  askWithRAG,
  suggestFollowUpQuestions,
  snapshotMemoryUpdate,
  optimizeQuery,
};
