# Build Documentation

This directory contains documentation for the portfolio website with integrated AI Companion feature.

## 📁 Documentation Structure

### 🎯 Core Documentation (Essential)

- **PRD.md** - Product Requirements Document
  - **Part 1**: Portfolio Website Requirements (Hero, KPI, Projects, Testimonials, etc.)
  - **Part 2**: AI Companion Requirements (RAG system, query processing, vector search)
  - **Part 3**: Integration Requirements (how portfolio and AI Companion work together)
  - Core features, objectives, success metrics for entire website
  - Keep updated as features evolve

- **Architecture.md** - System Architecture Overview
  - **Part 1**: Portfolio Website Architecture (components, API routes, tech stack)
  - **Part 2**: AI Companion Architecture (RAG pipeline, vector database, document processing)
  - **Part 3**: System Integration (how portfolio and AI Companion integrate)
  - High-level system design and component structure
  - Technology stack and data flow
  - **Start here** for system overview

- **RAG_SYSTEM_DOCUMENTATION.md** - Detailed RAG Implementation Guide
  - Comprehensive technical deep-dive
  - Chunking strategies and rationale
  - Vector search implementation details
  - Re-ranking system and design decisions
  - **Read this** for implementation details

### 🔧 Operational Documentation (Setup & Troubleshooting)

- **MONGODB_VECTOR_INDEX_SETUP.md** - MongoDB Setup Guide
  - Vector index creation step-by-step
  - Troubleshooting common issues
  - Operational reference

### 📋 Status & Planning

- **TODO.md** - Implementation Status Summary
  - Current project status
  - Completed phases and remaining work
  - Quick reference for what's done


### 📦 Archived Documentation (Historical Reference)

See `ARCHIVE/` folder for historical docs:
- **MIGRATION_GUIDE.md** - Historical migration guide (MERN → Next.js)
- **PHASE3_TEST_RESULTS.md** - Phase 3 test results (completed)
- **PHASE3_SWAGGER_TESTING.md** - Phase 3 testing guide (completed)
- **CODEBASE_ANALYSIS.md** - Snapshot analysis (January 2025)
- **trusted_by_logos_troubleshooting.md** - Resolved troubleshooting (logo clipping issue)
- **ANIMATION_UX_ENHANCEMENT_PLAN.md** - Animation plan (implemented)
- **PROJECT_IMAGE_PROMPTS.md** - Image generation prompts (images already created)
- **FILES_TO_DELETE.md** - Record of deleted test files
- **DOCS_TO_DELETE.md** - Documentation cleanup proposal
- **OLD_DOCS_CLEANUP.md** - Old docs cleanup proposal
- **Inspiration.md** - Design inspiration catalogue (historical reference)

## 📝 Documentation Maintenance

### When to Update

- **PRD.md**: When adding new features or changing requirements
- **Architecture.md**: When system structure, components, or API changes
- **RAG_SYSTEM_DOCUMENTATION.md**: When RAG implementation, chunking, or search logic changes
- **MONGODB_VECTOR_INDEX_SETUP.md**: When MongoDB setup or index configuration changes
- **TODO.md**: When project status changes significantly

### When to Archive

- Implementation phases are completed and documented elsewhere
- Historical migration guides no longer needed
- Test results from completed phases
- Snapshot analyses that are outdated
- Detailed implementation logs that are no longer relevant

## 🎯 Quick Reference Guide

**New to the project?** 
1. Start with `PRD.md` to understand what we're building (portfolio + AI Companion)
2. Read `Architecture.md` for complete system overview (portfolio + AI Companion architecture)
3. Deep dive into `RAG_SYSTEM_DOCUMENTATION.md` for detailed RAG implementation

**Setting up the system?**
- MongoDB setup → `MONGODB_VECTOR_INDEX_SETUP.md`
- Environment variables → See `.env.local` example in Architecture.md

**Troubleshooting?**
- MongoDB issues → `MONGODB_VECTOR_INDEX_SETUP.md`
- Historical issues → Check `ARCHIVE/` folder
- General issues → Check relevant operational docs

**Understanding implementation?**
- High-level → `Architecture.md`
- Detailed RAG → `RAG_SYSTEM_DOCUMENTATION.md`
- Current status → `TODO.md`

## 🔍 Documentation Relationships

```
PRD.md (What & Why)
    ↓
Architecture.md (High-level How)
    ↓
RAG_SYSTEM_DOCUMENTATION.md (Detailed How)
    ↓
MONGODB_VECTOR_INDEX_SETUP.md (Operational How)
```

## 📊 Documentation Status

- ✅ **Core docs**: Up to date
- ✅ **Operational docs**: Current
- ⚠️ **Reference docs**: May need updates if features change
- 📦 **Archived docs**: Historical reference only

