## Migration Guide: AI Companion → Next.js (App Router)

Use this checklist to port the AI Companion feature from this MERN reference repo into a Next.js project.

### Backend files

- [ ] **File**: `backend/controllers/aiContextManager.js`
  - **What it does**: End‑to‑end RAG orchestration: loads/aggregates sources (MongoDB snapshots, GitHub API, Resume PDF), chunks, embeds via OpenAI, persists embeddings in MongoDB (`memoryIndex`) with Atlas Vector Search; exposes ask/optimize/suggestions/memory helpers and init/scheduling.
  - **Needed for Next.js?** Yes.
  - **Next.js location**:
    - Core server utilities: `app/(server)/lib/ai/aiContextManager.ts` (or `src/lib/ai/...`).
    - Long‑running/scheduled work: consider a separate worker/server or Vercel Cron hitting API routes.
  - **Modifications**:
    - Replace CommonJS with ESM/TypeScript modules.
    - Split concerns: loaders (DB/GitHub/Resume), chunkers, embeddings, vector search, and chat into separate modules under `lib/ai/` for testability.
    - Replace Fastify request/responses with pure functions called from Next.js API route handlers (`app/api/.../route.ts`).
    - Ensure MongoDB Atlas Search index creation is idempotent in serverless (or run via a one‑off admin route/seed script).
    - Handle environment variables via `process.env.*` in Next; do not initialize clients at import time (lazy init for serverless).
  - **Dependencies**:
    - `openai`, `mongodb`, `pdf-parse`, `node-fetch` (or native `fetch` in Next.js), optionally `dotenv` (local dev only).

- [ ] **File**: `backend/routes/aiRoutes.js`
  - **What it does**: Fastify routes exposing: `GET/POST /api/ai/create-index`, `POST /api/ai/ask-chat`, `POST /api/ai/suggestFollowUpQuestions`, `POST /api/ai/snapshotMemoryUpdate`, `POST /api/ai/optimize-query`.
  - **Needed for Next.js?** Yes.
  - **Next.js location**:
    - App Router API routes:
      - `app/api/ai/create-index/route.ts`
      - `app/api/ai/ask-chat/route.ts`
      - `app/api/ai/suggest-follow-ups/route.ts`
      - `app/api/ai/snapshot-memory/route.ts`
      - `app/api/ai/optimize-query/route.ts`
  - **Modifications**:
    - Convert route handlers to `export async function POST(req: Request) { ... }` (and GET if needed), parse JSON via `await req.json()`; return `NextResponse.json(...)`.
    - Call the refactored `lib/ai/*` functions; do not keep Fastify.
    - Stream responses if needed (optional); otherwise return JSON.
  - **Dependencies**: none beyond the underlying `lib/ai` modules.

- [ ] **File**: `backend/config/openai.js`
  - **What it does**: Creates a configured OpenAI SDK client.
  - **Needed for Next.js?** Yes.
  - **Next.js location**: `app/(server)/lib/ai/openai.ts` (or `src/lib/ai/openai.ts`).
  - **Modifications**:
    - ESM/TypeScript export; lazy instantiate the client to avoid cold‑start penalty.
    - Read `process.env.OPENAI_API_KEY` via Next.js runtime; ensure not exposed to client.
  - **Dependencies**: `openai`.

- [ ] **File**: `backend/config/mongodb.js`
  - **What it does**: Connects to MongoDB and returns proxied primary and AI DBs; simple metrics wrappers.
  - **Needed for Next.js?** Yes.
  - **Next.js location**: `app/(server)/lib/db/mongodb.ts` (or `src/lib/db/mongodb.ts`).
  - **Modifications**:
    - Use a cached singleton pattern for serverless (global cache) to reuse the `MongoClient` across invocations.
    - Remove Fastify‑specific metrics; keep plain helpers `getDB()` and `getDBAI()`.
    - Read `MONGO_URI`, `MONGO_DB_NAME`, `MONGO_DB_NAME_AI` from env (`.env.local`).
  - **Dependencies**: `mongodb`.

