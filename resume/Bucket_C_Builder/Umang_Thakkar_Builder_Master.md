# Umang Thakkar

**Full-Stack AI Engineer | 14+ Production Systems Shipped | <500ms Voice Latency**

umangthakkar005@gmail.com | +91 9426154668 | Delhi, India
LinkedIn: linkedin.com/in/umang-thakkar-90a4a5164 | GitHub: github.com/Umang00
Portfolio: umang-thakkar-full-stack-ai-engineer.vercel.app

---

## Professional Summary

Full-Stack AI Engineer with 14+ shipped production systems, from RAG pipelines to multi-agent swarms. Achieved <500ms voice-to-voice latency with ElevenLabs + GPT-4o. Built MCP servers for Claude Desktop/ChatGPT integration. Expert in LLM fine-tuning, vector databases, agent orchestration, and production deployments. Hackathon winner (1st Runner-Up, Lecture Lens). Currently shipping production AI applications end-to-end—frontend, backend, and LLM pipelines.

---

## Professional Experience

### 100x Engineers Cohort | AI Engineer

**Remote | July 2025 – Present**

- **Shipped 4 production AI systems in 6 months** as part of elite member in the cohort (Top 20), including mobile apps, MCP servers, and multi-agent systems.
- **Built production MCP server (Git Roast)** enabling AI tool integration across Claude Desktop, ChatGPT, and Cursor with SSE streaming.
- **Developed multi-agent system (Breakup Recovery Squad)** using Agno framework with 4 specialized agents, and stateless privacy-first architecture. Achieved viral adoption on Reddit.
- **Won 1st Runner-Up at hackathon** with Lecture Lens—production RAG pipeline with hybrid ranking (semantic + BM25) built in 24 hours.

### Hunch (Dating & Social App) | Associate Product Manager

**Delhi, India | October 2023 – June 2025**

- **Built AI voice agent using ElevenLabs Conversational AI + GPT-4o** achieving <500ms voice-to-voice latency with interrupt handling and graceful fallbacks.
- **Fine-tuned GPT-4o on 450+ curated conversation pairs** using OpenAI's JSONL format, deployed to production serving 100K+ daily active users.
- **Designed and built Retool analytics dashboard** integrating Redshift SQL, Python data pipelines, and GPT-4o-mini for sentiment analysis on 1,000+ daily comments.
- **Built MBTI matching engine** with precomputed compatibility matrices in Redis achieving sub-100ms response times for 100K+ DAU.
- **Built complete web onboarding funnel** with Next.js SSR for SEO, Stripe payments, Mixpanel analytics, and web-to-app profile carryover via deep links.
- **Wrote comprehensive PRDs** and coordinated cross-functional team (engineering + data science) to build Poll Promotion Engine replacing Amazon Personalize.

### Hunch (Anonymous Polling App) | Content Strategist

**Delhi, India | November 2022 – September 2023**

- **Built internal tooling for content operations** including Retool dashboards integrated with backend systems.
- **Designed data structures for poll categorization and targeting**, enabling automated content distribution.
- **Conducted 100+ user research interviews** establishing research frameworks later automated with AI.

### PlotX (Crypto Gaming Platform) | Content Writer

**Delhi, India | June 2022 – October 2022**

- **Built content frameworks** driving 50% organic traffic improvement and 3,000+ monthly signups.
- **Conducted 100+ user research interviews** establishing foundation for future UXR automation work.

### iNurture Education Solutions (EdTech) | Content Writer

**Bangalore, India | February 2022 – June 2022**

- **Created technical content for AI and Cybersecurity courses** impacting 5,000+ learners across Indian universities.
- **Improved course completion by 20%** through structured multi-format content delivery.

### Freelance | Content Writer

**November 2021 – May 2022**

- **Ghostwrote 300+ technical articles** for blockchain, crypto, and finance clients reaching 5M+ readers.

---

## Technical Projects

### AI Food Analyzer | Full-Stack Mobile App

**Stack: React Native + Expo 54, FastAPI, Gemini 3 Pro (Multimodal), Neon Postgres, NativeWind v4**

- Multimodal LLM analyzes ingredient photos directly—handles multiple languages, poor lighting, curved labels.
- AI processes images and text to identify dietary concerns against user profiles with sophisticated prompt engineering.
- 95%+ accuracy on test dataset, handles edge cases like hidden animal products in "natural flavors."

### Lecture Lens | Educational RAG System (Hackathon Winner)

**Stack: Next.js 14, Supabase pgvector, OpenRouter, BM25**

- Production RAG pipeline with hybrid ranking combining semantic search with BM25 keyword matching.
- Timestamp-aware chunking for video content with clickable citations—not just "lecture 5" but "23:45 in lecture 5."
- Multi-cohort architecture with Row Level Security, JWT authentication.

