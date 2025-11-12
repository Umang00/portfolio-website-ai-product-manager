# Product Requirements Document: Portfolio Website with AI Companion

> **Owner**: Umang Thakkar  
> **Scope**: One-page portfolio site demonstrating proof of product craft, metrics, and direct contact within 60 seconds, enhanced with an intelligent AI companion for interactive Q&A.

---

## Part 1: Portfolio Website Requirements

### 1. 🎯 Purpose & Vision

Build a **fast, personable, skimmable** portfolio for an **AI-native PM & builder**. It should load in **≤ 1.5 s**, show **metrics and proof** immediately, and provide **Email / Calendly / WhatsApp** in **≤ 2 clicks**.

### 2. ❗ Problem Statement

Template sites are slow, generic, and hide outcomes. Busy reviewers skim for seconds and bounce if value isn't obvious.

### 3. 📈 Success Metrics

- **Speed** — LCP (4G desktop) ≤ 1.5 s; JS bundle ≤ 150 kB gz.
- **Engagement** — ≥ 85% reach **Shipped Highlights**.
- **Conversion** — ≥ 10% click **Email / Calendly / WhatsApp**.
- **Quality** — Lighthouse Performance ≥ 95; 0 critical a11y issues.

### 4. 👤 Personas & JTBD

- **Hiring Manager** — "Can this PM ship measurable results?"  
- **Seed VC** — "Is this builder compelling and fast?"  
- **Engineer Collaborator** — "Do we share stack & craft values?"

### 5. 🔑 Guiding Principles

- **Skim-first**: metrics, tools, logos visible within first scroll.  
- **Delight, not distract**: subtle motion; no heavy WebGL.  
- **Swap-friendly**: all copy/data in small TS arrays.  
- **Mobile-first**: perfect on small viewports.
- **Data-Driven**: each project card displays KPIs.

### 6. 🔧 Functional Requirements (per section)

#### 6.1 Hero (Sticky + AI Companion)
- **Greeting pill** (cycles every 4s).
- **Sticky header nav** with smooth anchor links: *Process, Highlights, Projects, Social Proof, Journey, Contact*.
- **Social Proof** points to Trusted By section on click and covers Trusted By and Wall of Love sections
- **Typewriter H1**: "I'm Umang — building products that *ship → scale → monetize*."
- **12-word blurb** (fade-in)
- **social icons** (LinkedIn, GitHub).
- **AI Companion Lite** input (Edge, `@vercel/ai`, GPT-4o) with streaming, debounce, abort on route change.
- **Static multi-armed PM illustration** (right-aligned ~38% width). No animation; accessible alt text.
- **Background**: subtle gradient + noise texture (light/dark aware).

#### 6.2 KPI Chips (Count-up Section)
- Dedicated section immediately under Hero with 4–6 **count-up** chips (e.g., *100k+ polls*, *3.2× match-rate*).
- Large, tappable; stagger 80 ms; respect `prefers-reduced-motion` by disabling the count-up.

#### 6.3 Process Wheel (5-step)
- **Order**: **Research → Build → Launch → Measure → Learn**.  
- Central **whiteboard/doodle** image; circular layout with dashed guide.  
- Each step has **title + 1-sentence** description on hover/focus; keyboard focusable.  
- SVG stroke draw over 1.5 s; skipped under reduced-motion.

#### 6.4 Shipped Highlights
- Six+ **impact chips/cards**, each with 1–2 bullet outcomes.  
- Auto-scroll carousel (keen-slider), pause on hover, arrow keys; maintains **3-up** on desktop, **1-up** mobile.  
- Cards larger than v0 A-1; high-contrast; emoji or mini-icons allowed.

#### 6.5 Featured Projects
- Larger **image-first** cards (no inline video).  
- Badges: **GitHub**, **Live**, **YouTube** (optional link out).  
- Click opens a **sheet modal** with a short 2-paragraph description and KPIs.  
- Tilt ≤ 6° on hover; reduced-motion disables tilt.

#### 6.6 Trusted By (Client Logos)
- Wider **marquee lane**: 18 s loop, pause on hover; greyscale → color on hover.  
- Logos sized for legibility; supports 12–16 items.

#### 6.7 Wall of Love (Testimonials)
- **Desktop**: 2-column pager that **auto-swaps** every 6 s (exit left, enter from right).  
- **Mobile**: horizontal scroll with snap.  
- Card: 48px avatar (with ring), name, role, LinkedIn glyph (blue "in"), quote with "Read more ▾".

#### 6.8 My Toolkit (Dual Scrollers)
- **Left**: two **belt scrollers** of tool logos; top belt L→R, bottom belt R→L (infinite, 20 s).  
- **Right**: categorized lists (Frontend, Backend, Data, Analytics, AI, DX).  
- Falls back to static list if `prefers-reduced-motion`.

