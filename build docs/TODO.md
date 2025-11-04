# AI Companion Implementation - Master To-Do List

**Project:** Portfolio Website AI Companion  
**Developer:** Umang Thakkar  
**Start Date:** November 2025  
**Estimated Duration:** 7 days (focused work)  
**Status:** 🟡 In Progress

---

## 📊 Progress Overview

- [ ] Phase 0: Pre-Setup (2 hours)
- [ ] Phase 1: Backend Setup (6-8 hours)
- [ ] Phase 2: Document Processing (4-5 hours)
- [ ] Phase 3: Change Detection (3-4 hours)
- [ ] Phase 4: LLM Integration (2-3 hours)
- [ ] Phase 5: Frontend Integration (4-5 hours)
- [ ] Phase 6: MongoDB Configuration (1 hour)
- [ ] Phase 7: Deployment (2-3 hours)

**Total:** 24-31 hours

---

## 🚀 PHASE 0: Pre-Setup & Planning

**Objective:** Set up tools, accounts, and generate migration guide

### Accounts & Services
- [✅] Create MongoDB Atlas account (free M0 tier)
  - [✅] Create cluster named "portfolio-cluster"
  - [✅] Create database user
  - [✅] Whitelist IP (0.0.0.0/0 for development)
  - [✅] Get connection string
- [✅] Get OpenAI API key
  - [✅] Sign up at platform.openai.com
  - [✅] Add payment method (will use ~$2-3/month)
  - [✅] Create API key
- [✅] Get OpenRouter API key
  - [✅] Sign up at openrouter.ai
  - [✅] Create API key (free tier for LLM)

### Document Preparation
- [✅] Convert resume DOCX to PDF
  - [✅] Save as: `/documents/Umang_Thakkar_PM_Master_Resume.pdf`
- [✅] Review LinkedIn PDF
  - [✅] Already have: `/documents/LinkedIn.pdf`
- [✅] Prepare Journey documents
  - [✅] If journey.pdf > 50 pages, split into:
    - [✅] `journey_2020-2022.pdf` (college + early career)
    - [✅] `journey_2023-2024.pdf` (career pivot)
    - [✅] `journey_2025.pdf` (current year)
  - [✅] If journey.pdf < 50 pages, keep as single file

### Project Setup
- [✅] Clone reference repository
```bash
  git clone https://github.com/Kartavya904/Kartavya-Portfolio-MERN.git
  cd Kartavya-Portfolio-MERN
```
- [ ] Create `.cursorrules` file in your repo
```
  Environment: Windows 11
  Shell: PowerShell
  
  Rules:
  1. Use semicolon (;) for command chaining, not &&
  2. Use forward slashes (/) in code paths
  3. Test commands before suggesting
  4. Prefer npm scripts over direct commands
```
- [✅] Create `/documents` folder if not exists
```bash
  mkdir documents
```
- [✅] Copy PRD.md to repo root
- [✅] Copy ARCHITECTURE.md to repo root
- [✅] Copy TODO.md (this file) to repo root

### Generate Migration Guide
- [✅] Open Cursor with reference repo (Window 1)
- [✅] Paste migration guide prompt (provided separately)
- [✅] Save output as `MIGRATION_GUIDE.md` in your repo
- [✅] Review migration guide for clarity

**Checkpoint:** ✅ All accounts created, documents prepared, migration guide generated

---

## 🛠 PHASE 1: Backend Setup

**Objective:** Copy and adapt core backend infrastructure

### Install Dependencies
- [ ] Install required npm packages
```bash
  npm install mongodb openai pdf-parse node-fetch@2 marked crypto
```
- [ ] Verify installations
```bash
  npm list mongodb openai pdf-parse
```

### Create Folder Structure
- [ ] Create folders
```bash
  mkdir lib
  mkdir lib/ai
  mkdir lib/ai/loaders
  mkdir lib/ai/chunking
  mkdir lib/db
  mkdir app/api
  mkdir app/api/ai
  mkdir app/api/ai/query
  mkdir app/api/ai/create-index
  mkdir app/api/ai/refresh
  mkdir app/api/ai/rebuild
  mkdir components/ai
```

