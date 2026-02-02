# System Architecture: Portfolio Website with AI Companion

## Overview

This document describes the complete system architecture for the portfolio website and its integrated AI Companion feature. The system is built on Next.js 14 with App Router, using TypeScript for type safety and Tailwind CSS for styling.

---

## Part 1: Portfolio Website Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PORTFOLIO FRONTEND                       │
│  - Hero Section (with AI Companion input)                  │
│  - KPI Chips (count-up animations)                          │
│  - Process Wheel (5-step visualization)                    │
│  - Featured Projects (carousel with modals)                  │
│  - Trusted By (client logos marquee)                        │
│  - Wall of Love (testimonials)                              │
│  - Skills & Stack (toolkit showcase)                        │
│  - Journey Timeline (career progression)                    │
│  - Contact Section (form + Calendly + WhatsApp)            │
│  - Footer (back-to-top, social links)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PORTFOLIO API LAYER (Next.js)                   │
│  /api/contact       - Contact form submission               │
│  /api/companion?q=  - AI Companion streaming (legacy)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│  - Resend (email delivery)                                  │
│  - Supabase (contact form storage)                         │
│  - Calendly (scheduling)                                    │
│  - Plausible (analytics)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

**Location:** `/components/`

#### Core Portfolio Components

1. **`hero.tsx`** - Hero Section
   - Greeting pill (cycles every 4s)
   - Typewriter H1 with dynamic verbs
   - AI Companion input field (integrated)
   - Social buttons (LinkedIn, GitHub, Resume)
   - Multi-armed PM illustration
   - Sticky notes animation
   - Scroll reveal animations

2. **`sticky-header.tsx`** - Navigation Header
   - Sticky positioning on scroll
   - Active section highlighting (scroll spy)
   - Smooth scroll to anchors
   - Mobile drawer menu
   - Theme toggle integration
   - Navigation items: Home, Process, Projects, Social Proof, Journey, Tools, Contact

3. **`kpi-section.tsx`** - KPI Chips
   - Count-up animations (staggered 80ms)
   - Respects `prefers-reduced-motion`
   - Large, tappable chips
   - Displays metrics (100k+ polls, 3.2× match-rate, etc.)

4. **`process-wheel.tsx`** - Process Visualization
   - 5-step circular layout: Research → Build → Launch → Measure → Learn
   - SVG stroke animation (1.5s)
   - Tooltips on hover/focus
   - Keyboard accessible
   - Central whiteboard/doodle image

5. **`projects-slider.tsx`** - Featured Projects Carousel
   - Auto-scroll carousel (3s interval)
   - Pause on hover/interaction
   - Responsive: 3-up desktop, 1-up mobile
   - Integration with project detail modals
   - Custom hooks for visibility/page state management

6. **`projects/project-card.tsx`** - Individual Project Card
   - Image-first design
   - Status badges (Active/In Progress/Inactive)
   - Action buttons: View Details, View Demo, View YouTube
   - Tilt animation on hover (≤6°)
   - Technology tags (optional)

7. **`projects/project-details-modal.tsx`** - Project Detail Modal
   - Sheet modal with project information
   - 2-paragraph description
   - KPI display
   - "Ask AI Companion" button integration
   - Links to GitHub, Live Demo, YouTube

8. **`client-logos.tsx`** - Trusted By Section
   - Marquee animation (18s loop)
   - Pause on hover
   - Greyscale → color on hover
   - Supports 12-16 logos

9. **`wall-of-love.tsx`** - Testimonials
   - Desktop: 2-column auto-swap (6s interval)
   - Mobile: horizontal scroll with snap
   - Avatar with ring (48px)
   - LinkedIn integration
   - "Read more" expandable quotes

10. **`skills-and-stack.tsx`** - Toolkit Section
    - Core Skills grid (3 columns)
    - Tech Stack marquee (dual belt scrollers)
    - Categorized lists (Frontend, Backend, Data, Analytics, AI, DX)
    - Falls back to static list if reduced motion

