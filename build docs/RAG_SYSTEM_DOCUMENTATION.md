# RAG System Architecture & Implementation Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Document Processing Pipeline](#document-processing-pipeline)
3. [Chunking Strategies](#chunking-strategies)
4. [Vector Search & Retrieval](#vector-search--retrieval)
5. [Re-ranking System](#re-ranking-system)
6. [Query Processing](#query-processing)
7. [Design Decisions & Rationale](#design-decisions--rationale)
8. [Visual Flow Diagrams](#visual-flow-diagrams)

---

## System Overview

### Architecture Type
**Pure Vector Search (Not Hybrid)**

Your RAG system uses **pure vector similarity search** via MongoDB Atlas Vector Search. There is **no hybrid search** implementation combining keyword search with vector search. The system relies entirely on semantic similarity through embeddings.

### High-Level Flow

```
User Query
    ↓
Query Analysis (Category Detection)
    ↓
Query Embedding Generation (OpenAI text-embedding-3-small)
    ↓
Vector Search (MongoDB Atlas $vectorSearch)
    ↓
Category/Year Filtering (Post-search)
    ↓
Re-ranking (Multi-signal scoring)
    ↓
Top-K Selection (Top 5 chunks)
    ↓
Context Construction
    ↓
LLM Generation (OpenRouter)
    ↓
Response + Sources + Follow-up Questions
```

---

## Document Processing Pipeline

### Phase 1: Document Loading

**Location:** `lib/ai/loaders/pdf-loader.ts`

**Process:**
1. **PDF Loading**: Scans `/documents` folder for all `.pdf` files
2. **PDF Parsing**: Uses `pdf-parse-new` library to extract text
3. **Artifact Cleaning**: Removes page numbers, form feeds, normalizes whitespace
4. **Type Detection**: Classifies documents as:
   - `resume` - Resume/CV documents
   - `linkedin` - LinkedIn profile exports
   - `journey` - Journey/reflection documents
   - `generic` - Fallback for unrecognized types
5. **Metadata Extraction**: Extracts year from filename (e.g., `journey_fy-2025-2026.pdf` → `2025`)

**GitHub Loading:**
- Fetches repositories via GitHub API
- Extracts README content
- Captures metadata: name, description, language, stars, topics, updatedAt

### Phase 2: Chunking

**Location:** `lib/ai/chunking/`

Documents are chunked using **type-specific strategies**:

#### 2.1 Professional Chunker (`professional-chunker.ts`)

**For:** Resume & LinkedIn PDFs

**Strategy:**
- **Section-Aware**: Detects headers (EXPERIENCE, EDUCATION, SKILLS, etc.) case-insensitively
- **Job Entry Granularity**: 
  - Resume: Each job = 1 chunk (detailed metadata per job)
  - LinkedIn: Multiple jobs per chunk (less granular)
- **Metadata Extraction**: Parses pipe-delimited formats:
  - `Company (Industry) | Position | Location | Date Range`
  - Extracts: company, position, location, dateRange, industry, year
- **No Overlap**: Professional documents use independent chunks (no overlap needed)

**Chunk Size:** 400-800 tokens per chunk

**Metadata Captured:**
```typescript
{
  source: string,
  section: string,
  company?: string,
  position?: string,
  location?: string,
  dateRange?: string,
  industry?: string,
  year?: string
}
```

#### 2.2 Narrative Chunker (`narrative-chunker.ts`)

**For:** Journey/reflection documents

**Strategy:**
- **Paragraph-Aware**: Respects paragraph boundaries (empty lines)
- **Smart Overlap**: Uses intelligent sentence-based overlap:
  - Maximum: 30 words OR 50 tokens (whichever is smaller)
  - Prefers complete sentences
  - Falls back to last N words if sentences don't fit
- **Strict Token Limits**:
  - Target: 450 tokens
  - Soft Max: 500 tokens
  - Hard Max: 600 tokens (absolute limit)
- **Fiscal Year Extraction**: Extracts from filename (e.g., `FY25-26`)

**Chunk Size:** 450-500 tokens (target), max 600 tokens

**Overlap Logic:**
```typescript
// From boundary-detector.ts
calculateSmartOverlap(previousChunk, maxWords=30, maxTokens=50)
// Returns: Last complete sentence(s) that fit within constraints
```

**Why Overlap?**
- Journey documents are narrative/continuous
- Overlap preserves context across chunk boundaries
- Prevents information loss at boundaries

#### 2.3 Generic Chunker (`generic-chunker.ts`)

**For:** Unrecognized document types

**Strategy:**
- **Paragraph-Based**: Splits on empty lines (`\n\n+`)
- **Target Size**: 1000 characters per chunk
- **No Overlap**: Simple sequential chunking

#### 2.4 Markdown Chunker (`markdown-chunker.ts`)

**For:** GitHub README files

**Strategy:**
- **Section-Aware**: Detects markdown headers (`# Header`, `## Header`)
- **Metadata Prepend**: Adds repo metadata to each chunk:
  ```
  Repository: repo-name
  Description: ...
  Language: TypeScript
  Stars: 42
  Topics: ai, rag, ...
  ```
- **Smart Overlap**: Uses paragraph-based overlap (25 words max) for large sections
- **Target Size**: 600 words, max 800 words per chunk

**Why Section-Aware?**
- READMEs have clear structure (Installation, Usage, API, etc.)
- Preserves semantic boundaries
- Better retrieval when querying specific aspects

### Phase 3: Embedding Generation

**Location:** `lib/ai/embeddings.ts`

**Model:** `text-embedding-3-small` (OpenAI)
- **Dimensions:** 1536
- **Batch Size:** 50 chunks per batch
- **Rate Limiting:** 100ms delay between batches

**Process:**
1. Filter empty texts
2. Process in batches of 50
3. Generate embeddings via OpenAI API
4. Return array of 1536-dimensional vectors

**Why Batch Processing?**
- Avoids API rate limits
- More efficient than sequential calls
- Handles large document sets gracefully

### Phase 4: Vector Storage

**Location:** `lib/ai/vector-store.ts`

**Database:** MongoDB Atlas
- **Collection:** `memoryIndex`
- **Vector Index:** `vector_index` (created in MongoDB Atlas UI)

**Document Structure:**
```typescript
{
  text: string,              // Chunk text
  embedding: number[],      // 1536-dimensional vector
  category: string,          // 'resume', 'linkedin', 'journey', 'github', 'generic'
  subcategory?: string,      // 'experience', 'skills', 'projects', etc.
  metadata: {
    source: string,         // Filename or repo name
    section?: string,
    company?: string,
    year?: string,
    // ... other metadata
  },
  createdAt: Date
}
```

**Incremental Updates:**
- File change detection via hash comparison
- Only re-processes changed files
- Deletes old embeddings before inserting new ones

---

## Vector Search & Retrieval

### Search Type: Pure Vector Search

**No Hybrid Search**: The system uses **only vector similarity search**. There is no keyword/BM25 search combined with vector search.

### Search Implementation

**Location:** `lib/ai/vector-store.ts` → `smartSearch()`

**Process:**

1. **Query Embedding**: User query → 1536-dimensional vector (same model as documents)

2. **MongoDB Atlas Vector Search**:
   ```typescript
   $vectorSearch: {
     index: 'vector_index',
     queryVector: queryEmbedding,
     path: 'embedding',
     numCandidates: limit * 20,  // Get 20x candidates for filtering
     limit: limit * 4,            // Get 4x results for re-ranking
   }
   ```

   **Key Parameters:**
   - `numCandidates`: Searches `limit * 20` candidates (e.g., 100 for limit=5)
   - `limit`: Retrieves `limit * 4` results (e.g., 20 for limit=5)
   - **Why 4x?** To have enough candidates for re-ranking

3. **Post-Search Filtering**:
   - **Category Filter**: If query analysis detects categories, filter by `category` field
   - **Year Filter**: If temporal query detected, filter by `metadata.year`
   - Uses MongoDB `$match` aggregation stage

4. **Re-ranking**: Multi-signal scoring (see Re-ranking section)

5. **Top-K Selection**: Returns top `limit` results (default: 5)

### Why Pure Vector Search?

**Advantages:**
- **Semantic Understanding**: Captures meaning, not just keywords
- **Synonym Handling**: "AI projects" matches "machine learning work"
- **Context Awareness**: Understands relationships between concepts
- **Simpler Architecture**: No need to maintain keyword indexes

**Trade-offs:**
- **No Exact Match Boost**: Can't boost exact keyword matches
- **No Typo Tolerance**: Misspellings may reduce similarity
- **Metadata Filtering**: Uses post-search filtering, not pre-filtering

---

## Re-ranking System

### Purpose

Re-ranking improves result quality by combining multiple signals beyond pure vector similarity.

**Location:** `lib/ai/vector-store.ts` → `reRankResults()`

### Re-ranking Signals

#### 1. Base Score: Vector Similarity
- **Weight:** 1.0x (base)
- **Source:** MongoDB Atlas `vectorSearchScore`
- **Range:** 0.0 - 1.0 (cosine similarity)

#### 2. Category Boost
- **Weight:** 1.15x - 1.3x multiplier
- **Categories:**
  ```typescript
  resume: 1.3x      // Highest priority
  linkedin: 1.25x
  journey: 1.2x
  github: 1.15x
  ```
- **Rationale:** Resume/LinkedIn contain most structured professional info

#### 3. Recency Boost
- **Weight:** 1.1x - 1.3x multiplier
- **Logic:**
  ```typescript
  Current year: 1.3x
  Last year: 1.2x
  Last 2 years: 1.1x
  Older: No boost
  ```
- **Rationale:** Recent information is more relevant for current status

#### 4. Chunk Quality Boost
- **Weight:** 1.1x multiplier
- **Condition:** Chunks with 100-300 words
- **Rationale:** Medium-length chunks have optimal information density

### Re-ranking Formula

```typescript
finalScore = baseScore 
           * categoryBoost 
           * recencyBoost 
           * qualityBoost
```

**Example:**
```
Base Score: 0.85
Category: resume (1.3x)
Year: 2025 (1.3x)
Words: 250 (1.1x)

Final Score: 0.85 * 1.3 * 1.3 * 1.1 = 1.58
```

### Why Re-ranking?

**Problem:** Pure vector similarity may rank older/less relevant chunks highly if they have high semantic similarity.

**Solution:** Re-ranking combines:
- Semantic similarity (what the user is asking about)
- Category relevance (where the answer likely is)
- Recency (when the information is from)
- Quality (how well-formed the chunk is)

**Result:** More relevant, recent, and high-quality results rise to the top.

---

## Query Processing

### Query Optimization: Currently NOT Used

**Important:** Your system does **NOT** currently optimize queries before retrieval. The `optimizeQuery()` function exists in `lib/ai/llm.ts` but is **not called** in the main query flow (`queryAI()`).

**Current Flow:**
```
User Query → Direct Embedding → Vector Search
```

**Available but Unused:**
```typescript
// lib/ai/llm.ts - optimizeQuery()
// This function exists but is NOT called in queryAI()
```

**What Query Optimization Would Do:**
- Expand queries: "AI work" → "artificial intelligence machine learning projects"
- Disambiguate: "recent job" → "current position at Hunch in 2025"
- Add context: Incorporate conversation history into query

**Why Not Used?**
- May introduce noise (over-expansion)
- Adds latency (extra LLM call)
- Current system works well without it

### Query Analysis: Category Detection

**Location:** `lib/ai/vector-store.ts` → `analyzeQueryForCategories()`

**Purpose:** Pre-filter search to relevant document categories

**Pattern Matching:**
```typescript
// Work/Experience
/work|job|experience|role|position|company/ → ['resume', 'linkedin']

// Journey/Story
/decision|learn|journey|why|story|approach/ → ['journey']

// Skills
/skill|technology|tool|tech stack/ → ['resume', 'linkedin']

// Projects
/project|build|built|created|developed|code|github/ → ['github', 'resume', 'linkedin']

// Education
/education|school|university|degree/ → ['resume', 'linkedin']
```

**How It Works:**
1. Lowercase query
2. Test regex patterns
3. Return matching categories
4. If no match, return `[]` (searches all categories)

**Example:**
```
Query: "What AI projects have you built?"
→ Categories: ['github', 'resume', 'linkedin']
→ Filters vector search to these categories only
```

### Query Transformation: None

**No Query Decomposition:** Queries are **not** broken into sub-queries.

**No Query Expansion:** Queries are **not** expanded with synonyms or related terms.

**No Query Rewriting:** Queries are used **as-is** for embedding generation.

**Rationale:**
- Simpler system
- Embeddings capture semantic relationships naturally
- Category filtering provides enough query refinement

---

## Design Decisions & Rationale

### 1. Why Pure Vector Search (Not Hybrid)?

**Decision:** Use only vector similarity search via MongoDB Atlas.

**Rationale:**
- **Semantic Understanding**: Captures meaning, not just keywords
- **Simpler Architecture**: No need to maintain keyword indexes
- **Good Enough**: Vector search performs well for this use case
- **Cost**: Hybrid search adds complexity without clear benefit

**Trade-off:** Can't boost exact keyword matches, but semantic similarity handles this well.

### 2. Why Type-Specific Chunking?

**Decision:** Different chunking strategies for resume, journey, GitHub, etc.

**Rationale:**
- **Resume/LinkedIn**: Structured data → section-aware chunking
- **Journey**: Narrative → paragraph-aware with overlap
- **GitHub**: Markdown → section-aware (respects headers)
- **Generic**: Fallback → simple paragraph chunking

**Benefit:** Each document type gets optimal chunking for its structure.

### 3. Why Smart Overlap for Journey Documents?

**Decision:** Use sentence-based overlap (max 30 words, 50 tokens) for journey docs.

**Rationale:**
- **Narrative Continuity**: Journey docs tell a story
- **Context Preservation**: Overlap prevents information loss at boundaries
- **Controlled Size**: Max constraints prevent overlap from consuming too much chunk budget

**Trade-off:** Slightly larger chunks, but better context preservation.

### 4. Why Re-ranking Instead of Better Embeddings?

**Decision:** Use multi-signal re-ranking on top of vector search.

**Rationale:**
- **Embeddings Are Good**: `text-embedding-3-small` already captures semantics well
- **Metadata Matters**: Category, recency, quality are important signals
- **Flexible**: Can adjust weights without retraining embeddings
- **Cost-Effective**: No need for more expensive embedding models

**Alternative Considered:** Use `text-embedding-3-large` (3072 dims) but decided re-ranking is more cost-effective.

### 5. Why 4x Candidates for Re-ranking?

**Decision:** Retrieve `limit * 4` results from vector search, then re-rank to `limit`.

**Rationale:**
- **More Candidates = Better Re-ranking**: Have enough options to choose from
- **Balance**: 4x is enough without being wasteful
- **Example:** For limit=5, retrieve 20 candidates, re-rank to top 5

**Trade-off:** Slightly more database work, but better final results.

### 6. Why Category Filtering (Post-Search)?

**Decision:** Filter by category **after** vector search, not before.

**Rationale:**
- **Vector Search First**: Get best semantic matches regardless of category
- **Then Filter**: Narrow down to relevant categories
- **Flexible**: Can disable filtering if no categories detected

**Alternative Considered:** Pre-filter by category, but decided post-filtering is more flexible.

### 7. Why No Query Optimization?

**Decision:** Use queries as-is, no LLM-based optimization.

**Rationale:**
- **Works Well**: Current system performs well without optimization
- **Latency**: Optimization adds extra LLM call (~200-500ms)
- **Cost**: Saves API calls
- **Simplicity**: Fewer moving parts

**Future Consideration:** Could add query optimization for complex queries, but not needed now.

### 8. Why Batch Embedding Generation?

**Decision:** Process embeddings in batches of 50.

**Rationale:**
- **Rate Limits**: OpenAI has rate limits per minute
- **Efficiency**: Batch processing is faster than sequential
- **Error Handling**: Easier to retry failed batches

**Trade-off:** Slightly more complex code, but handles large document sets reliably.

---

## Visual Flow Diagrams

### Document Indexing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT INDEXING                         │
└─────────────────────────────────────────────────────────────┘

1. File Change Detection
   ├─ Hash comparison (PDFs)
   ├─ UpdatedAt comparison (GitHub)
   └─ Only process changed files

2. Document Loading
   ├─ PDF Loader → Extract text, detect type, extract metadata
   └─ GitHub Loader → Fetch repos, extract READMEs

3. Type-Specific Chunking
   ├─ Resume → Section-aware, job-level chunks
   ├─ LinkedIn → Section-aware, multi-job chunks
   ├─ Journey → Paragraph-aware, smart overlap
   ├─ GitHub → Markdown section-aware
   └─ Generic → Paragraph-based

4. Embedding Generation
   ├─ Batch processing (50 chunks/batch)
   ├─ OpenAI text-embedding-3-small
   └─ 1536-dimensional vectors

5. Vector Storage
   ├─ MongoDB Atlas collection: memoryIndex
   ├─ Vector index: vector_index
   └─ Store: text + embedding + metadata

6. File Metadata Update
   └─ Store hash, chunk count, file size
```

### Query Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    QUERY PROCESSING                          │
└─────────────────────────────────────────────────────────────┘

User Query: "What AI projects have you built?"
    ↓
1. Query Analysis
   ├─ Category Detection: ['github', 'resume', 'linkedin']
   └─ No query optimization (not used)
    ↓
2. Query Embedding
   ├─ OpenAI text-embedding-3-small
   └─ 1536-dimensional vector
    ↓
3. Vector Search (MongoDB Atlas)
   ├─ numCandidates: 100 (limit * 20)
   ├─ limit: 20 (limit * 4)
   └─ Returns: 20 candidates with vectorSearchScore
    ↓
4. Post-Search Filtering
   ├─ Category Filter: ['github', 'resume', 'linkedin']
   └─ Year Filter: None (no temporal query detected)
    ↓
5. Re-ranking
   ├─ Base Score: vectorSearchScore
   ├─ Category Boost: github (1.15x), resume (1.3x), linkedin (1.25x)
   ├─ Recency Boost: 2025 (1.3x), 2024 (1.2x)
   └─ Quality Boost: 100-300 words (1.1x)
    ↓
6. Top-K Selection
   └─ Return top 5 chunks (sorted by finalScore)
    ↓
7. Context Construction
   ├─ Join chunks with separator: "\n\n---\n\n"
   └─ Trim to 8000 characters if needed
    ↓
8. LLM Generation
   ├─ OpenRouter API
   ├─ Model: meta-llama/llama-3.1-8b-instruct:free
   ├─ System Prompt: First-person Umang persona
   └─ Generate response
    ↓
9. Response Assembly
   ├─ Answer: LLM response
   ├─ Sources: Unique source filenames (formatted)
   └─ Follow-up Questions: 3 suggested questions
```

### Chunking Strategy Comparison

```
┌─────────────────────────────────────────────────────────────┐
│              CHUNKING STRATEGIES BY TYPE                      │
└─────────────────────────────────────────────────────────────┘

RESUME/LINKEDIN (Professional Chunker)
├─ Strategy: Section-aware, job-level
├─ Overlap: None
├─ Size: 400-800 tokens
├─ Metadata: Rich (company, role, dates, location)
└─ Example: Each job = 1 chunk

JOURNEY (Narrative Chunker)
├─ Strategy: Paragraph-aware, smart overlap
├─ Overlap: 30 words / 50 tokens max (sentence-based)
├─ Size: 450-500 tokens (target), max 600
├─ Metadata: Fiscal year, paragraph range, part info
└─ Example: Paragraphs grouped with overlap

GITHUB (Markdown Chunker)
├─ Strategy: Section-aware (markdown headers)
├─ Overlap: 25 words (for large sections)
├─ Size: 600 words (target), max 800
├─ Metadata: Repo info, language, stars, topics
└─ Example: Each markdown section = chunk(s)

GENERIC (Generic Chunker)
├─ Strategy: Paragraph-based
├─ Overlap: None
├─ Size: 1000 characters
├─ Metadata: Minimal (source, chunkIndex)
└─ Example: Sequential paragraph grouping
```

### Re-ranking Signal Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RE-RANKING PROCESS                        │
└─────────────────────────────────────────────────────────────┘

Input: 20 candidates from vector search
    ↓
For each candidate:
    ↓
1. Base Score (vectorSearchScore)
   └─ Example: 0.85
    ↓
2. Category Boost
   ├─ resume → 1.3x
   ├─ linkedin → 1.25x
   ├─ journey → 1.2x
   └─ github → 1.15x
   └─ Example: 0.85 * 1.3 = 1.105
    ↓
3. Recency Boost
   ├─ Current year → 1.3x
   ├─ Last year → 1.2x
   ├─ Last 2 years → 1.1x
   └─ Older → 1.0x (no boost)
   └─ Example: 1.105 * 1.3 = 1.437
    ↓
4. Quality Boost
   ├─ 100-300 words → 1.1x
   └─ Other → 1.0x (no boost)
   └─ Example: 1.437 * 1.1 = 1.581
    ↓
5. Final Score: 1.581
    ↓
Sort all candidates by finalScore (descending)
    ↓
Output: Top 5 chunks
```

---

## Summary

### Key Takeaways

1. **Pure Vector Search**: No hybrid search - relies entirely on semantic similarity
2. **Type-Specific Chunking**: Different strategies for resume, journey, GitHub, generic
3. **Smart Overlap**: Only for narrative documents (journey) to preserve context
4. **Multi-Signal Re-ranking**: Combines vector similarity + category + recency + quality
5. **No Query Optimization**: Queries used as-is (optimization function exists but unused)
6. **Category Filtering**: Post-search filtering based on query analysis
7. **Incremental Updates**: Only re-processes changed files

### System Strengths

- **Semantic Understanding**: Captures meaning, not just keywords
- **Flexible Chunking**: Optimized for each document type
- **Smart Re-ranking**: Balances multiple signals for better results
- **Efficient**: Incremental updates, batch processing

### Potential Improvements

1. **Query Optimization**: Could add LLM-based query expansion/rewriting
2. **Hybrid Search**: Could combine vector + keyword search for exact matches
3. **Pre-filtering**: Could filter by category before vector search (if categories detected)
4. **Query Decomposition**: Could break complex queries into sub-queries

### Current Limitations

- **No Exact Match Boost**: Can't prioritize exact keyword matches
- **No Typo Tolerance**: Misspellings may reduce similarity
- **Post-Search Filtering**: Filters after vector search (could pre-filter)

---

## Code References

### Key Files

- **Service Orchestration**: `lib/ai/service.ts`
- **Vector Search**: `lib/ai/vector-store.ts`
- **Chunking**: `lib/ai/chunking/*.ts`
- **Embeddings**: `lib/ai/embeddings.ts`
- **LLM**: `lib/ai/llm.ts`
- **PDF Loading**: `lib/ai/loaders/pdf-loader.ts`

### Key Functions

- `buildMemoryIndex()` - Document indexing pipeline
- `queryAI()` - Query processing pipeline
- `smartSearch()` - Vector search with filtering & re-ranking
- `reRankResults()` - Multi-signal re-ranking
- `analyzeQueryForCategories()` - Category detection
- `chunkJourney()` - Narrative chunking with overlap
- `chunkResume()` - Professional chunking
- `chunkGitHub()` - Markdown chunking