### Environment Variables
- [ ] Create `.env.local` in repo root
```bash
  # MongoDB
  MONGODB_URI="mongodb+srv://..."
  MONGODB_DB_NAME="portfolio_ai"
  
  # OpenAI
  OPENAI_API_KEY="sk-..."
  EMBEDDING_MODEL="text-embedding-3-small"
  
  # OpenRouter
  OPENROUTER_API_KEY="sk-or-v1-..."
  LLM_MODEL="meta-llama/llama-3.1-8b-instruct:free"
  LLM_MAX_TOKENS="2000"
  LLM_TEMPERATURE="0.7"
  
  # GitHub (optional)
  GITHUB_TOKEN=""
  GITHUB_USERNAME="Umang00"
  
  # Admin
  ADMIN_SECRET="generate-random-secret-here"
  
  # App
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Verify `.env.local` is not tracked by git

### Copy Core Files from Reference Repo

**Follow MIGRATION_GUIDE.md for exact file paths**

- [ ] Copy `/backend/config/mongodb.js` → `/lib/db/mongodb.js`
  - [ ] Adapt for Next.js (remove Express-specific code)
- [ ] Copy `/backend/services/aiService.js` → `/lib/ai/service.js`
  - [ ] Keep as JavaScript (no TypeScript conversion)
  - [ ] Update import paths for Next.js
- [ ] Copy `/backend/utils/resumeLoader.js` → `/lib/ai/loaders/resume-loader.js`
  - [ ] Update file paths to point to `/documents`
- [ ] Copy `/backend/utils/githubFetcher.js` → `/lib/ai/loaders/github-loader.js`
  - [ ] Update GitHub username to use env var

### Create AI Service Modules

These are extracted/refactored from aiService.js:

- [ ] Create `/lib/ai/embeddings.js`
  - [ ] Function: `generateEmbedding(text)`
  - [ ] Function: `batchGenerateEmbeddings(texts)`
  - [ ] Use OpenAI API directly (not OpenRouter)
  
- [ ] Create `/lib/ai/llm.js`
  - [ ] Function: `generateResponse(context, query, history)`
  - [ ] Use OpenRouter API
  - [ ] Model from env var: `LLM_MODEL`
  
- [ ] Create `/lib/ai/vector-store.js`
  - [ ] Function: `storeEmbeddings(chunks)`
  - [ ] Function: `searchSimilar(queryEmbedding, limit)`
  - [ ] Function: `deleteBySource(filename)`
  - [ ] MongoDB Atlas kNN search integration

- [ ] Create `/lib/ai/file-watcher.js`
  - [ ] Function: `getFileHash(filepath)` (SHA-256)
  - [ ] Function: `checkForChanges()` (compare hashes)
  - [ ] Function: `updateFileMetadata(filename, hash)`

### Create API Routes

#### Query Endpoint
- [ ] Create `/app/api/ai/query/route.js`
```javascript
  // POST /api/ai/query
  // Input: { query, conversationHistory }
  // Output: { answer, sources, suggestedQuestions }
```
  - [ ] Import `queryAI` from `/lib/ai/service.js`
  - [ ] Validate input
  - [ ] Call `queryAI()`
  - [ ] Return formatted response

#### Create Index Endpoint
- [ ] Create `/app/api/ai/create-index/route.js`
```javascript
  // POST /api/ai/create-index
  // Input: { forceRebuild: boolean }
  // Output: { success, chunksCreated }
```
  - [ ] Import `buildMemoryIndex` from service
  - [ ] Call with forceRebuild parameter
  - [ ] Return status

#### Refresh Endpoint (Cron)
- [ ] Create `/app/api/ai/refresh/route.js`
```javascript
  // POST /api/ai/refresh (called by Vercel Cron)
  // Checks for changes, rebuilds if needed