11. **`timeline.tsx`** - Journey/About Section
    - Vertical timeline layout
    - First card functions as About section
    - Multiple roles at one company (expandable)
    - Fade-in on scroll
    - Supports images/GIFs

12. **`contact-section.tsx`** - Contact Form
    - Name, Email, Website/Social (optional), Message inputs
    - Send Email button (Resend integration)
    - Book 30 min button (Calendly modal)
    - WhatsApp deep-link
    - Success/error toasts
    - Spam honeypot

13. **`footer.tsx`** - Footer
    - Back-to-top arrow (fixed bottom-left)
    - Social links (LinkedIn, GitHub, Resume)
    - Copyright notice
    - Light/dark aware

14. **`back-to-top.tsx`** - Back to Top Button
    - Appears after 120vh scroll
    - Smooth scroll to top
    - Fixed bottom-left positioning

#### Animation Components

**Location:** `/components/animations/`

- `scroll-reveal.tsx` - Scroll-triggered animations (fadeInUp, fadeInLeft, fadeInRight)
- `parallax.tsx` - Parallax scrolling effects
- `animated-card.tsx` - Card animations
- `animated-button.tsx` - Button animations
- `3d-container.tsx` - 3D container effects
- `3d-highlight.tsx` - 3D highlight effects

#### UI Components

**Location:** `/components/ui/`

- `button.tsx` - Button component (shadcn/ui)
- `badge.tsx` - Badge component
- `input.tsx` - Input component
- `textarea.tsx` - Textarea component
- `dialog.tsx` - Dialog/Modal component
- `carousel.tsx` - Carousel component
- `tooltip.tsx` - Tooltip component
- `skeleton.tsx` - Loading skeleton
- `social-buttons.tsx` - Social media buttons

#### Custom Hooks

**Location:** `/hooks/`

- `use-reduced-motion.ts` - Detects user's motion preference
- `use-intersection-observer.ts` - Observes element visibility
- `use-page-visibility.ts` - Detects tab visibility
- `use-auto-scroll.ts` - Manages auto-scroll with pause
- `use-speech-input.ts` - Voice input for AI Companion
- `use-sound.ts` - Sound effects (celebration, tick)

### State Management

- **Theme State**: Managed via `theme-provider.tsx` (light/dark mode)
- **Modal State**: Local component state (open/close)
- **Form State**: React Hook Form (contact form)
- **Carousel State**: Custom hooks managing auto-scroll, pause/resume
- **Scroll State**: Scroll spy for active section highlighting

### API Routes (Portfolio)

**Location:** `/app/api/`

#### `/api/contact/route.ts`

- **Method:** POST
- **Purpose:** Handle contact form submissions
- **Process:**
  1. Validate input (name, email, message)
  2. Send email via Resend to `umangthakkar005@gmail.com`
  3. Insert row into Supabase `leads` table
  4. Return success/error response
- **Output:** `{ success: boolean, message: string }`

#### `/api/companion/route.ts` (Legacy)

- **Method:** GET
- **Purpose:** Legacy AI Companion endpoint (replaced by `/api/ai/query`)
- **Status:** ⚠️ May be deprecated in favor of new AI Companion API

### Technology Stack (Portfolio)

| Layer         | Technology              | Purpose                      |
| ------------- | ----------------------- | ---------------------------- |
| Framework     | Next.js 14 (App Router) | React framework with SSR/SSG |
| Language      | TypeScript              | Type safety                  |
| Styling       | Tailwind CSS            | Utility-first CSS            |
| UI Components | shadcn/ui (Radix)       | Accessible component library |
| Motion        | Framer Motion 6         | Animations                   |
| Carousel      | keen-slider             | Carousel functionality       |
| Tilt          | react-parallax-tilt     | 3D tilt effects              |
| Typewriter    | react-simple-typewriter | Typewriter animation         |
| Count-up      | react-countup           | Number animations            |
| Email         | Resend                  | Email delivery               |
| Database      | Supabase                | Contact form storage         |
| Analytics     | Plausible               | Privacy-first analytics      |
| Hosting       | Vercel                  | Deployment platform          |