### Git Roast | MCP Server + Developer Tool

**Stack: TypeScript, Vercel Serverless, Google Gemini, GitHub API, SSE Streaming**

- Production MCP server working inside Claude Desktop, Cursor, and ChatGPT.
- SSE (Server-Sent Events) streaming responses for real-time "typewriter" effect.
- PDF generation for "Developer Report Cards" with commit stats and grades.

### Voice UXR Agent | Real-Time Voice AI

**Stack: Python, ElevenLabs Conversational AI, GPT-4o, Twilio, Redshift SQL**

- <500ms voice-to-voice latency (industry standard is 2-3s).
- Interrupt handling (user can cut off AI mid-sentence), graceful fallbacks for service timeouts.
- Real-time sentiment analysis with structured insight generation.

### Fine-Tuned Chat Model | LLM Fine-Tuning Pipeline

**Stack: Python, OpenAI Fine-tuning API, JSONL, A/B Testing Framework**

- Built data pipeline to curate 450+ conversation examples from app logs.
- Three fine-tuning iterations to optimize tone and response quality.
- Deployed as API endpoint with fallback to base GPT-4o, serving 100K+ DAU.

### Breakup Recovery Squad | Multi-Agent System

**Stack: Python, Agno Framework, Gemini 2.5 Flash, Streamlit**

- 4-agent system with distinct personas, system prompts, and capabilities.
- Vision model analyzes chat screenshots for relationship patterns.
- Fully stateless design—no login, no analytics, no database.

### MBTI Matching Engine | High-Performance Algorithm

**Stack: Redis, PostgreSQL, Python**

- Precomputed compatibility scores for all 256 MBTI pairings stored in Redis.
- Sub-100ms response times, horizontal scaling via Redis clustering.
- Graceful degradation and real-time adjustments based on user preferences.

### Marketing Analytics Dashboard | Data Pipeline + AI

**Stack: Python, Redshift SQL, Retool, Instagram/Twitter/TikTok APIs, GPT-4o-mini**

- API integration layer aggregating data from three platforms with different structures and rate limits.
- GPT-4o-mini for cost-optimized comment sentiment analysis on 1,000+ daily comments.
- Cron jobs for scheduled data pulls, efficient queries for real-time dashboard performance.

### Newsletter Generator (CreatorPulse) | Content Automation

**Stack: Next.js, Vercel Cron, YouTube/Twitter/Reddit APIs, OpenRouter, Resend**

- Content aggregation via official APIs with hourly scheduled pulls.
- Custom clustering algorithm grouping similar content across sources.
- Voice-matched generation using creator's past writing samples.

### Fashion Street AI Stylist | Multi-Modal Vision

**Stack: Python, Gemini 3 Pro, Telegram Bot API, PDF Generation**

- Multi-modal AI pipeline for personalized fashion recommendations.
- Detects skin undertone, facial features, body proportions.
- Generates premium 4-page branded PDF with color palettes and styling tips.

### Foggy Window Text LoRA | Custom Model Training

**Stack: Python, BLIP-2, LoRA Training Pipeline, CivitAI, Hugging Face**

- 250-image curated dataset (200 real + 50 synthetic).
- Tested 4 LoRA versions proving 30-60 images optimal over 150.
- Handles long text, multiline, emojis, doodles, math formulas.

---

## Technical Skills

**Languages:** Python, TypeScript, JavaScript, SQL

**AI:**

- LLM Fine-tuning (GPT-4o, Gemini)
- RAG Pipelines (LangChain, LlamaIndex, Custom)
- Vector DBs (Pinecone, Supabase pgvector, Chroma)
- Multi-Agent Systems (LangGraph, Agno, OpenAI Agents SDK, Google ADK)
- Voice AI (ElevenLabs Conversational AI, Deepgram, Twilio)
- MCP Servers
- Prompt Engineering
- LoRA Training

**Backend:** Python, FastAPI, Node.js, Bun, Hono, PostgreSQL, Redis, Supabase, Serverless Functions

**Frontend:** React, Next.js, React Native (Expo), TypeScript, Tailwind, NativeWind

**DevOps:** Docker, CI/CD, Vercel, AWS, GCP, GitHub Actions

**Tools:** Retool, Mixpanel, JIRA, Figma, Notion

---

## Education

**Bachelor of Technology – Computer Science & Engineering**
Parul Institute of Engineering and Technology | July 2017 – April 2021 | **GPA: 9.3/10.0**

---

## Awards & Recognition

- **1st Runner-Up** – Hackathon (Lecture Lens, Educational RAG System)
- **Viral Launch** – Git Roast achieved organic traction on Reddit
- **Viral Launch** – Breakup Recovery Squad: 100+ users in 48 hours from Reddit