```
  - [ ] Import `checkForChanges` and `buildMemoryIndex`
  - [ ] Only rebuild if changes detected
  - [ ] Log results

#### Rebuild Endpoint (Admin)
- [ ] Create `/app/api/ai/rebuild/route.js`
```javascript
  // POST /api/ai/rebuild
  // Auth: Requires ADMIN_SECRET
  // Forces full rebuild
```
  - [ ] Verify `ADMIN_SECRET` from request body
  - [ ] Force rebuild regardless of changes
  - [ ] Return status

### Test Phase 1
- [ ] Test MongoDB connection
```bash
  node -e "const db = require('./lib/db/mongodb.js'); db.connectToDatabase().then(() => console.log('Connected'))"
```
- [ ] Test environment variables
```bash
  node -e "console.log(process.env.MONGODB_URI ? 'ENV loaded' : 'ENV missing')"
```
- [ ] Run Next.js dev server
```bash
  npm run dev
```
- [ ] Visit http://localhost:3000 (should load existing site)

**Checkpoint:** ✅ Backend infrastructure in place, MongoDB connected, API routes created

---

## 📄 PHASE 2: Document Processing

**Objective:** Implement loaders and chunkers for all document types

### Create Generic PDF Loader
- [ ] Create `/lib/ai/loaders/generic-pdf-loader.js`
  - [ ] Function: `loadAllPDFs()`
    - Scans `/documents` folder
    - Excludes `resume.pdf` (has dedicated loader)
    - Returns: `[{ source, content, type, metadata }]`
  - [ ] Function: `detectDocumentType(filename, content)`
    - Returns: 'linkedin' | 'journey' | 'generic'
  - [ ] Function: `parsePDF(filepath)`
    - Uses `pdf-parse` library
    - Returns: raw text content

### Create LinkedIn Chunker
- [ ] Create `/lib/ai/chunking/professional-chunker.js`
  - [ ] Function: `chunkLinkedInPDF(content)`
    - Detects sections: EXPERIENCE, EDUCATION, SKILLS
    - Extracts job entries (company + role + bullets)
    - Each job = 1 chunk
    - Target size: 400-800 tokens
    - No overlap (jobs are independent)
  - [ ] Function: `extractJobEntries(experienceSection)`
    - Pattern matching for job blocks
    - Returns: `[{ company, role, duration, location, bullets }]`
  - [ ] Function: `formatJobEntry(job)`
    - Formats into chunk text with metadata

### Create Journey Chunker
- [ ] Create `/lib/ai/chunking/narrative-chunker.js`
  - [ ] Function: `chunkJourneyPDF(content)`
    - Detects topic boundaries (headers, semantic shifts)
    - Sliding window: 3-4 paragraphs per chunk
    - 2-paragraph overlap (~150-200 tokens)
    - Target size: 600-900 tokens
  - [ ] Function: `detectTopicBoundaries(content)`
    - Looks for headers (##, ###)
    - Looks for semantic transitions
    - Returns: `[{ name, startLine, content }]`
  - [ ] Function: `slidingWindowChunk(paragraphs, maxTokens, overlapCount)`
    - Implements windowing with overlap
    - Returns: array of chunk texts

### Integrate into Main Service
- [ ] Modify `/lib/ai/service.js`
  - [ ] Import generic PDF loader
  - [ ] Import both chunkers
  - [ ] Update `loadAndChunkData()` function
```javascript
    async function loadAndChunkData() {
      const chunks = [];
      
      // Load resume (existing loader)
      chunks.push(...await loadResume());
      
      // Load GitHub (existing loader)
      chunks.push(...await loadGitHub());
      
      // Load generic PDFs (NEW)
      const pdfs = await loadAllPDFs();
      for (const pdf of pdfs) {
        if (pdf.type === 'linkedin') {
          chunks.push(...chunkLinkedInPDF(pdf.content));
        } else if (pdf.type === 'journey') {
          chunks.push(...chunkJourneyPDF(pdf.content));
        } else {
          chunks.push(...genericChunk(pdf.content));
        }
      }
      
      return chunks;
    }