### Performance Optimizations

- **Image Optimization**: Next.js `Image` component with lazy loading
- **Code Splitting**: Automatic via Next.js App Router
- **Bundle Size**: Target ≤ 150 kB gzipped
- **LCP Target**: ≤ 1.5s (4G desktop)
- **Lighthouse Score**: ≥ 95
- **Accessibility**: WCAG 2.1 AA compliance

---

## Part 2: AI Companion Architecture

### System Overview

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

### Component Details

#### 1. Frontend Layer

**Location:** `/components/ai/`, `/components/api-test/`, and `/components/projects/`

**AI Companion Components:** ✅ **IMPLEMENTED** - Phase 5

- `chat-overlay.tsx` - Full-screen chat interface (uses createPortal for full-page rendering)
- `message-bubble.tsx` - Individual message display
- `suggested-questions.tsx` - Follow-up prompts
- Voice input integrated via `use-speech-input.ts` hook

**API Testing Interface:**

- `/app/api-test/page.tsx` - Main API testing page
- `/components/api-test/APITester.tsx` - Interactive API tester component
- Features:
  - Swagger-like interface for all endpoints
  - Admin authentication with local storage
  - Automatic secret injection for authenticated requests
  - Request/response display with syntax highlighting
  - Support for GET (query params) and POST (JSON body) requests

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

#### `/api/ai/query/route.ts`

- **Method:** POST
- **Input:** `{ query: string, conversationHistory?: array }`
- **Process:**
  1. Validate input (non-empty, max 1000 chars)
  2. Call `queryAI()` from service layer
  3. Return response with sources
- **Output:** `{ answer: string, sources: array, suggestedQuestions?: array }`

#### `/api/ai/create-index/route.ts`

- **Method:** POST
- **Input:** `{ forceRebuild?: boolean }`
- **Process:**
  1. Call `buildMemoryIndex(forceRebuild)`
  2. Log progress
- **Output:** `{ success: boolean, chunksCreated: number, documentsProcessed: number }`

#### `/api/ai/refresh/route.ts`

- **Method:** POST (called by Vercel Cron)
- **Process:**
  1. Check for file changes
  2. Rebuild if needed
- **Output:** `{ success: boolean, message: string }`

#### `/api/ai/rebuild/route.ts`

- **Method:** POST, GET
- **Auth:** Requires `ADMIN_SECRET` in request body (POST) or query param (GET)
- **Process:** Force full rebuild regardless of changes
- **Output:** `{ success: boolean, message: string, chunksCreated: number, documentsProcessed: number, stats: object }`

#### Test Endpoints

- `/api/ai/test-pdf-parsing/route.ts` - Test PDF parsing without embeddings
- `/api/ai/test-chunking/route.ts` - Test document chunking
- `/api/ai/test-pdfs/route.ts` - List and test all PDFs

### 3. AI Service Layer

**Location:** `/lib/ai/`

#### `service.js` (Main Orchestrator)

**Key Functions:**

- `buildMemoryIndex(forceRebuild)` - Load docs, chunk, embed, store
- `queryAI(query, conversationHistory)` - Retrieve context, generate response
- `checkForChanges()` - Hash-based file change detection
- `analyzeQuery(query)` - Extract intent and metadata filters from query
- `generateSuggestedQuestions(query, chunks)` - Context-aware follow-ups

#### `embeddings.js`

**Purpose:** Generate embeddings using OpenAI API

- Model: `text-embedding-3-small`
- Dimensions: 1536
- Batch size: 50

#### `llm.js`

**Purpose:** Generate responses using OpenRouter

- Model: `meta-llama/llama-3.1-8b-instruct:free`
- Max tokens: 2000
- Temperature: 0.7
- First-person responses in Umang's voice

