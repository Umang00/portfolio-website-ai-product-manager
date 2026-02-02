# Personal Branding Strategy: The "Unified Identity, Specialized Funnels" Approach

## Executive Summary

You are **one person** with **three distinct value propositions**.

- **LinkedIn** is your "Hub": It positions you as a **Product Engineer** (someone who can Build AND Decide).
- **Websites** are your "Spokes": Tailored funnels for Recruiters, Clients, and Founders.

---

## 1. Case Study Matrix: Which Project Goes Where?

Based on your feedback, we have curated the **strongest** projects for each persona.

### Bucket A: The AI Product Manager (Target: Zepto, Cred, Hunch)

_Goal: "I drive business outcomes (Revenue, Retention, Efficiency)."_
_Status: APPROVED_

| Case Study                | Why this Project?                                                                      | Key Resume Metric to Highlight                                                 |
| :------------------------ | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **MBTI Matching**         | **Core Product Pivot**. Shows you can change the direction of a company based on data. | "Increased user engagement by 200%... shifted Hunch's core product direction." |
| **Poll Promotion Engine** | **Operational Efficiency**. Shows you can automate internal chaos.                     | "Reduced launch time from 2 days to 5 mins... eliminated 85% of manual work."  |
| **Web Onboarding**        | **Monetization**. Shows you understand funnels and revenue.                            | "$1,500 monthly from first month... contributing 30% boost to revenue."        |
| **Fine-Tuned Chatbot**    | **User Experience**. Shows you know how to iterate on quality.                         | "Improved session time by 100%... achieved 487% increase in opener usage."     |

### Bucket B: AI Consultant / Solutions Architect (Target: Agencies, SMEs)

_Goal: "I save you money and build ROI-positive tools."_
_Updates: Removed Fashion Street (Too niche). Added Newsletter Gen (Pure Automation)._

| Case Study               | Why this Project?                                                           | Key Resume Metric to Highlight                                        |
| :----------------------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Voice UXR Agent**      | **Headcount Cost Reduction**. The ultimate consultant sell.                 | "Scaled research capacity 25x... reduced costs by 70% per interview." |
| **Newsletter Generator** | **Process Automation**. Businesses waste hours on content - you solve that. | "Reduced drafting time from 3 hours to <5 mins... 95% ready drafts."  |
| **Marketing Dashboard**  | **Tool Consolidation**. Tangible ROI for CFOs.                              | "Saved $1,000+ monthly in SaaS costs... replaced 3 separate tools."   |

### Bucket C: The GenAI Builder (Target: Founders, Hackathons)

_Goal: "I ship complex, Full-Stack AI apps."_
_Updates: Removed Foggy Rainwater (Too niche). Added Food Analyzer (Full App) & Lecture Lens (RAG)._

| Case Study             | Why this Project?                                                                                   | Key Resume Metric to Highlight                                                     |
| :--------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **AI Food Analyzer**   | **Full Mobile Product**. Shows you can build _real_, complex consumer apps, not just scripts.       | "Complete mobile app... Computer Vision for ingredient labels... Global database." |
| **Lecture Lens (RAG)** | **The "RAG" Showcase**. Every founder wants RAG. You prove you can do Vector DBs + Semantic Search. | "Complete RAG pipeline... Vector search... Row Level Security (RLS)."              |
| **Git Roast**          | **Viral & MCP**. Shows you are "on the pulse" of new tech (MCP, Streaming).                         | "Viral adoption... MCP integration... Real-time streaming AI."                     |

_Why we swapped:_

- **AI Food Analyzer** replaces **Foggy Rainwater**: A full consumer app is simply more impressive to a Technical Founder than a LoRA. It shows you can ship _software_, not just models.
- **Lecture Lens** replaces **Breakup Squad**: While agents are cool, **RAG** is the "bread and butter" of Enterprise AI right now. Showing you have mastered RAG (Lecture Lens) is safer and more hireable than showing a relationship bot.

---

---

## 2. Infrastructure: "One Repo, Three Personalities" (IMPLEMENTED)

**Strategy:** We use **Polymorphic Data**.

We created a `content-data.ts` that determines the "Language Variations" for every section.

- **Environment Variable:** `NEXT_PUBLIC_PERSONA` ("pm" | "builder" | "consultant")
- **The Logic:**
  `typescript
    // content-data.ts
    export const heroContent = {
       pm: "Product Manager who Builds",
       builder: "Full-Stack AI Engineer",
       consultant: "AI Solutions Architect"
    }
    `
  This allows us to deploy 3 unique websites from a **single codebase**.

---

## 3. Maintenance & Growth

1.  **Refactor `projects-data.ts`**: ✅ Done. Updated descriptions for all personas.
2.  **Create `content-data.ts`**: ✅ Done. Centralized all variable text.
3.  **Deploy**: Push to Vercel and verify the 3 personas (`?persona=builder` to test).