```

### Add Sample PDFs
- [ ] Copy your 3 PDFs to `/documents`
  - [ ] `Umang_Thakkar_PM_Master_Resume.pdf`
  - [ ] `Profile_(2).pdf`
  - [ ] `journey_2020-2022.pdf` (or single journey.pdf)

### Test Phase 2
- [ ] Test PDF loading
```bash
  # Create test script: test-loaders.js
  node test-loaders.js
```
  Expected output: List of loaded PDFs with types
  
- [ ] Test chunking independently
```bash
  # Create test script: test-chunking.js
  node test-chunking.js
```
  Expected output:
  - LinkedIn: ~15-20 chunks (one per job/section)
  - Journey: ~100-150 chunks (with overlap)
  - Resume: ~10-15 chunks
  
- [ ] Verify chunk quality
  - [ ] Sample 5 chunks from LinkedIn (check job structure preserved)
  - [ ] Sample 5 chunks from Journey (check context overlap works)
  - [ ] Ensure no encoding issues (special characters handled)

**Checkpoint:** ✅ All PDFs loading, chunking strategies working, chunk quality verified

---

## 🔄 PHASE 3: Change Detection System

**Objective:** Implement file change detection for incremental updates

### Create File Metadata Collection
- [ ] Design MongoDB schema
```javascript
  // Collection: file_metadata
  {
    filename: String,
    hash: String (SHA-256),
    lastProcessed: Date,
    chunkCount: Number,
    fileSize: Number
  }
```
- [ ] Create in MongoDB Atlas dashboard (or auto-create on first insert)

### Implement Hash-Based Detection
- [ ] In `/lib/ai/file-watcher.js`
  - [ ] Function: `getFileHash(filepath)`
```javascript
    // Uses crypto.createHash('sha256')
    // Reads file, returns hex digest
```
  - [ ] Function: `checkForChanges()`
```javascript
    // For each PDF in /documents:
    // 1. Compute current hash
    // 2. Fetch stored hash from file_metadata
    // 3. Compare
    // 4. If different, add to changedFiles array
    // Returns: ['journey.pdf', 'linkedin.pdf']
```
  - [ ] Function: `updateFileMetadata(filename, hash, chunkCount)`
```javascript
    // Upsert to file_metadata collection
```

### Modify Index Building Logic
- [ ] In `/lib/ai/service.js`
  - [ ] Update `buildMemoryIndex(forceRebuild)` function
```javascript
    async function buildMemoryIndex(forceRebuild = false) {
      if (!forceRebuild) {
        const changedFiles = await checkForChanges();
        
        if (changedFiles.length === 0) {
          console.log('No changes detected, skipping rebuild');
          return { skipped: true };
        }
        
        console.log(`Rebuilding for: ${changedFiles.join(', ')}`);
        
        // Delete old embeddings for changed files
        await deleteBySource(changedFiles);
        
        // Load only changed files
        const chunks = await loadAndChunkChangedFiles(changedFiles);
        
        // Embed and store
        const embeddings = await generateEmbeddings(chunks);
        await storeEmbeddings(embeddings);
        
        // Update metadata
        for (const file of changedFiles) {
          const hash = await getFileHash(`./documents/${file}`);
          await updateFileMetadata(file, hash, chunks.length);
        }
        
        return { success: true, filesUpdated: changedFiles };
      } else {
        // Full rebuild (existing logic)
      }
    }
```

### Test Phase 3
- [ ] Initial index build
```bash
  curl -X POST http://localhost:3000/api/ai/create-index -d '{"forceRebuild": true}'
