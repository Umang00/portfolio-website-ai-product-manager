# Portfolio Projects RAG Context

This document contains detailed information about all portfolio projects for the AI Companion RAG system. Updated to sync with website and resume content.

---

## 1. Voice-Based UXR Agent

### Overview

AI-powered voice agent system that conducts, transcribes, and analyzes user research interviews at scale. Scaled Hunch's user interview capacity from 2-3 manual interviews/day to 50+ automated interviews daily while reducing per-interview cost by 90%.

### Technical Architecture

- **Voice AI**: ElevenLabs Conversational AI platform
- **LLM**: GPT-4o for reasoning and follow-up generation
- **Telephony**: Twilio for phone integration
- **Data**: Redshift SQL for analytics
- **Latency**: <500ms voice-to-voice (industry standard is 2-3s)

### Key Features

- Natural conversation with intelligent follow-up questions
- Real-time sentiment analysis
- Interrupt handling (user can cut off AI mid-sentence)
- Graceful fallbacks and automatic retry logic
- Automated insight summaries in 5 minutes (vs 3 days manual)

### Metrics & ROI

- **2,400% capacity increase** (2 → 50+ interviews/day)
- **90% cost reduction** per interview ($50 → $5)
- **$500K+ annual research capacity savings** at full utilization
- **99% faster insights** (3 days → 5 minutes)
- **82% completion rate** with 4.2/5 user satisfaction

### Links

- Private (internal tool at Hunch)

---

## 2. MBTI Personality Matching System

### Overview

Comprehensive personality matching algorithm integrating MBTI framework with user preferences. Provides transparent 0-100% compatibility scores with detailed explanations, becoming Hunch's core product differentiator.

### Technical Architecture

- **Matching Engine**: Custom algorithm with precomputed MBTI compatibility matrices
- **Cache**: Redis for sub-100ms response times
- **Database**: PostgreSQL for user preferences
- **Scale**: Serving 100K+ daily active users

### Key Features

- Transparent 0-100% compatibility scores
- Plain-English explanations for matches
- Integration with existing preference filters
- Horizontal scaling via Redis clustering

### Metrics

- **200% increase** in average session time (3 → 9 min)
- **86% improvement** in 7-day retention (22% → 41%)
- **152% increase** in messages per match (2.3 → 5.8)
- **133% increase** in match acceptance rate (15% → 35%)
- Became Hunch's core product differentiator

### Links

- Private (core feature of Hunch dating app)

---

## 3. AI Food Analyzer

### Overview

AI-powered mobile app that scans packaged food ingredients and provides personalized safety verdicts based on allergies, religious dietary rules (Jain/Vaishnav/Swaminarayan), and vegan preferences. Works globally without regional database dependency.

### Technical Architecture

- **Frontend**: React Native with Expo 54, NativeWind v4, Zustand
- **Backend**: Bun + Hono on Google Cloud Run
- **AI**: Google Gemini 3 Pro for multimodal ingredient analysis
- **Database**: Neon PostgreSQL
- **Storage**: Backblaze B2 for image storage

### Key Features

- Real-time ingredient scanning via camera (no barcode dependency)
- Multi-modal analysis (image + text extraction)
- Personalized dietary profiles
- Allergy detection and warnings
- Religious dietary compliance checking
- Scan history with cloud sync
- 100% free for the community

### Metrics

- Built in **15 days** as capstone project
- Supports **4+ dietary preferences**
- Zero regional database dependency
- Works globally (India, US, Europe, Asia)

### Links

- Pending release on Play Store and App Store

---

## 4. Breakup Recovery Squad

### Overview

Multi-agent AI system with 4 specialized personas that helps users navigate breakups through emotional support, chat screenshot analysis, closure exercises, and music therapy. Went viral with 100+ users in 48 hours from Reddit.

### Technical Architecture

- **Frontend**: Streamlit web framework
- **Orchestration**: Agno AI agent framework
- **AI Model**: Google Gemini 2.5 Flash (multi-modal)
- **Search**: DuckDuckGo for Riya agent web searches
- **Image Processing**: Pillow for screenshot analysis

### The 4 AI Agents

1. **Maya** - Emotional support and validation (The Therapist)
2. **Harper** - Practical advice and closure exercises (Closure Coach)
3. **Jonas** - Humor, distraction, and healing plans (The Planner)
4. **Riya** - Music recommendations and web search (Truth-Teller)

### Key Features

- Multi-agent orchestration with stateless privacy-first architecture
- Chat screenshot analysis for objective pattern detection
- Curated music therapy (115 songs across 4 eras)
- Privacy-first design (no accounts, no data storage)
- 24/7 free support

### Metrics

- **100+ users** in first **48 hours** (viral Reddit adoption)
- **4 specialized agents** working together
- **115 curated healing songs**
- Zero data storage (privacy-first)

### Links

- **Demo**: https://umang-breakup-recovery-agent.streamlit.app/
- **GitHub**: https://github.com/Umang00/breakup-recovery-agent

---