#### 6.9 Journey (Timeline / About)
- `react-vertical-timeline`; first card functions as **About**.
- Items fade in on scroll
- **Multiple roles at one company** collapse into an expandable card (e.g., Hunch: Writer → Strategist → APM).  
- Supports images/GIFs; responsive variable height.

#### 6.10 Contact Me (Section, not FAB)
- Inputs: **Name**, **Email**, **Website/Social (optional)**, **Message**.  
- Buttons: **Send Email** (Resend → `umangthakkar005@gmail.com`), **Book 30 min** (Calendly embed), **WhatsApp** (`https://wa.me/919426154668`).  
- Server POST also inserts Supabase `leads` row.  
- Success and error toasts; spam honeypot.

#### 6.11 Footer
- Back-to-top **arrow** (bottom-left fixed).  
- Social links: LinkedIn and GitHub.
- Résumé (PDF link), copyright, light/dark aware.

#### 6.12 404 Easter-Egg
- `/404` with playful LoRA-jar tumble; CTA back home.

### 7. 🛠️ Back-End APIs (Portfolio)

| Route                 | Method | Purpose                              | Tech                     |
|----------------------|--------|--------------------------------------|--------------------------|
| `/api/companion?q=`  | GET    | Stream markdown from AI Companion    | @vercel/ai, GPT-4o, Edge |
| `/api/contact`       | POST   | Resend email + Supabase insert       | Resend, Supabase Edge    |

### 8. 🚧 Non-Functional Requirements (Portfolio)

- JS Bundle: **≤ 150 kB gzipped**
- Render blocking time: **≤ 100 ms**
- Accessibility: **WCAG 2.1 AA**
- SEO: meta tags + OG tags, `sitemap.xml`
- CI/CD:
  - GitHub PR → Vercel Preview with Lighthouse-CI gate (≥ 95).
  - `pnpm` as package manager.
- Analytics: Plausible (deferred script, privacy-first)

### 9. 🧱 Tech Stack (Portfolio)

- **Framework**: Next.js 14 (App Router, Edge runtime)
- **Styling**: Tailwind CSS (dark-mode toggle)
- **UI Kit**: shadcn/ui (Radix-based)
- **Motion**: Framer Motion 6
- **Carousel**: keen-slider
- **Tilt**: react-parallax-tilt
- **AI API**: @vercel/ai + GPT-4o
- **Email**: Resend
- **DB**: Supabase
- **Analytics**: Plausible

---

## Part 2: AI Companion Requirements

### Overview

Add an intelligent AI companion to the portfolio website that can answer questions about Umang Thakkar's professional background, projects, skills, and journey using Retrieval-Augmented Generation (RAG).

### Objectives

1. **Primary Goal:** Enable visitors (recruiters, VCs, collaborators) to interactively learn about Umang through natural conversation
2. **Learning Goal:** Understand RAG architecture, embeddings, vector search, and LLM orchestration
3. **Technical Goal:** Build production-ready AI feature using modern stack

### Target Users

- **Recruiters:** Looking for specific skills, experience, and cultural fit
- **VCs/Investors:** Evaluating product thinking, execution capability, and domain expertise
- **Collaborators:** Understanding project history and technical capabilities
- **General Visitors:** Learning about Umang's journey and philosophy

### Core Features

#### 1. Conversational Q&A
- Natural language queries about experience, projects, skills
- Context-aware responses based on retrieved documents
- Conversation history maintained automatically across multiple turns (frontend manages state)
- Personalized responses reflecting Umang's voice and tone
  - First-person, natural conversational style
  - No mention of technical implementation details (files, documents, context)
  - User-friendly source names displayed (e.g., "Resume", "LinkedIn Profile", "Journey (2025-2026)")

#### 2. Multi-Source Knowledge Base
**Data Sources:**
- LinkedIn profile (professional history, achievements)
- Resume (structured experience summary)
- Journey documents (decision-making processes, learnings, psychology)
- GitHub repositories (technical projects, code samples)

**Source Priority:**
- Recent information > older information
- Specific achievements > general descriptions
- First-person narrative > third-party descriptions

#### 3. Smart Retrieval System
- **Query Analysis:** Automatic detection of query intent (work experience, journey stories, technical projects, skills)
- **Metadata Filtering:** Filter results by category, source, timeframe, recency
- **Re-ranking:** Multi-signal scoring combining vector similarity, category relevance, recency, and chunk quality
- **Relevance Scoring:** Display confidence scores for retrieved sources
- **Suggested Follow-ups:** Context-aware follow-up questions based on retrieved content

#### 4. Chat Interface ⚠️ **NOT YET IMPLEMENTED** (Phase 5)
**Status:** Backend API is complete, but frontend UI components are missing.