```
  - [ ] Verify all files processed
  - [ ] Check file_metadata collection populated
  
- [ ] Test change detection
  - [ ] Modify journey.pdf (add 1 paragraph)
  - [ ] Call create-index without forceRebuild
  - [ ] Verify only journey.pdf re-processed
  
- [ ] Test no-change scenario
  - [ ] Don't modify any files
  - [ ] Call create-index
  - [ ] Verify "No changes detected" message

**Checkpoint:** ✅ Change detection working, incremental updates functional

---

## 🤖 PHASE 4: LLM Integration

**Objective:** Replace OpenAI GPT-4 with OpenRouter free model

### Create LLM Module
- [ ] In `/lib/ai/llm.js`
  - [ ] Function: `generateResponse(context, query, history)`
```javascript
    // Calls OpenRouter API
    // POST https://openrouter.ai/api/v1/chat/completions
    // Model: process.env.LLM_MODEL
    // Returns: AI response text
```
  - [ ] Define system prompt
```javascript
    const systemPrompt = `You are Umang Thakkar's AI companion. 
    Answer questions based on the provided context about Umang's 
    professional background, projects, and journey. Speak in first 
    person as if you are Umang. Be conversational, helpful, and accurate.`;
```
  - [ ] Handle conversation history
```javascript
    // Limit to last 10 messages to stay within token limits
    // Format as: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
```

### Update Query Flow
- [ ] In `/lib/ai/service.js`
  - [ ] Update `queryAI(query, conversationHistory)` function
```javascript
    async function queryAI(query, conversationHistory) {
      // 1. Generate query embedding
      const queryEmbedding = await generateEmbedding(query);
      
      // 2. Vector search
      const relevantChunks = await searchSimilar(queryEmbedding, 5);
      
      // 3. Construct context
      const context = relevantChunks.map((chunk, i) => 
        `[${i+1}] ${chunk.text}`
      ).join('\n\n');
      
      // 4. Call LLM (NEW: use llm.js instead of OpenAI directly)
      const response = await generateResponse(context, query, conversationHistory);
      
      // 5. Return with sources
      return {
        answer: response,
        sources: relevantChunks.map(c => c.metadata.source),
        suggestedQuestions: [] // Optional: generate follow-ups
      };
    }
```
### Implement Smart Retrieval (NEW)
- [ ] Update `/lib/ai/vector-store.js`
  - [ ] Add `smartSearch(queryEmbedding, filters, limit)` function
  - [ ] Add `rerankResults(chunks, filters)` function
  - [ ] Support metadata filtering (category, source, timeframe)
  
- [ ] Update `/lib/ai/service.js`
  - [ ] Add `analyzeQuery(query)` function (detect intent)
  - [ ] Add `generateSuggestedQuestions(query, chunks)` function
  - [ ] Modify `queryAI()` to use `smartSearch` instead of `searchSimilar`
  - [ ] Add `createdAt` timestamp when storing embeddings
  
- [ ] Update `/app/api/ai/query/route.js`
  - [ ] Return `sources` array with relevance scores
  - [ ] Return `suggestedQuestions` array
  
- [ ] Update `/components/ai/chat-modal.jsx`
  - [ ] Display source relevance scores (collapsible)
  - [ ] Add clickable suggested question buttons
  - [ ] Style follow-up questions

### Test Phase 4
- [ ] Test LLM endpoint directly
```bash
  # Create test script: test-llm.js
  node test-llm.js
```
  - [ ] Verify OpenRouter API connection
  - [ ] Test with sample context and query
  
- [ ] Test full query flow
```bash
  curl -X POST http://localhost:3000/api/ai/query \
    -H "Content-Type: application/json" \
    -d '{"query": "What projects has Umang worked on at Hunch?", "conversationHistory": []}'
```
  Expected output:
```json
  {
    "answer": "At Hunch, I worked on several key projects including...",
    "sources": [
      {
        "file": "Profile_(2).pdf",
        "category": "linkedin_experience",
        "relevanceScore": 0.94
      },
      {
        "file": "journey_2023-2024.pdf",
        "category": "journey_narrative",
        "relevanceScore": 0.87
      }
    ],
    "suggestedQuestions": [
      "What were the key achievements in that role?",
      "What technologies did you use?",
      "What did you learn from that experience?"
    ]
  }