## 5. Marketing Analytics Dashboard

### Overview

Consolidated marketing analytics dashboard unifying data from 3 sources (Instagram, Twitter, TikTok) with AI-powered sentiment analysis and trend detection. Replaced 3 expensive SaaS tools while providing better insights.

### Technical Architecture

- **Dashboard**: Retool
- **Data Warehouse**: Redshift SQL
- **AI**: GPT-4o-mini for sentiment analysis
- **Scraping**: Apify for social media data collection

### Key Features

- Unified cross-platform analytics
- Real-time sentiment analysis on 1,000+ daily comments
- Viral content pattern identification
- Automated trend detection
- Custom report generation

### Metrics & ROI

- **$15K+ annual SaaS costs replaced** (previously $1K+/month for 3 tools)
- **15+ hours/week time savings** for marketing team
- **25% improvement** in content engagement rate
- Real-time insights (vs 2-day manual lag)

### Links

- Private (internal tool at Hunch)

---

## 6. Fine-Tuned In-App Chatbot

### Overview

Fine-tuned GPT-4o on 450+ carefully curated conversation examples to build a natural, human-like in-app chatbot. It adapts to user tone, discusses diverse topics, and provides personalized responses.

### Technical Architecture

- **Model**: GPT-4o fine-tuned on custom dataset
- **Dataset**: 450+ scored and cleaned conversation examples
- **Format**: OpenAI JSONL format
- **Scale**: Production deployment serving 100K+ users

### Key Features

- Natural, context-aware conversations
- Personalized conversation starters
- Tone adaptation to user style
- High-quality curated training data

### Metrics

- **180% increase** in response rate (15% → 42%)
- **144% increase** in messages per conversation (3.2 → 7.8)
- **100% increase** in session time (4 → 8 min)
- **487% increase** in opener usage (8% → 47%)

### Links

- Private (core feature of Hunch app)

---

## 7. Git Roast: Dev Roasting Platform

### Overview

AI-powered web app that brutally roasts any GitHub repository or profile, analyzing commit patterns, late-night coding habits, and code quality with savage, brutally honest feedback. Features MCP integration for Claude Desktop, Cursor, and ChatGPT.

### Technical Architecture

- **Frontend**: React 18 with Vite 6, TailwindCSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **GitHub**: @octokit/rest for API calls
- **Streaming**: Server-Sent Events (SSE) for real-time roast streaming
- **MCP**: Model Context Protocol server for AI tool integration

### Key Features

- Deep Git analysis (commit patterns, late-night coding, weekend work)
- Savage Developer Grades (A+ to F)
- Dubious Achievements ("Vampire Coder", "Bug Factory", "Keyboard Prisoner")
- PDF report exports
- MCP integration for Claude Desktop, ChatGPT, Cursor
- Real-time streaming responses

### Metrics

- Production MCP server with SSE streaming
- Sub-second initial response time
- 100% client-side processing for privacy

### Links

- **Demo**: https://git-roasts.vercel.app/
- **GitHub**: https://github.com/Umang00/git-roasts

---

## 8. Poll Promotion Engine

### Overview

Automated campaign management interface for targeted poll distribution at Hunch, reducing campaign launch time from 2 days to under 5 minutes while eliminating 85% of manual work. Replaced dependency on Amazon Personalize.

### Technical Architecture

- **Frontend**: React with TypeScript
- **Backend**: Node.js
- **Database**: Redshift SQL
- **Targeting**: Custom precision audience segmentation

### Key Features

- Visual campaign builder
- Precision audience targeting
- Preview before launch
- A/B test setup
- Real-time performance tracking
- Automated scheduling

### Metrics

- **99% reduction** in launch time (2 days → 5 minutes)
- **85% reduction** in manual effort
- **35% improvement** in campaign engagement
- **3x increase** in campaigns launched per month

### Links

- Private (internal tool at Hunch)

---

## 9. Web Onboarding Revenue Stream

### Overview

Web-based personality assessment (MBTI test) and app conversion funnel that created entirely new revenue stream for Hunch. Generated $1,500 in revenue from first month.

### Technical Architecture

- **Frontend**: Next.js with SSR for SEO
- **Styling**: Tailwind CSS, Framer Motion
- **Payments**: Stripe integration
- **Analytics**: Mixpanel
- **Storage**: AWS S3
- **Deep Links**: Web-to-app profile carryover

### Key Features

- SEO-optimized landing pages
- Web-based MBTI personality test
- Premium plan purchase flow
- Seamless profile carryover to app
- High-intent traffic capture

### Metrics

- **$1,500+ revenue** from month one
- **30% boost** to existing $5K monthly revenue
- Higher-quality users due to pre-app psychological investment
- New acquisition channel via SEO

### Links

- Private (Hunch web onboarding)

---

## 10. Newsletter Generator (CreatorPulse)

### Overview

AI-driven newsletter generation platform that automates content aggregation, trend detection, and draft creation. Reduces newsletter drafting time from 2-3 hours to under 5 minutes with voice-matched drafts.

### Technical Architecture

