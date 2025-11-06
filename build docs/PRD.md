# Product Requirements Document: AI Companion for Portfolio Website

## Overview
Add an intelligent AI companion to the portfolio website that can answer questions about Umang Thakkar's professional background, projects, skills, and journey using Retrieval-Augmented Generation (RAG).

## Objectives
1. **Primary Goal:** Enable visitors (recruiters, VCs, collaborators) to interactively learn about Umang through natural conversation
2. **Learning Goal:** Understand RAG architecture, embeddings, vector search, and LLM orchestration
3. **Technical Goal:** Build production-ready AI feature using modern stack

## Target Users
- **Recruiters:** Looking for specific skills, experience, and cultural fit
- **VCs/Investors:** Evaluating product thinking, execution capability, and domain expertise
- **Collaborators:** Understanding project history and technical capabilities
- **General Visitors:** Learning about Umang's journey and philosophy

## Core Features

### 1. Conversational Q&A
- Natural language queries about experience, projects, skills
- Context-aware responses based on retrieved documents
- Conversation history maintained across multiple turns
- Personalized responses reflecting Umang's voice and tone

### 2. Multi-Source Knowledge Base
**Data Sources:**
- LinkedIn profile (professional history, achievements)
- Resume (structured experience summary)
- Journey documents (decision-making processes, learnings, psychology)
- GitHub repositories (technical projects, code samples)

**Source Priority:**
- Recent information > older information
- Specific achievements > general descriptions
- First-person narrative > third-party descriptions

### 3. Smart Retrieval System
- **Query Analysis:** Automatic detection of query intent (work experience, journey stories, technical projects, skills)
- **Metadata Filtering:** Filter results by category, source, timeframe, recency
- **Re-ranking:** Multi-signal scoring combining vector similarity, category relevance, recency, and chunk quality
- **Relevance Scoring:** Display confidence scores for retrieved sources
- **Suggested Follow-ups:** Context-aware follow-up questions based on retrieved content

### 4. Chat Interface
- Modal overlay (doesn't disrupt main site navigation)
- Clean, modern UI matching portfolio theme
- Message history display
- Loading states and error handling
- Optional: Voice input support
- Optional: Suggested follow-up questions

### 5. Admin Features
- Manual index rebuild trigger (authenticated endpoint)
- Automatic daily rebuild (via cron job)
- File change detection (hash-based)
- Health check endpoint
- **API Testing Interface**: Swagger-like UI for testing all endpoints with authentication handled automatically
  - Located at `/api-test`
  - Tests all RAG pipeline phases without generating embeddings
  - Secure admin authentication with local storage
  - Interactive request/response interface

## Technical Requirements

### Performance
- Query response time: < 3 seconds (p95)
- Embedding generation: < 5 seconds for full rebuild
- Vector search: < 500ms
- Chat interface load: < 1 second
- Re-ranking overhead: < 100ms
- Smart search total: < 600ms (vs 500ms for basic search)

### Scalability
- Support 100+ concurrent users
- Handle 1000+ queries per day
- Store 500-1000 document chunks
- Maintain 50+ conversation histories

### Cost Constraints
- Embedding costs: < $5/month
- LLM costs: Use free tier (OpenRouter)
- Database: MongoDB Atlas free tier (M0)
- Hosting: Vercel free tier

### Security
- API keys stored in environment variables
- Admin endpoints protected with secret key
- Rate limiting on public endpoints
- No PII collection from users

## Non-Functional Requirements

### Reliability
- 99% uptime (excluding scheduled maintenance)
- Graceful degradation if LLM API unavailable
- Automatic retry logic for transient failures

### Maintainability
- Clear code documentation
- Modular architecture (easy to swap components)
- Comprehensive error logging
- Version-controlled knowledge base

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Mobile responsive design

## Success Metrics
- **Engagement:** Average 3+ queries per visitor who opens chat
- **Quality:** 80%+ queries receive relevant responses (manual review)
- **Performance:** 95% of responses in < 3 seconds
- **Adoption:** 20%+ of site visitors interact with AI companion
- **Relevance:** 90%+ queries retrieve correct source category (work vs journey vs technical)
- **Engagement:** 40%+ users click suggested follow-up questions
- **Source Quality:** Average relevance score > 75% for top-ranked chunks

## Out of Scope (Future Versions)
- Multi-language support
- Text-to-speech (AI voice responses)
- Personalized responses based on visitor profile
- Integration with calendar for scheduling meetings
- Analytics dashboard for query patterns
- Fine-tuning custom model on Umang's writing style

## Dependencies
- Next.js (existing site framework)
- MongoDB Atlas (vector database)
- OpenAI API (embeddings)
- OpenRouter API (LLM completions)
- Vercel (hosting + cron jobs)

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM generates incorrect info | High | Use retrieval context strictly, add disclaimer |
| Embedding costs exceed budget | Medium | Monitor usage, implement caching |
| Poor response quality | High | Extensive testing with sample queries |
| File updates not reflected | Medium | Hash-based change detection + manual trigger |
| Vercel free tier limits hit | Medium | Implement rate limiting, upgrade if needed |

## Timeline
- **Phase 0-1:** Backend setup (2 days)
- **Phase 2-3:** Document processing (2 days)
- **Phase 4:** LLM integration (1 day)
- **Phase 5:** Frontend (1 day)
- **Phase 6-7:** Deploy & test (1 day)
- **Total:** 7 days (focused work)

## Approval & Sign-off
- **Product Owner:** Umang Thakkar
- **Developer:** Umang Thakkar
- **Date:** November 2025