```
  
- [ ] Test conversation context
```bash
  # Query 1: "What did Umang do at Hunch?"
  # Query 2: "What was his biggest achievement there?" (should remember "Hunch")
```
  
- [ ] Test smart retrieval
  - [ ] Create `test-smart-retrieval.js` script
  - [ ] Test query: "What did Umang work on recently?"
    - Verify filters to 2024-2025 + LinkedIn
  - [ ] Test query: "How does Umang approach decisions?"
    - Verify filters to journey_narrative
  - [ ] Test query: "What technical projects has Umang built?"
    - Verify filters to GitHub + LinkedIn technical
  - [ ] Verify re-ranking improves results vs basic search
  - [ ] Verify suggested questions are contextually relevant
  
- [ ] Verify response quality
  - [ ] Test 10 different queries
  - [ ] Check if responses use retrieved context
  - [ ] Check if answers are in first person
  - [ ] Check if responses are accurate
  - [ ] Check if suggested questions are contextually relevant
  - [ ] Check if relevance scores are reasonable (>0.7 for top result)

**Checkpoint:** ✅ LLM + smart retrieval complete, queries highly relevant with context-aware suggestions

---

## 🎨 PHASE 5: Frontend Integration

**Objective:** Add chat UI to existing portfolio site

### Copy Components from Reference
- [ ] Copy `/frontend/components/AICompanion.jsx` → `/components/ai/chat-modal.jsx`
  - [ ] Keep as .jsx (no TypeScript)
  - [ ] Update API endpoint paths for Next.js
  - [ ] Update styling to match your portfolio theme
  
- [ ] Copy voice input component (optional)
  - [ ] Copy `/frontend/components/VoiceInput.jsx` → `/components/ai/voice-input.jsx`
  
- [ ] Create supporting components
  - [ ] `/components/ai/message-bubble.jsx` (if not in reference)
  - [ ] `/components/ai/loading-indicator.jsx`

### Add Chat Trigger to Homepage
- [ ] Open your main page component (likely `/app/page.js` or `/app/page.tsx`)
- [ ] Import chat modal
```javascript
  import ChatModal from '@/components/ai/chat-modal';
  import { useState } from 'react';
```
- [ ] Add state for modal
```javascript
  const [chatOpen, setChatOpen] = useState(false);
```
- [ ] Add floating button (bottom-right corner)
```jsx
  <button
    onClick={() => setChatOpen(true)}
    className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
  >
    💬 Ask My AI Companion
  </button>
```
- [ ] Add modal (conditionally rendered)
```jsx
  {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
```

### Implement Chat Logic
- [ ] In `/components/ai/chat-modal.jsx`
  - [ ] State: messages array
  - [ ] State: loading boolean
  - [ ] State: input text
  - [ ] Function: `handleSendMessage()`
```javascript
    async function handleSendMessage() {
      // Add user message to UI
      setMessages([...messages, { role: 'user', content: input }]);
      
      // Call API
      setLoading(true);
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          conversationHistory: messages
        })
      });
      const data = await response.json();
      
      // Add AI response to UI
      setMessages([...messages, 
        { role: 'user', content: input },
        { role: 'assistant', content: data.answer }
      ]);
      setLoading(false);
      setInput('');
    }