#### `vector-store.js`

**Purpose:** MongoDB Atlas operations

- `storeEmbeddings(chunks)` - Batch insert
- `searchSimilar(queryEmbedding, limit)` - Basic vector kNN search
- `smartSearch(queryEmbedding, filters, limit)` - Multi-stage retrieval with filtering and re-ranking
- `rerankResults(chunks, filters)` - Multi-signal scoring algorithm

#### `file-watcher.ts`

**Purpose:** Detect document changes

- SHA-256 hash comparison for PDFs
- Timestamp comparison for GitHub repos
- Only processes changed files to reduce API costs

### 4. Document Loaders

**Location:** `/lib/ai/loaders/`

- `pdf-loader.ts` - Load all PDF documents (resume, LinkedIn, journey)
- `github-loader.js` - Fetch GitHub repos via API
- `resume-loader.js` - Parse resume with section detection

### 5. Chunking Strategies

**Location:** `/lib/ai/chunking/`

- `professional-chunker.ts` - For LinkedIn PDF, Resume (400-800 tokens)
- `narrative-chunker.ts` - For Journey PDFs (450-500 tokens, smart overlap)
- `generic-chunker.ts` - Fallback for unknown types (500 tokens)
- `markdown-chunker.ts` - For GitHub README files (400-600 tokens)
- `boundary-detector.ts` - Shared utility for smart boundary detection

### 6. Vector Database

**Platform:** MongoDB Atlas (Free M0 tier)
**Search Index:** Atlas Search with kNN vector support
**Collection:** `memoryIndex` (stores chunks with embeddings)
**Status:** ✅ **VERIFIED** - Vector search index active, 254 documents indexed

---

## Part 4: Polymorphic Architecture (The "3-in-1" System)

### Concept

The portfolio creates three distinct user experiences from a single codebase, tailored to specific viewer personas. This allows for hyper-personalized messaging while maintaining a single source of truth for code.

### Control Mechanism

- **Environment Variable:** `NEXT_PUBLIC_PERSONA` ("pm" | "builder" | "consultant")
- **Default:** Falls back to "pm" if undefined.
- **URL Override:** Can be overridden via query parameter `?persona=builder` for testing/specific links.

### Implementation Layers

#### 1. Content Layer (`lib/content-data.ts`)

A central dictionary serves all text variation. Components request data by key, and the system resolves the correct string based on the active persona.

```typescript
export const heroContent = {
  pm: { title: "Product Manager", subtitle: "Shipping impact..." },
  builder: { title: "AI Engineer", subtitle: "Building pipelines..." },
  consultant: {
    title: "Solutions Architect",
    subtitle: "Automating workflows...",
  },
};
```

#### 2. Component Adaptation

Key components render differently based on the active persona:

- **Hero Section:** Different value propositions, titles, and background emphases.
- **Projects Showcase:** Projects are re-ordered and descriptions are re-written.
  - _Example:_ "Voice Agent" is framed as "User Research Tool" for PMs, but "Twilio/Websockets Implementation" for Builders.
- **Skills & Stack (`skills-and-stack.tsx`):**
  - **PM:** Focus on Strategy, Metrics, No-Code.
  - **Builder:** Focus on Tech Stack, Architecture, Code.
  - **Consultant:** Focus on ROI, Automation, Delivery.
- **Contact Section:** CTAs change ("Strategy Session" vs "Tech Deep Dive").
- **Assets:** Dynamic resume links (`/resumes/resume-pm.pdf`, etc).

#### 3. Deployment Strategy

Three Vercel deployments connected to the same git repository, each with a different environment variable:

- `umang-pm.vercel.app` (Persona: PM)
- `umang-build.vercel.app` (Persona: Builder)
- `umang-consult.vercel.app` (Persona: Consultant)

---

## Part 5: System Integration

### How Portfolio and AI Companion Integrate

1. **Hero Section Integration**
   - AI Companion input field embedded in hero section
   - Quick access without leaving main page
   - Streaming responses displayed inline

