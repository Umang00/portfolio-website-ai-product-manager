# AI Companion Architecture Document

## System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Next.js)                 │
│  - Portfolio pages (existing)                                │
│  - Chat Modal Component (new)                                │
│  - Voice Input Component (new)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (Next.js App Router)             │
│  /api/ai/query          - Handle chat queries                │
│  /api/ai/create-index   - Manual rebuild trigger             │
│  /api/ai/refresh        - Scheduled daily rebuild            │
│  /api/ai/rebuild        - Force rebuild (authenticated)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE LAYER (lib/ai)                 │
│  service.js         - RAG orchestration                      │
│  embeddings.js      - OpenAI embedding calls                 │
│  llm.js            - OpenRouter LLM calls                    │
│  vector-store.js   - MongoDB vector operations               │
│  file-watcher.js   - Change detection                        │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌──────────────────┐ ┌─────────────┐ ┌─────────────┐
│ DOCUMENT LOADERS │ │ CHUNKING    │ │ VECTOR      │
│ (lib/ai/loaders) │ │ STRATEGIES  │ │ STORE       │
│                  │ │ (lib/ai/    │ │ (MongoDB    │
│ - pdf-loader.js  │ │  chunking)  │ │  Atlas)     │
│ - github-loader  │ │             │ │             │
│ - resume-loader  │ │ - narrative │ │ - embeddings│
└──────────────────┘ │ - linkedin  │ │ - metadata  │
                     │ - generic   │ │ - file_hashes│
                     └─────────────┘ └─────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                            │
│  /documents/resume.pdf                                       │
│  /documents/Profile_(2).pdf (LinkedIn)                       │
│  /documents/journey_2020-2022.pdf                            │
│  /documents/journey_2023-2024.pdf                            │
│  /documents/journey_2025.pdf                                 │
│  GitHub API (live repository data)                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer

**Location:** `/components/ai/`

**Components:**
- `chat-modal.jsx` - Main chat interface (modal overlay)
- `message-bubble.jsx` - Individual message display
- `voice-input.jsx` - Speech-to-text input
- `suggested-questions.jsx` - Follow-up prompts

**State Management:**
- Conversation history (array of messages)
- Loading states
- Error states
- Modal open/close state

**API Communication:**
- POST to `/api/ai/query` with { query, conversationHistory }
- Receive { answer, suggestedQuestions, sources }

### 2. API Routes Layer

**Location:** `/app/api/ai/`

**Endpoints:**

#### `/api/ai/query/route.js`
- **Method:** POST
- **Input:** `{ query: string, conversationHistory: array }`
- **Process:**
  1. Validate input
  2. Call `queryAI()` from service layer
  3. Return response with sources
- **Output:** `{ answer: string, sources: array, suggestedQuestions: array }`

#### `/api/ai/create-index/route.js`
- **Method:** POST
- **Input:** `{ forceRebuild: boolean }`
- **Process:**
  1. Call `buildMemoryIndex(forceRebuild)`
  2. Log progress
- **Output:** `{ success: boolean, chunksCreated: number }`

#### `/api/ai/refresh/route.js`
- **Method:** POST (called by Vercel Cron)
- **Process:**
  1. Check for file changes
  2. Rebuild if needed
- **Output:** `{ success: boolean, message: string }`

#### `/api/ai/rebuild/route.js`
- **Method:** POST
- **Auth:** Requires `ADMIN_SECRET` in request body
- **Process:** Force full rebuild regardless of changes
- **Output:** `{ success: boolean, message: string }`

### 3. AI Service Layer

**Location:** `/lib/ai/`

#### `service.js` (Main Orchestrator)
**Key Functions:**
- `buildMemoryIndex(forceRebuild)` - Load docs, chunk, embed, store
- `queryAI(query, conversationHistory)` - Retrieve context, generate response
- `checkForChanges()` - Hash-based file change detection
- `analyzeQuery(query)` - **NEW:** Extract intent and metadata filters from query
- `generateSuggestedQuestions(query, chunks)` - **NEW:** Context-aware follow-ups

**Data Flow:**
```
buildMemoryIndex():
1. Check for file changes (hash comparison)
2. Load changed documents (loaders)
3. Chunk documents (chunking strategies)
4. Generate embeddings (embeddings.js)
5. Store in vector DB (vector-store.js)
6. Update file hashes

queryAI():
1. Generate query embedding
2. Vector search for relevant chunks
3. Construct context from top chunks
4. Call LLM with context + query
5. Return formatted response
```

#### `embeddings.js`
**Purpose:** Generate embeddings using OpenAI API
**Key Functions:**
- `generateEmbedding(text)` - Single text to embedding
- `batchGenerateEmbeddings(texts)` - Batch processing (efficient)

**Configuration:**
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Batch size: 50 (to avoid rate limits)

#### `llm.js`
**Purpose:** Generate responses using OpenRouter
**Key Functions:**
- `generateResponse(context, query, history)` - Main chat function
- `summarizeConversation(history)` - Compress old messages

**Configuration:**
- Model: `meta-llama/llama-3.1-8b-instruct:free` (configurable via env)
- Max tokens: 2000
- Temperature: 0.7
- System prompt: Defines AI persona as "Umang's companion"

