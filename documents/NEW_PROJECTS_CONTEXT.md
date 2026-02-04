# New Projects RAG Context

This document contains detailed information about the 4 new portfolio projects for the AI Companion RAG system.

---

## 1. AI Food Analyzer

### Overview
AI-powered mobile app that scans packaged food ingredients and provides personalized safety verdicts based on allergies, religious dietary rules (Jain/Vaishnav/Swaminarayan), and vegan preferences. Works globally without regional database dependency.

### Technical Architecture
- **Frontend**: React Native with Expo, Gluestack UI, NativeWind (TailwindCSS)
- **Backend**: Python FastAPI with Google Cloud Run deployment
- **AI**: Google Gemini 3 Pro for ingredient analysis
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Backblaze B2 for image storage
- **Auth**: Custom JWT authentication with Google Sign-In

### Key Features
- Real-time ingredient scanning via camera
- Multi-modal analysis (image + text extraction)
- Personalized dietary profiles
- Allergy detection and warnings
- Religious dietary compliance checking
- Scan history with cloud sync

### Metrics
- Built in **15 days** as capstone project
- Supports **4+ dietary preferences**
- Zero regional database dependency

### GitHub
Private repository

---

## 2. Breakup Recovery Squad

### Overview
Multi-agent AI system with 4 specialized personas that helps users navigate breakups through emotional support, chat screenshot analysis, closure exercises, and music therapy. Went viral with 100+ users in 48 hours from Reddit.

### Technical Architecture
- **Frontend**: Streamlit web framework
- **Backend**: Python with Agno AI agent framework
- **AI Model**: Google Gemini 2.5 Flash (multi-modal)
- **Search**: DuckDuckGo for Riya agent web searches
- **Image Processing**: Pillow for screenshot analysis

### The 4 AI Agents
1. **Maya** - Emotional support and validation
2. **Harper** - Practical advice and action planning
3. **Jonas** - Humor and distraction therapy
4. **Riya** - Music recommendations and web search

### Key Features
- Multi-agent orchestration with Agno framework
- Chat screenshot analysis for context
- Curated music therapy (115 songs across 4 eras)
- Privacy-first design (no accounts, no data storage)
- 24/7 free support

### Metrics
- **100+ users** in first **48 hours**
- **4 specialized agents** working together
- **115 curated healing songs**
- Zero data storage (privacy-first)

### Links
- **Demo**: https://umang-breakup-recovery-agent.streamlit.app/
- **GitHub**: https://github.com/Umang00/breakup-recovery-agent

---

## 3. Git Roast: Dev Roasting Platform

### Overview
An AI-powered platform that humorously "roasts" developers based on their public GitHub profiles. Generates witty, personalized roasts by analyzing repositories, commit history, languages used, and coding patterns.

### Technical Architecture
- **Frontend**: React 18 with Vite 6, TailwindCSS 3, Framer Motion
- **Backend**: Node.js with Vercel Serverless Functions
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **GitHub Integration**: @octokit/rest for API calls
- **Streaming**: Server-Sent Events (SSE) for real-time roast streaming

### Key Features
- Real-time streaming roast generation
- Public GitHub profile analysis
- Repo, language, and commit pattern analysis
- Shareable roast cards
- Mobile-responsive design

### Metrics
- Sub-second initial response time
- Real-time SSE streaming
- 100% client-side processing for privacy

### Links
- **Demo**: https://git-roasts.vercel.app/
- **GitHub**: https://github.com/Umang00/git-roasts

---

## 4. Fashion Street: AI Style Reports

### Overview
AI-powered fashion analysis platform that provides personalized style reports based on user photos. Analyzes clothing items, color coordination, style coherence, and provides recommendations.

### Technical Architecture
- **AI Model**: Multi-modal vision models for fashion analysis
- **Analysis Types**: Color theory, style matching, occasion appropriateness
- **Output**: Detailed style reports with recommendations

### Key Features
- Photo-based style analysis
- Color coordination scoring
- Style category detection
- Personalized improvement suggestions
- Outfit occasion matching

### Metrics
- Multi-modal image analysis
- Detailed style breakdowns
- Actionable fashion recommendations

### GitHub
Private repository

---

## Summary

| Project | Tech Stack | Status | Demo |
|---------|-----------|--------|------|
| AI Food Analyzer | React Native, FastAPI, Gemini, Cloud Run | Active | Private |
| Breakup Recovery Squad | Streamlit, Agno, Gemini | Active | [Live](https://umang-breakup-recovery-agent.streamlit.app/) |
| Git Roast | React, Vite, Gemini, Vercel | Active | [Live](https://git-roasts.vercel.app/) |
| Fashion Street AI | Multi-modal AI | Active | Private |

All projects demonstrate expertise in:
- **Agentic AI**: Multi-agent orchestration (Agno, CrewAI patterns)
- **Model Selection**: Strategic use of Gemini 2.5 Flash for speed vs accuracy tradeoffs
- **Full-Stack Development**: End-to-end product building
- **Rapid MVP**: Shipping fast (15 days, 48 hours viral)