- [ ] **File**: `backend/server.js`
  - **What it does**: Fastify setup, CORS, routes mount, AI context initialization and scheduled tasks.
  - **Needed for Next.js?** Partially.
  - **Next.js location**: N/A (Next.js provides the server). Extract useful logic to:
    - `lib/ai/initContext.ts` (administrative bootstrap used by an admin API route or a seed script).
    - Scheduling via Vercel Cron calling `create-index` daily/weekly.
  - **Modifications**:
    - Remove Fastify server; migrate CORS and cookies to Next config/middleware if needed.
    - Replace `setInterval` scheduling with platform cron (e.g., Vercel Cron) hitting API routes.
  - **Dependencies**: none beyond Next.js platform; keep any logging logic within API handlers or a separate admin page.

### Frontend files

- [ ] **File**: `frontend/src/components/WindowModal/AIChatTab.js`
  - **What it does**: React UI for AI chat: prompt input, mic button (Web Speech API), message rendering, follow‑ups, TTS via `speechSynthesis`.
  - **Needed for Next.js?** Yes.
  - **Next.js location**: `app/(ui)/components/AIChat/AIChat.tsx` (or `src/components/AIChat/AIChat.tsx`).
  - **Modifications**:
    - Ensure it only runs on client: add `'use client'` at top.
    - Replace `API_URL` prop with relative calls to Next API routes (`/api/ai/*`).
    - Guard Web Speech API access with `typeof window !== 'undefined'` checks (already mostly handled via hook); keep TTS client‑only.
    - Optionally migrate CSS to CSS Modules or Tailwind; keep classes if you prefer.
  - **Dependencies**: `react-markdown`, `framer-motion`, `@react-spring/web` (optional), uses browser Web APIs (`SpeechSynthesis`, Web Speech API).

- [ ] **File**: `frontend/src/hooks/useSpeechInput.js`
  - **What it does**: Custom hook wrapping Web Speech API for mic input and interim/final transcription.
  - **Needed for Next.js?** Yes (client only).
  - **Next.js location**: `app/(ui)/components/AIChat/useSpeechInput.ts` (or `src/hooks/useSpeechInput.ts`).
  - **Modifications**:
    - Add `'use client'` at the top of files using this hook; hook itself should feature runtime guards against `window` access.
    - Convert to TypeScript types if desired; no server changes.
  - **Dependencies**: none (uses native browser APIs).

- [ ] **File**: `frontend/src/styles/AIChatBot.css` (referenced by `AIChatTab.js`)
  - **What it does**: Styles for the AI chat interface.
  - **Needed for Next.js?** Optional.
  - **Next.js location**: `app/(ui)/components/AIChat/AIChat.module.css` (recommended) or keep global CSS via `app/globals.css`.
  - **Modifications**: Convert to CSS Modules or Tailwind as preferred.
  - **Dependencies**: none.

### Files mentioned in request but not present in repo

- [ ] `backend/services/aiService.js` — Not present. Use `lib/ai/aiContextManager` + split helpers instead.
- [ ] `backend/routes/ai.js` — Not present. Use the mapped Next.js API routes listed above.
- [ ] `backend/utils/*` loaders — Not present as a `utils` folder; loader logic resides in `aiContextManager.js` (split into `lib/ai/loaders/*` in Next.js).
- [ ] `frontend/components/AICompanion.jsx` — Not present. Use `AIChat` component (ported from `AIChatTab.js`).
- [ ] `frontend/components/VoiceInput.jsx` — Not present. Voice is provided by `useSpeechInput` hook.

### Suggested module breakdown in Next.js