```

### Style Integration
- [ ] Match modal theme to portfolio
  - [ ] Colors: Use your site's primary colors
  - [ ] Fonts: Match your site's typography
  - [ ] Animations: Keep consistent with site feel
- [ ] Ensure responsive design
  - [ ] Desktop: Modal in center, ~600px width
  - [ ] Mobile: Full-screen modal
  - [ ] Test on multiple screen sizes
- [ ] Add animations
  - [ ] Modal fade-in/out
  - [ ] Message slide-in
  - [ ] Typing indicator animation

### Test Phase 5
- [ ] Visual testing
  - [ ] Click chat button → modal opens
  - [ ] Type message → sends correctly
  - [ ] Response displays → formatted properly
  - [ ] Close button → modal closes
  
- [ ] Functional testing
  - [ ] Test 5 different questions
  - [ ] Verify responses are relevant
  - [ ] Check loading states work
  - [ ] Test error handling (disconnect internet, send query)
  
- [ ] Cross-browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (if on Mac)
  - [ ] Edge
  
- [ ] Mobile testing
  - [ ] Open on phone (use ngrok or deploy preview)
  - [ ] Test touch interactions
  - [ ] Verify keyboard doesn't obscure input

**Checkpoint:** ✅ Chat UI working, integrated with portfolio, responsive design

---

## 🗄️ PHASE 6: MongoDB Atlas Configuration

**Objective:** Set up vector search index for production

### Create Atlas Search Index
- [ ] Log in to MongoDB Atlas
- [ ] Navigate to your cluster
- [ ] Click "Search" tab
- [ ] Click "Create Search Index"
- [ ] Choose "JSON Editor"
- [ ] Paste configuration:
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
        "category": {
          "type": "string"
        },
        "text": {
          "type": "string"
        }
      }
    }
  }
```
- [ ] Index name: `vector_index`
- [ ] Database: `portfolio_ai`
- [ ] Collection: `embeddings`
- [ ] Click "Create Search Index"
- [ ] Wait for index to build (~2-5 minutes)

### Test Vector Search
- [ ] Create test script: `test-vector-search.js`
```javascript
  // Generate test embedding
  // Run vector search query
  // Verify results returned
```
- [ ] Run script
```bash
  node test-vector-search.js
```
- [ ] Expected output:
  - Top 5 similar chunks returned
  - Results have similarity scores
  - Query latency < 500ms

### Optimize Index (Optional)
- [ ] If search is slow:
  - [ ] Check index status (Atlas dashboard)
  - [ ] Verify dimensions match (1536)
  - [ ] Consider adding filters (category field)

**Checkpoint:** ✅ Vector search index active, queries returning relevant results

---

## 🚀 PHASE 7: Deployment to Vercel

**Objective:** Deploy to production and set up automation

### Pre-Deployment Checklist
- [ ] Verify all environment variables set locally
- [ ] Test full flow locally one more time
- [ ] Commit all changes to git
```bash
  git add .
  git commit -m "Add AI companion feature"
```
- [ ] Push to GitHub
```bash
  git push origin main
```

### Vercel Setup
- [ ] Connect GitHub repo to Vercel
  - [ ] Log in to vercel.com
  - [ ] Click "Import Project"
  - [ ] Select your GitHub repo
  - [ ] Framework: Next.js (auto-detected)
  
- [ ] Configure environment variables
  - [ ] Go to Project Settings → Environment Variables
  - [ ] Add all variables from `.env.local`:
    - MONGODB_URI
    - MONGODB_DB_NAME
    - OPENAI_API_KEY
    - EMBEDDING_MODEL
    - OPENROUTER_API_KEY
    - LLM_MODEL
    - LLM_MAX_TOKENS
    - LLM_TEMPERATURE
    - GITHUB_TOKEN (if using)
    - GITHUB_USERNAME
    - ADMIN_SECRET
    - NEXT_PUBLIC_APP_URL (update to your Vercel URL)
  - [ ] Mark sensitive variables as "Secret"
  
- [ ] Deploy
  - [ ] Click "Deploy"
  - [ ] Wait for build to complete (~2-3 minutes)
  - [ ] Note your production URL (e.g., your-site.vercel.app)

### Configure Vercel Cron
- [ ] Create `vercel.json` in repo root
```json
  {
    "crons": [{
      "path": "/api/ai/refresh",
      "schedule": "0 2 * * *"
    }]
  }
```
- [ ] Commit and push
```bash
  git add vercel.json
  git commit -m "Add daily cron job for index refresh"
  git push origin main
```
- [ ] Verify cron in Vercel dashboard
  - [ ] Go to Project → Cron Jobs
  - [ ] Should see job scheduled for 2 AM daily