#### `vector-store.js`
**Purpose:** MongoDB Atlas operations
**Key Functions:**
- `storeEmbeddings(chunks)` - Batch insert
- `searchSimilar(queryEmbedding, limit)` - Basic vector kNN search
- `smartSearch(queryEmbedding, filters, limit)` - **NEW:** Multi-stage retrieval with filtering and re-ranking
- `rerankResults(chunks, filters)` - **NEW:** Multi-signal scoring algorithm
- `deleteBySource(filename)` - Remove old chunks on update

**Collections:**
- `embeddings` - Stores chunks with embeddings
- `file_metadata` - Tracks file hashes and update times
- `conversations` - Optional: store chat histories

#### `file-watcher.js`
**Purpose:** Detect document changes
**Key Functions:**
- `getFileHash(filepath)` - SHA-256 hash of file
- `checkForChanges()` - Compare current vs stored hashes
- `updateFileMetadata(filename, hash)` - Store new hash

#### Smart Retrieval Pipeline

**Multi-Stage Retrieval:**
```
Query: "What did Umang work on recently?"
    ↓
1. Query Analysis (analyzeQuery)
   - Detects: "work" → Filter to linkedin_experience
   - Detects: "recent" → Filter to 2024-2025
   - Detects: temporal keyword → Boost recency
    ↓
2. Vector Search (smartSearch)
   - Generate query embedding
   - MongoDB kNN search with metadata filters
   - Retrieve 20 candidates (4x final limit)
    ↓
3. Re-ranking (rerankResults)
   - Base score: Vector similarity
   - Category boost: +30% for linkedin_experience
   - Recency boost: +5% per year (last 5 years)
   - Length boost: +10% for 100-300 token chunks
    ↓
4. Top-K Selection
   - Sort by final score
   - Return top 5 chunks
    ↓
5. Follow-up Generation
   - Analyze chunk categories
   - Suggest 2-3 contextual questions
```

**Re-ranking Signals:**
| Signal | Weight | Example Impact |
|--------|--------|----------------|
| Vector Similarity | 1.0x (base) | Query "AI projects" matches "built AI chatbot" |
| Category Relevance | 1.0-1.3x | Work query boosts LinkedIn 30% |
| Recency | 1.0-1.25x | 2024 experience gets 25% boost over 2020 |
| Chunk Quality | 1.0-1.1x | Medium-length chunks preferred |

**Query Intent Patterns:**
- Work/Experience: `work|job|experience|role|company`
- Journey/Decisions: `decision|learn|journey|why|approach`
- Technical: `project|build|code|github`
- Recent: `recent|current|latest|2024|2025`
- Skills: `skill|technology|tool|tech stack`

### 4. Document Loaders

**Location:** `/lib/ai/loaders/`

#### `resume-loader.js` (From reference repo)
**Purpose:** Parse resume.pdf with section detection
**Strategy:** Uppercase headers → sections → bullet groups
**Output:** Array of chunks with metadata

#### `github-loader.js` (From reference repo)
**Purpose:** Fetch GitHub repos via API
**Strategy:** Get repos → fetch READMEs → paragraph chunking
**Output:** Array of chunks with repo metadata

#### `generic-pdf-loader.js` (New)
**Purpose:** Load LinkedIn + Journey PDFs
**Strategy:**
1. Scan `/documents` for all PDFs
2. Exclude `resume.pdf` (has dedicated loader)
3. Detect document type (linkedin vs journey vs generic)
4. Route to appropriate chunker
**Output:** Array of { source, content, type, metadata }

### 5. Chunking Strategies

**Location:** `/lib/ai/chunking/`

#### `professional-chunker.js` (New)
**For:** LinkedIn PDF, Resume
**Strategy:**
- Detect sections (EXPERIENCE, EDUCATION, SKILLS)
- Each job entry = 1 chunk
- Skills grouped in batches
- No overlap (independent bullets)
**Chunk Size:** 400-800 tokens
**Metadata:** company, role, duration, location

#### `narrative-chunker.js` (New)
**For:** Journey PDFs
**Strategy:**
- Detect topic boundaries (headers, semantic shifts)
- Sliding window: 3-4 paragraphs per chunk
- 2-paragraph overlap (~150-200 tokens)
- Preserve context for storytelling
**Chunk Size:** 600-900 tokens
**Metadata:** topic, section, timeframe

#### `generic-chunker.js` (Fallback)
**For:** Unknown document types
**Strategy:** Simple paragraph-based splitting
**Chunk Size:** 500 tokens
**Overlap:** 50 tokens

### 6. Vector Database

**Platform:** MongoDB Atlas (Free M0 tier)
**Search Index:** Atlas Search with kNN vector support