- **Frontend**: Next.js with TypeScript
- **Backend**: Supabase
- **AI**: GPT-OSS-20B via OpenRouter
- **Email**: Resend
- **Scheduling**: Vercel Cron Jobs

### Key Features

- Content aggregation from 5+ sources (YouTube, Reddit, Twitter, RSS, blogs)
- Clustering-based trend detection and ranking
- Voice-matched AI drafts (95%+ draft readiness)
- Rollback edits and source management
- Cron-scheduled automated delivery

### Metrics

- Reduced drafting time from **2-3 hours → <5 minutes**
- **≥95% ready drafts** with tone alignment
- **Saves 20+ hours/week** per publication
- Zero ongoing manual intervention

### Links

- **Demo**: https://newsletter-self-zeta.vercel.app/
- **YouTube**: https://youtu.be/e7ut-PZs7Hs

---

## 11. Lecture Lens - Cohort Assistant

### Overview

AI-powered chat interface that transforms cohort curriculum into a searchable knowledge base. Students ask natural language questions and receive instant answers with precise citations from lectures (with timestamps) and auto-scraped resources.

### Technical Architecture

- **Frontend**: Next.js 14 with App Router, React 18, Tailwind CSS
- **Vector DB**: Supabase PostgreSQL 15 + pgvector
- **AI**: OpenRouter (Gemini + OpenAI embeddings)
- **Search**: Hybrid ranking with BM25 + semantic search
- **Auth**: Multi-cohort with Row Level Security (RLS)

### Key Features

- Complete RAG pipeline with timestamped citations
- Semantic chunking of VTT lecture transcripts
- Auto-scraping from GitHub, YouTube, blogs
- Context-aware conversations with history
- 24/7 instant access to course material

### Metrics

- **Won 1st Runner-Up at hackathon**
- Built complete RAG pipeline in **24 hours**
- Significantly reduced information retrieval time
- Hybrid ranking combining semantic + title matching

### Links

- Private (internal cohort tool)

---

## 12. Fashion Street: AI Style Reports

### Overview

AI-powered fashion recommendation system running in a family retail store that generates personalized 4-page color analysis and style reports. Analyzes skin tone, facial features, and body structure to recommend flattering colors and outfit combinations.

### Technical Architecture

- **Backend**: Python with FastAPI
- **AI**: Google Gemini (multi-modal)
- **Bot**: Telegram Bot API
- **Output**: Premium 4-page PDF reports with store branding

### Key Features

- AI skin tone analysis (warm/cool/neutral)
- Facial feature detection (beard, glasses, face cut)
- Personalized color palettes
- Outfit combination suggestions
- Top-of-funnel lead generation for store

### Metrics

- Running in **production for 1+ month** (closed beta)
- **₹2-5 per qualified lead** with zero manual work
- Driving in-store traffic through free consultations

### Links

- Private (client project)

---

## Summary

| Project                | Key Metric                 | Tech Stack                    | Status                                                      |
| ---------------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------- |
| Voice UXR Agent        | $500K+ annual savings      | ElevenLabs, GPT-4o, Twilio    | Active                                                      |
| MBTI Matching          | 200% session time increase | Redis, PostgreSQL             | Active                                                      |
| AI Food Analyzer       | 15 days MVP                | React Native, Gemini, Neon    | Pending Release                                             |
| Breakup Recovery Squad | 100+ users in 48hrs        | Agno, Gemini, Streamlit       | [Live](https://umang-breakup-recovery-agent.streamlit.app/) |
| Marketing Analytics    | $15K+ SaaS replaced        | Retool, Redshift, GPT-4o      | Active                                                      |
| Fine-Tuned Chatbot     | 100% session increase      | GPT-4o fine-tuned             | Active                                                      |
| Git Roast              | MCP + SSE streaming        | React, Vite, Gemini           | [Live](https://git-roasts.vercel.app/)                      |
| Poll Promotion Engine  | 2 days → 5 minutes         | React, Node.js, Redshift      | Active                                                      |
| Web Onboarding         | $1,500/mo from day 1       | Next.js, Stripe, Mixpanel     | Active                                                      |
| Newsletter Generator   | 2-3 hrs → 5 min            | Next.js, Supabase, OpenRouter | [Live](https://newsletter-self-zeta.vercel.app/)            |
| Lecture Lens           | 1st Runner-Up Hackathon    | Next.js, pgvector, BM25       | Active                                                      |
| Fashion Street AI      | ₹2-5/qualified lead        | Python, FastAPI, Gemini       | Active                                                      |

All projects demonstrate expertise in:

- **Agentic AI**: Multi-agent orchestration (Agno, OpenAI Agents SDK, Google ADK)
- **Production Systems**: Deployed at scale, not prototypes
- **ROI Focus**: Measurable business impact ($500K+, $15K+, 200% increases)
- **Rapid MVP**: Ship fast (15 days, 24 hours hackathon, 48 hours viral)
- **Full-Stack**: End-to-end product building (frontend, backend, AI pipelines)