2. **Project Cards Integration**
   - "Ask AI Companion" button in project detail modals
   - Context-aware queries about specific projects
   - Seamless transition from project view to chat

3. **Shared Components**
   - Dark/light mode support across both systems
   - Consistent UI/UX design language (shadcn/ui components)
   - Shared state management for theme preferences
   - Common animation patterns (scroll reveal, fade-in)

4. **User Experience Flow**
   - Visitor lands on portfolio → sees hero with AI Companion
   - Can ask questions immediately or explore portfolio first
   - AI Companion provides context-aware answers based on portfolio content
   - Smooth navigation between portfolio sections and AI chat

5. **Data Flow Integration**
   - Portfolio projects data (`components/projects/projects-data.ts`) used by AI Companion for context
   - AI Companion can reference portfolio projects in responses
   - Shared contact form infrastructure (Resend, Supabase)

### Combined Technology Stack

| Layer         | Technology                     | Purpose                 |
| ------------- | ------------------------------ | ----------------------- |
| Framework     | Next.js 14 (App Router)        | React framework         |
| Language      | TypeScript                     | Type safety             |
| Styling       | Tailwind CSS                   | UI styling              |
| UI Components | shadcn/ui (Radix)              | Component library       |
| Motion        | Framer Motion 6                | Animations              |
| Vector DB     | MongoDB Atlas (M0)             | Embeddings storage      |
| Embeddings    | OpenAI text-embedding-3-small  | Vector generation       |
| LLM           | OpenRouter (Llama 3.1 8B free) | Chat completions        |
| PDF Parsing   | pdf-parse-new                  | Extract text from PDFs  |
| Email         | Resend                         | Email delivery          |
| Database      | Supabase                       | Contact form storage    |
| Analytics     | Plausible                      | Privacy-first analytics |
| Hosting       | Vercel                         | Deployment platform     |

### Deployment Architecture

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
    ├─ Serves portfolio frontend
    ├─ Runs API routes (portfolio + AI)
    ├─ Executes cron jobs (daily 2 AM for AI index rebuild)
    │
    ▼
External Services
    ├─ MongoDB Atlas (vector storage)
    ├─ OpenAI API (embeddings)
    ├─ OpenRouter API (LLM)
    ├─ Resend (email)
    ├─ Supabase (contact storage)
    └─ Plausible (analytics)
```

### Environment Variables

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

# Resend (Portfolio)
RESEND_API_KEY="re_..."

# Supabase (Portfolio)
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
```

### Security Considerations

1. **API Keys:** Never commit to git, use .env.local
2. **Admin Endpoints:** Require secret token
3. **Rate Limiting:** Implement on public endpoints
4. **Input Validation:** Sanitize user queries and form inputs
5. **CORS:** Restrict to your domain only
6. **Error Messages:** Don't leak internal details

### Monitoring & Logging

**Key Metrics:**

- Portfolio: Lighthouse Performance ≥ 95, LCP ≤ 1.5s
- AI Companion: Query latency (p50, p95, p99), embedding API costs, LLM API calls
- Overall: Page views, engagement, conversion rates

**Logging Strategy:**

- Use `console.log` for development
- Use structured logging in production (JSON format)
- Log all API calls with timestamps
- Track errors with stack traces

### Scalability Considerations

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

---

## Future Enhancements

**Portfolio V2:**

- Enhanced animations and micro-interactions
- More project showcases
- Blog section integration
- Newsletter signup

**AI Companion V2:**

- Fine-tune model on Umang's writing style
- Multi-modal support (images, diagrams)
- Voice output (text-to-speech)
- Analytics dashboard (query patterns, popular topics)
- Visitor profiling (tailor responses to recruiter vs VC)
- Integration with calendar (schedule meetings)

**Integration V2:**

- AI-powered project recommendations
- Context-aware navigation suggestions
- Personalized content based on visitor profile