**Planned Features:**
- Modal overlay (doesn't disrupt main site navigation)
- Clean, modern UI matching portfolio theme
- Message history display
- Loading states and error handling
- Optional: Voice input support
- Optional: Suggested follow-up questions

**Current Workaround:** Users can test the API via `/api-test` page, but there is no integrated chat UI on the main portfolio site.

#### 5. Admin Features
- ✅ Manual index rebuild trigger (authenticated endpoint) - **IMPLEMENTED**
- ⚠️ Automatic daily rebuild (via cron job) - **PARTIAL** (endpoint exists, vercel.json not configured)
- ❌ File change detection (hash-based) - **NOT IMPLEMENTED** (Phase 3)
- ✅ **API Testing Interface**: Swagger-like UI for testing all endpoints - **IMPLEMENTED**
  - Located at `/api-test`
  - Tests all RAG pipeline phases without generating embeddings
  - Secure admin authentication with local storage
  - Interactive request/response interface

### Technical Requirements (AI Companion)

#### Performance
- Query response time: < 3 seconds (p95)
- Embedding generation: < 5 seconds for full rebuild
- Vector search: < 500ms
- Chat interface load: < 1 second
- Re-ranking overhead: < 100ms
- Smart search total: < 600ms (vs 500ms for basic search)

#### Scalability
- Support 100+ concurrent users
- Handle 1000+ queries per day
- Store 500-1000 document chunks
- Maintain 50+ conversation histories

#### Cost Constraints
- Embedding costs: < $5/month
- LLM costs: Use free tier (OpenRouter)
- Database: MongoDB Atlas free tier (M0)
- Hosting: Vercel free tier

#### Security
- API keys stored in environment variables
- Admin endpoints protected with secret key
- Rate limiting on public endpoints
- No PII collection from users

### Non-Functional Requirements (AI Companion)

#### Reliability
- 99% uptime (excluding scheduled maintenance)
- Graceful degradation if LLM API unavailable
- Automatic retry logic for transient failures

#### Maintainability
- Clear code documentation
- Modular architecture (easy to swap components)
- Comprehensive error logging
- Version-controlled knowledge base

#### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Mobile responsive design

### Success Metrics (AI Companion)
- **Engagement:** Average 3+ queries per visitor who opens chat
- **Quality:** 80%+ queries receive relevant responses (manual review)
- **Performance:** 95% of responses in < 3 seconds
- **Adoption:** 20%+ of site visitors interact with AI companion
- **Relevance:** 90%+ queries retrieve correct source category (work vs journey vs technical)
- **Engagement:** 40%+ users click suggested follow-up questions
- **Source Quality:** Average relevance score > 75% for top-ranked chunks

### Out of Scope (Future Versions)
- Multi-language support
- Text-to-speech (AI voice responses)
- Personalized responses based on visitor profile
- Integration with calendar for scheduling meetings
- Analytics dashboard for query patterns
- Fine-tuning custom model on Umang's writing style

### Dependencies (AI Companion)
- Next.js (existing site framework)
- MongoDB Atlas (vector database)
- OpenAI API (embeddings)
- OpenRouter API (LLM completions)
- Vercel (hosting + cron jobs)

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM generates incorrect info | High | Use retrieval context strictly, add disclaimer |
| Embedding costs exceed budget | Medium | Monitor usage, implement caching |
| Poor response quality | High | Extensive testing with sample queries |
| File updates not reflected | Medium | Hash-based change detection + manual trigger |
| Vercel free tier limits hit | Medium | Implement rate limiting, upgrade if needed |

### Timeline (AI Companion)
- **Phase 0-1:** Backend setup (2 days)
- **Phase 2-3:** Document processing (2 days)
- **Phase 4:** LLM integration (1 day)
- **Phase 5:** Frontend (1 day)
- **Phase 6-7:** Deploy & test (1 day)
- **Total:** 7 days (focused work)

---

## Part 3: Integration Requirements

### How AI Companion Integrates with Portfolio

1. **Hero Section Integration**
   - AI Companion input field in hero section
   - Quick access without leaving main page
   - Streaming responses displayed inline

2. **Project Cards Integration**
   - "Ask AI Companion" button in project detail modals
   - Context-aware queries about specific projects
   - Seamless transition from project view to chat

3. **Shared Components**
   - Dark/light mode support across both systems
   - Consistent UI/UX design language
   - Shared state management for theme preferences

4. **User Experience Flow**
   - Visitor lands on portfolio → sees hero with AI Companion
   - Can ask questions immediately or explore portfolio first
   - AI Companion provides context-aware answers based on portfolio content
   - Smooth navigation between portfolio sections and AI chat

### Combined Success Metrics

- **Portfolio Performance:** Lighthouse ≥ 95, LCP ≤ 1.5s
- **AI Companion Performance:** Query response < 3s (p95)
- **Overall Engagement:** 85%+ reach Shipped Highlights, 20%+ interact with AI
- **Conversion:** 10%+ click contact methods, 40%+ click AI follow-ups

---

## Approval & Sign-off

- **Product Owner:** Umang Thakkar
- **Developer:** Umang Thakkar
- **Date:** January 2025