- [ ] `app/api/ai/create-index/route.ts` → calls `updateDbContextFile`, `updateGithubContextFile`, `updateResumeContextFile`, then `buildMemoryIndex(true)`.
- [ ] `app/api/ai/ask-chat/route.ts` → calls `askLLM` (or `askWithRAG` if Atlas Search is configured).
- [ ] `app/api/ai/suggest-follow-ups/route.ts` → calls `suggestFollowUpQuestions`.
- [ ] `app/api/ai/snapshot-memory/route.ts` → calls `snapshotMemoryUpdate`.
- [ ] `app/api/ai/optimize-query/route.ts` → calls `optimizeQuery`.
- [ ] `app/(server)/lib/ai/openai.ts` → OpenAI client init.
- [ ] `app/(server)/lib/db/mongodb.ts` → MongoDB client + `getDB()`/`getDBAI()`.
- [ ] `app/(server)/lib/ai/loaders/{db,github,resume}.ts` → split from `aiContextManager`.
- [ ] `app/(server)/lib/ai/chunkers/{db,github,resume}.ts` → split chunking logic.
- [ ] `app/(server)/lib/ai/embeddings.ts` → wrapper for text embeddings.
- [ ] `app/(server)/lib/ai/indexer.ts` → `buildMemoryIndex` + `ensureSearchIndex`.
- [ ] `app/(server)/lib/ai/rag.ts` → `semanticSearchWithAtlas`, `askWithRAG`, `askLLM`.
- [ ] `app/(ui)/components/AIChat/AIChat.tsx` and `app/(ui)/components/AIChat/useSpeechInput.ts` → client UI & mic.

### Environment variables (Next.js `.env.local`)

- [ ] `OPENAI_API_KEY`
- [ ] `MONGO_URI`
- [ ] `MONGO_DB_NAME`
- [ ] `MONGO_DB_NAME_AI`
- [ ] `GITHUB_TOKEN` (optional: enables GitHub context + READMEs)

### Platform considerations

- [ ] Atlas Vector Search index creation should not run on every serverless invocation. Prefer: one‑time admin route (secured) or migration script during deployment.
- [ ] Scheduled refresh/rebuild: use Vercel Cron (e.g., daily) to hit `/api/ai/create-index`.
- [ ] Large embedding runs can exceed serverless timeouts; consider chunked background processing or a dedicated job runner for big datasets.

### NPM packages used by AI Companion code

- Backend:
  - [ ] `openai`
  - [ ] `mongodb`
  - [ ] `pdf-parse`
  - [ ] `node-fetch` (can be replaced by built‑in `fetch` in Next.js runtime)
  - [ ] `dotenv` (dev only; Next uses `.env.local` automatically in dev/build)

- Frontend:
  - [ ] `react-markdown`
  - [ ] `framer-motion`
  - [ ] `@react-spring/web`
  - [ ] (Native) Web Speech API and `speechSynthesis` (no package)

### Minimal code migration stubs (sketch)

- [ ] `app/api/ai/ask-chat/route.ts`
```ts
import { NextResponse } from 'next/server';
import { askLLM } from '@/app/(server)/lib/ai/rag';

export async function POST(req: Request) {
  const { query, conversationMemory } = await req.json();
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
  }
  const answer = await askLLM(query, conversationMemory || '');
  return NextResponse.json({ answer });
}
```

- [ ] `app/(server)/lib/db/mongodb.ts` (singleton)
```ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI!;
const primaryDbName = process.env.MONGO_DB_NAME || 'KartavyaPortfolioDB';
const aiDbName = process.env.MONGO_DB_NAME_AI || 'KartavyaPortfolioDBAI';

let client: MongoClient | null = null;
let promise: Promise<MongoClient> | null = null;

async function getClient() {
  if (client) return client;
  if (!promise) promise = new MongoClient(uri).connect();
  client = await promise;
  return client;
}

export async function getDB() {
  const c = await getClient();
  return c.db(primaryDbName);
}

export async function getDBAI() {
  const c = await getClient();
  return c.db(aiDbName);
}
```

---

This checklist maps every AI Companion file to its Next.js counterpart, outlines required changes, and lists dependencies to install. Apply the module split incrementally if preferred.