**Configuration:**
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "category": { "type": "string" },
      "text": { "type": "string" },
      "metadata": { "type": "document" }
    }
  }
}
```

**Document Schema:**
```javascript
{
  _id: ObjectId,
  text: string,           // Original chunk text
  embedding: [float],     // 1536-dim vector
  category: string,       // 'linkedin_experience', 'journey_narrative', etc.
  metadata: {
    source: string,       // Filename
    company: string,      // For LinkedIn chunks
    role: string,
    duration: string,
    topic: string,        // For journey chunks
    timeframe: string
  },
  createdAt: Date
}
```

## Data Flow: End-to-End

### Indexing Flow (Startup/Daily Rebuild)
```
1. Cron job triggers /api/ai/refresh
2. checkForChanges() compares file hashes
3. If changes detected:
   a. Load changed PDFs (loaders)
   b. Chunk based on document type (chunkers)
   c. Generate embeddings (OpenAI API)
   d. Delete old chunks from vector DB
   e. Insert new chunks
   f. Update file hashes in metadata collection
4. Return success
```

### Query Flow (User Asks Question)
```
1. User types question in chat modal
2. Frontend sends POST to /api/ai/query
3. API route calls queryAI(query, history)
4. Service layer:
   a. Analyze query intent (NEW: analyzeQuery)
   b. Generate embedding for query (OpenAI)
   c. Smart vector search (NEW: with filters & re-ranking)
      - Get 20 candidates from MongoDB
      - Apply metadata filters
      - Re-rank by multiple signals
      - Select top 5
   d. Construct context from retrieved chunks
   e. Call LLM (OpenRouter) with context + history + query
   f. Generate suggested follow-ups (NEW)
5. Return response + sources + suggestions to frontend
6. Frontend displays with relevance scores (NEW)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React framework |
| Styling | Tailwind CSS | UI styling |
| API Routes | Next.js API Routes | Backend endpoints |
| Language | JavaScript (ES6+) | No TypeScript |
| Vector DB | MongoDB Atlas (M0) | Embeddings storage |
| Embeddings | OpenAI text-embedding-3-small | Vector generation |
| LLM | OpenRouter (Llama 3.1 8B free) | Chat completions |
| PDF Parsing | pdf-parse | Extract text from PDFs |
| GitHub API | node-fetch | Fetch repository data |
| Scheduling | Vercel Cron | Daily rebuild trigger |
| Hosting | Vercel | Deployment platform |

## Environment Variables
```bash
# MongoDB
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME="portfolio_ai"

# OpenAI (Embeddings only)
OPENAI_API_KEY="sk-..."
EMBEDDING_MODEL="text-embedding-3-small"

# OpenRouter (LLM only)
OPENROUTER_API_KEY="sk-or-v1-..."
LLM_MODEL="meta-llama/llama-3.1-8b-instruct:free"
LLM_MAX_TOKENS="2000"
LLM_TEMPERATURE="0.7"

# GitHub (optional)
GITHUB_TOKEN=""
GITHUB_USERNAME="Umang00"

# Admin
ADMIN_SECRET="your-secret-key"

# App
NEXT_PUBLIC_APP_URL="https://your-site.vercel.app"
```

## Security Considerations

1. **API Keys:** Never commit to git, use .env.local
2. **Admin Endpoints:** Require secret token
3. **Rate Limiting:** Implement on /api/ai/query (10 req/min per IP)
4. **Input Validation:** Sanitize user queries
5. **CORS:** Restrict to your domain only
6. **Error Messages:** Don't leak internal details

## Monitoring & Logging

**Key Metrics:**
- Query latency (p50, p95, p99)
- Embedding API costs
- LLM API calls
- Vector search performance
- File rebuild frequency

**Logging Strategy:**
- Use `console.log` for development
- Use structured logging in production (JSON format)
- Log all API calls with timestamps
- Track errors with stack traces

## Deployment Architecture
```
GitHub Repo
    │
    ├─ Push to main branch
    │
    ▼
Vercel (Auto Deploy)
    │
    ├─ Build Next.js app
    ├─ Set environment variables
    ├─ Deploy to edge network
    │
    ▼
Production Site
    │
    ├─ Serves frontend
    ├─ Runs API routes
    ├─ Executes cron jobs (daily 2 AM)
    │
    ▼
External Services
    ├─ MongoDB Atlas (vector storage)
    ├─ OpenAI API (embeddings)
    └─ OpenRouter API (LLM)
```

## Scalability Considerations

**Current Limitations (Free Tier):**
- MongoDB: 512 MB storage (~500K chunks)
- Vercel: 100 GB bandwidth/month
- OpenAI: Pay-as-you-go (no free tier)
- OpenRouter: Free tier with rate limits

**Scaling Strategy (If Needed):**
1. Upgrade MongoDB to M10 ($0.08/hour)
2. Upgrade Vercel to Pro ($20/month)
3. Implement caching layer (Redis)
4. Use cheaper embedding models (OpenRouter alternatives)
5. Implement smarter retrieval (re-ranking, metadata filtering)

## Future Enhancements

**V2 Features:**
- Fine-tune model on Umang's writing style
- Multi-modal support (images, diagrams)
- Voice output (text-to-speech)
- Analytics dashboard (query patterns, popular topics)
- Visitor profiling (tailor responses to recruiter vs VC)
- Integration with calendar (schedule meetings)

**V3 Features:**
- Multi-language support
- Mobile app (React Native)
- Slack/Discord integration
- Email summaries of conversations