### Post-Deployment Testing
- [ ] Visit production site
  - [ ] Open https://your-site.vercel.app
  - [ ] Verify site loads correctly
  
- [ ] Test AI companion
  - [ ] Click chat button
  - [ ] Send test query: "What did Umang work on at Hunch?"
  - [ ] Verify response is relevant
  - [ ] Test 5 more queries
  
- [ ] Trigger initial index build
```bash
  curl -X POST https://your-site.vercel.app/api/ai/create-index \
    -H "Content-Type: application/json" \
    -d '{"forceRebuild": true}'
```
  - [ ] Wait for completion (~30 seconds)
  - [ ] Test query again to verify index is built
  
- [ ] Test manual rebuild endpoint
```bash
  curl -X POST https://your-site.vercel.app/api/ai/rebuild \
    -H "Content-Type: application/json" \
    -d '{"secret": "your-ADMIN_SECRET"}'
```
  - [ ] Should return success
  
- [ ] Monitor logs
  - [ ] Vercel dashboard → Functions → View logs
  - [ ] Check for errors
  - [ ] Verify API calls succeeding

### Performance Monitoring
- [ ] Set up monitoring (first week)
  - [ ] Track query latency (Vercel Analytics)
  - [ ] Monitor OpenAI API usage (OpenAI dashboard)
  - [ ] Monitor OpenRouter API usage (OpenRouter dashboard)
  - [ ] Check MongoDB Atlas metrics (Atlas dashboard)
  
- [ ] Set cost alerts
  - [ ] OpenAI: Alert if costs > $10/month
  - [ ] MongoDB: Alert if storage > 400 MB
  - [ ] Vercel: Alert if bandwidth > 80 GB

**Checkpoint:** ✅ Deployed to production, cron job active, monitoring in place

---

## 🎉 COMPLETION CHECKLIST

### Functional Requirements
- [ ] Users can open chat modal from portfolio site
- [ ] Users can ask questions in natural language
- [ ] AI responds with relevant, contextual answers
- [ ] Responses cite sources (LinkedIn, Resume, Journey, GitHub)
- [ ] Conversation history maintained within session
- [ ] Responses are in Umang's voice (first person)

### Technical Requirements
- [ ] All PDFs loading correctly
- [ ] Chunking strategies working (LinkedIn vs Journey)
- [ ] Embeddings generated via OpenAI
- [ ] Vector search returning relevant results
- [ ] LLM using OpenRouter free tier
- [ ] File change detection functional
- [ ] Daily cron job running
- [ ] Manual rebuild endpoint working

### Performance Requirements
- [ ] Query response time < 3 seconds (p95)
- [ ] Vector search < 500ms
- [ ] Embedding generation < 5 seconds (full rebuild)
- [ ] Chat interface loads < 1 second

### Quality Requirements
- [ ] Test 20 different queries
- [ ] 80%+ responses are relevant and accurate
- [ ] No hallucinations (responses based on retrieved context)
- [ ] Error handling works (graceful failures)

### Documentation
- [ ] PRD.md exists and is current
- [ ] ARCHITECTURE.md exists and is current
- [ ] TODO.md completed (this file)
- [ ] MIGRATION_GUIDE.md exists
- [ ] README.md updated with AI companion feature

---

## 📝 NOTES & LEARNINGS

### Issues Encountered
(Document problems and solutions here as you work)

### Performance Optimizations Made
(Document any optimizations beyond the baseline plan)

### Future Enhancements
(Ideas for V2, V3)

---

## 🏆 PROJECT COMPLETE

**Final checks:**
- [ ] All phases completed
- [ ] Production site working
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Celebration! 🎊

**Project completion date:** _______________

**Total time spent:** _______________

**Key learnings:**
1. 
2. 
3. 

**Next project:** _______________