// Polymorphic Content System
// Controls all persona-specific content across the portfolio

export type Persona = "pm" | "builder" | "consultant"

// Get current persona from environment variable, default to "pm"
export function getPersona(): Persona {
  const persona = process.env.NEXT_PUBLIC_PERSONA as Persona
  if (persona === "builder" || persona === "consultant") {
    return persona
  }
  return "pm" // default
}

// =============================================================================
// SECTION 1: HERO CONTENT
// =============================================================================

export const heroContent = {
  pm: {
    headline: "I'm Umang, building products that",
    typewriterWords: ["ship", "scale", "monetize", "drive retention", "users love"],
    tagline: "AI Product Manager blending product thinking, engineering rigor, and user psychology to ship high-impact products.",
  },
  builder: {
    headline: "I'm Umang, shipping AI that",
    typewriterWords: ["works in production", "scales globally", "runs in <500ms", "users trust"],
    tagline: "Full-Stack GenAI Engineer. 14+ products shipped. From RAG pipelines to multi-agent swarms, I build what others prototype.",
  },
  consultant: {
    headline: "I'm Umang, automating workflows that",
    typewriterWords: ["save 20+ hours/month", "cut costs by 70%", "replace manual work", "just work"],
    tagline: "AI Solutions Architect. I build automation systems that give you your weekends back. Code when needed, no-code when possible.",
  },
}

// =============================================================================
// SECTION 2: STICKY NOTES
// =============================================================================

export const stickyNotesContent = {
  pm: {
    left: [
      "Ship fast, learn faster. Perfection is the enemy of progress.",
      "90% of PMs fail to deliver because they skip user research.",
      "Data tells you what, users tell you why.",
    ],
    right: [
      "If users need a tutorial, you built it wrong.",
      "The best PMs are statisticians with empathy.",
      "Hallucinations aren't bugs. They're unhandled edge cases.",
    ],
  },
  builder: {
    left: [
      "If it's not in prod, it doesn't exist.",
      "Latency is the silent killer of user trust.",
      "RAG is easy. Good RAG is hard.",
    ],
    right: [
      "The best code is the code you don't write.",
      "Agents are just while loops with ambition.",
      "Trace everything. Assume nothing.",
    ],
  },
  consultant: {
    left: [
      "If it takes you 3 hours, it takes AI 30 seconds.",
      "The cheapest employee is the one you don't hire.",
      "Automate the boring. Focus on the billable.",
    ],
    right: [
      "Speed wins. The first solution to market captures 70% of value.",
      "Good enough today beats perfect next quarter.",
      "Build for the 99%. Edge cases can wait.",
    ],
  },
}

// =============================================================================
// SECTION 3: KPI SECTION
// =============================================================================

export const kpiContent = {
  pm: {
    header: "Impact At A Glance",
    subheader: "Key metrics from products I've shipped",
    quickStats: [
      { label: "Years Experience", value: "4+" },
      { label: "Users Reached", value: "5M+" },
      { label: "AI Products Shipped", value: "14+" },
      { label: "Clients Served", value: "20+" },
    ],
    impactKpis: [
      { value: "200%", label: "User Engagement Increased" },
      { value: "30%", label: "Monthly Revenue Boosted" },
      { value: "100%", label: "Session Time Improved" },
      { value: "70%", label: "Cost Reduction Achieved" },
      { value: "50%", label: "Organic Traffic Growth" },
      { value: "80%", label: "Manual Work Eliminated" },
    ],
  },
  builder: {
    header: "Engineering Benchmarks",
    subheader: "Performance metrics from production systems",
    quickStats: [
      { label: "AI Products Shipped", value: "14+" },
      { label: "Production Deployments", value: "20+" },
      { label: "MCP Servers Built", value: "3+" },
      { label: "Hackathon Wins", value: "2" },
    ],
    impactKpis: [
      { value: "<500ms", label: "Voice-to-Voice Latency" },
      { value: "92%+", label: "RAG Retrieval Precision" },
      { value: "99%+", label: "Uptime Achieved" },
      { value: "70%", label: "API Cost Reduction" },
      { value: "<2%", label: "Hallucination Rate" },
      { value: "24hrs", label: "MVP Shipping Time" },
    ],
  },
  consultant: {
    header: "ROI Dashboard",
    subheader: "Measurable results delivered to clients",
    quickStats: [
      { label: "Clients Served", value: "20+" },
      { label: "Hours Saved/Month", value: "500+" },
      { label: "SaaS Costs Cut", value: "$12K/yr" },
      { label: "Automations Running", value: "50+" },
    ],
    impactKpis: [
      { value: "70%", label: "Cost Reduction Achieved" },
      { value: "20+", label: "Hours Saved Weekly" },
      { value: "$1K+", label: "Monthly SaaS Savings" },
      { value: "4 weeks", label: "Time to Value" },
      { value: "85%", label: "Manual Work Eliminated" },
      { value: "3", label: "SaaS Tools Replaced" },
    ],
  },
}

// =============================================================================
// SECTION 4: PROCESS WHEEL
// =============================================================================

export const processContent = {
  pm: {
    title: "How I Work",
    subtitle: "From 'works in a notebook' to 'works at scale'",
    steps: [
      {
        title: "Discover",
        description: "Ground every decision in user truth through conversations, data, and jobs-to-be-done mapping.",
      },
      {
        title: "Define",
        description: "Translate ambiguity into clarity with crisp problem statements, success metrics, and guardrails.",
      },
      {
        title: "Prototype",
        description: "Test the riskiest assumptions early with MVPs before committing engineering resources.",
      },
      {
        title: "Ship",
        description: "Deliver value iteratively using vertical slices and feature flags to learn fast.",
      },
      {
        title: "Iterate",
        description: "Turn metrics and user feedback into insights that drive continuous improvement.",
      },
    ],
  },
  builder: {
    title: "Production-Grade Architecture",
    subtitle: "Engineering for reliability, not demos",
    steps: [
      {
        title: "Scope",
        description: "Understand the constraints: latency budgets, cost limits, and scaling requirements.",
      },
      {
        title: "Design",
        description: "Choose the right architecture: which models, where to cache, how to orchestrate.",
      },
      {
        title: "Build",
        description: "Fast prototypes to validate before committing to production code.",
      },
      {
        title: "Deploy",
        description: "Ship with observability. Trace every token, log every decision, monitor every edge case.",
      },
      {
        title: "Optimize",
        description: "Improve based on production data: reduce latency, cut costs, improve accuracy.",
      },
    ],
  },
  consultant: {
    title: "The 4-Week Automation Sprint",
    subtitle: "From chaos to calm in under a month",
    steps: [
      {
        title: "Audit",
        description: "Map your workflows to find the money leaks and tasks that eat time without creating value.",
      },
      {
        title: "Prioritize",
        description: "Fix the biggest pain first, then expand. ROI decides the order.",
      },
      {
        title: "Build",
        description: "Working demo in days, not weeks. You see results before committing.",
      },
      {
        title: "Deploy",
        description: "AI handles 80%, you approve the 20%. Human-in-the-loop for safety.",
      },
      {
        title: "Expand",
        description: "Monthly check-ins to grow scope, fix edge cases, and measure ROI.",
      },
    ],
  },
}

// =============================================================================
// SECTION 5: PROJECT PRIORITY ORDERING
// =============================================================================

export const projectPriority = {
  pm: [
    "mbti-matching-system",
    "poll-promotion-engine",
    "web-onboarding-revenue",
    "fine-tuned-chatbot",
    "voice-uxr-agent",
    "marketing-analytics-dashboard",
    "newsletter-generator",
    "ai-food-analyzer",
    "breakup-recovery-squad",
    "git-roast",
    "lecture-lens",
    "fashion-street-ai",
    "astro-ai",
    "foggy-rainwater-text-generator",
  ],
  builder: [
    "ai-food-analyzer",
    "lecture-lens",
    "git-roast",
    "breakup-recovery-squad",
    "voice-uxr-agent",
    "fine-tuned-chatbot",
    "newsletter-generator",
    "foggy-rainwater-text-generator",
    "mbti-matching-system",
    "poll-promotion-engine",
    "marketing-analytics-dashboard",
    "web-onboarding-revenue",
    "fashion-street-ai",
    "astro-ai",
  ],
  consultant: [
    "voice-uxr-agent",
    "newsletter-generator",
    "marketing-analytics-dashboard",
    "poll-promotion-engine",
    "fashion-street-ai",
    "fine-tuned-chatbot",
    "web-onboarding-revenue",
    "ai-food-analyzer",
    "mbti-matching-system",
    "breakup-recovery-squad",
    "git-roast",
    "lecture-lens",
    "astro-ai",
    "foggy-rainwater-text-generator",
  ],
}

// =============================================================================
// SECTION 6: PROJECT PERSONA DESCRIPTIONS
// =============================================================================

export type ProjectPersonaContent = {
  title: string
  brief: string
  detailed: string
}

export const projectPersonaDescriptions: Record<string, Record<Persona, ProjectPersonaContent>> = {
  "voice-uxr-agent": {
    pm: {
      title: "Voice-Based UXR Agent",
      brief: "AI-powered voice agent that conducts, transcribes, and analyzes user research interviews at scale. Automated Hunch's interview process from 2-3 manual interviews/day to 50+ automated interviews daily while reducing costs by 70%.",
      detailed: `Built an AI voice agent system that conducts interviews over phone calls, asks intelligent follow-up questions based on user responses, performs real-time sentiment analysis, and generates actionable summaries within 5 minutes.

The product challenge was balancing automation with conversation quality. We ran A/B tests comparing AI vs human interviewers and validated that users rated the AI experience 4.2/5—comparable to human interviewers.

Results: 2,400% capacity increase (2 → 50+ interviews/day), 70% cost reduction per interview ($50 → $15), and insights delivered in 5 minutes instead of 3 days.`,
    },
    builder: {
      title: "Voice-Based UXR Agent",
      brief: "Real-time voice AI agent built on ElevenLabs Conversational AI platform with GPT-4o for reasoning and Twilio for phone integration. Achieved <800ms voice-to-voice latency with interrupt handling and graceful fallbacks.",
      detailed: `Built an AI phone agent using ElevenLabs Conversational AI platform for real-time voice interactions. The platform handles speech-to-text and text-to-speech, while GPT-4o powers the conversational logic and follow-up question generation.

Key technical wins: <800ms voice-to-voice latency (industry standard is 2-3s), interrupt handling (user can cut off the AI mid-sentence), graceful fallbacks when any service times out, and automatic retry logic for network hiccups.

Stack: Python, Twilio, ElevenLabs Conversational AI, GPT-4o, Redshift SQL.`,
    },
    consultant: {
      title: "Voice-Based UXR Agent",
      brief: "AI phone agent that conducts customer interviews, transcribes conversations, and generates actionable summaries automatically. Saved 20+ hours/week of manual interview work while scaling capacity from 2 to 50+ daily.",
      detailed: `Built an AI phone agent that calls customers at scheduled times, asks structured questions, handles follow-up questions naturally based on responses, and generates insight summaries in 5 minutes instead of 3 days.

The system runs 24/7 without human intervention. Users receive a call, have a natural conversation, and the client gets analyzed insights automatically.

ROI: 70% cost reduction per interview. Capacity scaled from 2 to 50+ daily. The PM team now focuses on strategy instead of scheduling and conducting calls.`,
    },
  },

  "mbti-matching-system": {
    pm: {
      title: "MBTI Personality Matching System",
      brief: "Personality matching algorithm integrating MBTI framework with user preferences. Provides transparent 0-100% compatibility scores with plain-English explanations, becoming Hunch's core product differentiator.",
      detailed: `Designed a personality matching algorithm that integrates MBTI psychological framework with existing user preference filters. The core innovation was making personality science accessible—users don't care about 'cognitive functions' but they want to know WHY they're matched.

Product decisions: Chose MBTI over Big Five for user familiarity. Prioritized explainability ('Why am I matched with this person?') over pure algorithmic accuracy. Ran experiments to balance algorithm complexity with response time.

Results: 200% session time increase (3 → 9 min), 86% improvement in 7-day retention (22% → 41%), 152% increase in messages per match.`,
    },
    builder: {
      title: "MBTI Personality Matching System",
      brief: "Compatibility scoring engine with precomputed MBTI matrices in Redis and real-time preference adjustments from PostgreSQL. Optimized for sub-100ms response times serving 100K+ daily active users.",
      detailed: `Built a scoring algorithm combining MBTI compatibility matrices with user preference filters. Precomputed compatibility scores for all 256 MBTI pairings stored in Redis for instant lookup.

Architecture: Real-time adjustments based on user preferences (age, location, interests) retrieved from PostgreSQL. Weighted scoring function balancing personality fit with filter match. Horizontal scaling via Redis clustering.

Performance: Sub-100ms response times, handles 100K+ daily active users, graceful degradation when Redis is slow.`,
    },
    consultant: {
      title: "MBTI Personality Matching System",
      brief: "Automated personality-based matching engine that replaced manual 'vibe checks' with AI-powered scoring. Reduced matchmaking time by 80% while improving match quality and user satisfaction.",
      detailed: `Built a personality-based matching engine that scores compatibility automatically. Users take a short quiz, get their personality type, and see matches ranked by compatibility percentage with explanations.

The system eliminated manual profile review entirely. Matches are consistent, explainable, and scale infinitely.

Business impact: 80% reduction in manual matchmaking work, 200% increase in session time, 86% improvement in 7-day retention. The team could focus on growth instead of operations.`,
    },
  },

  "ai-food-analyzer": {
    pm: {
      title: "AI Food Analyzer",
      brief: "Mobile app that scans ingredient labels and provides personalized safety verdicts for allergies, religious dietary rules (Jain/Vaishnav/Swaminarayan), and vegan preferences. Works globally without barcode dependency. Built in 15 days.",
      detailed: `Led the product from concept to launch in 15 days. Identified three core user personas: allergy sufferers, religious practitioners, and vegans. Made a key architectural decision: image-based analysis instead of barcodes for global compatibility.

The app lets users photograph any ingredient list and get a clear verdict ('Safe' / 'Contains concerns' / 'Not recommended') with detailed explanations of flagged ingredients.

Key decision: Accuracy over speed. We use a tiered AI system that prioritizes correctness. Launched as 100% free as a community contribution.`,
    },
    builder: {
      title: "AI Food Analyzer",
      brief: "React Native mobile app with Gemini 3 Pro vision pipeline for ingredient label parsing. Achieves 95%+ accuracy on multi-language labels without barcode dependency. Backend on Neon serverless Postgres.",
      detailed: `Built an end-to-end vision pipeline that extracts text from ingredient photos (handles multiple languages, poor lighting, curved labels). The AI then analyzes each ingredient against user dietary profiles using sophisticated prompt engineering.

Stack: React Native + Expo 54 for cross-platform mobile, FastAPI backend on Neon (serverless Postgres), Gemini 2.5 Flash for vision and reasoning, NativeWind v4 for styling.

Accuracy: 95%+ on test dataset. Handles edge cases like 'natural flavors' that might contain hidden animal products. Works in India, US, Japan, Europe with no regional database.`,
    },
    consultant: {
      title: "AI Food Analyzer",
      brief: "Automated ingredient analysis system for dietary compliance checking. Reduces manual compliance review from hours to seconds with AI-powered verification for allergies, religious rules, and dietary preferences.",
      detailed: `Built an AI system that automates ingredient compliance checking. Upload a photo of ingredients, select dietary profiles (allergies, religious rules, vegan), and get an instant verdict with detailed explanations.

Use cases: Restaurant menu compliance, food brand quality assurance, catering companies serving diverse clients, personal dietary safety checks.

ROI: What takes hours of manual label reading takes seconds with AI. Zero human error risk. Scales to any number of products without additional labor cost.`,
    },
  },

  "breakup-recovery-squad": {
    pm: {
      title: "Breakup Recovery Squad",
      brief: "Multi-agent AI system with 4 specialized personas providing emotional support, chat analysis, closure exercises, and recovery planning. Went viral with 100+ users in 48 hours from Reddit launch. Free forever with zero data storage.",
      detailed: `Identified four distinct user needs during breakups: wanting to feel understood (empathy), needing honest feedback (clarity), seeking closure rituals (processing), and making a plan forward (direction).

Built 4 specialized AI agents: Maya (The Therapist) reflects emotions back. Riya (The Truth-Teller) analyzes uploaded chat screenshots with brutal honesty. Harper (Closure Coach) creates unsent letters and release rituals. Jonas (The Planner) builds personalized 7-day healing plans with curated music therapy.

Product decisions: Zero data storage for privacy, no accounts required, free forever. Launched on Reddit—100+ users in 48 hours from organic sharing.`,
    },
    builder: {
      title: "Breakup Recovery Squad",
      brief: "4-agent AI system built with Agno orchestration framework and Gemini 2.5 Flash. Features chat screenshot analysis, personalized healing plans, and 115-song curated music therapy database. Privacy-first with stateless design.",
      detailed: `Built a multi-agent system with four specialized personas, each with distinct behavior, system prompts, and capabilities, orchestrated using the Agno framework.

Agent design: Maya (empathetic, reflective responses using therapeutic techniques). Riya (vision model analyzes chat screenshots for relationship patterns). Harper (generates unsent letters using closure psychology). Jonas (creates 7-day plans with recommendations from 115-song curated database).

Privacy: No login, no analytics, no database. Screenshots auto-delete after processing. Fully stateless design. Stack: Python, Agno, Gemini 2.5 Flash, Streamlit.`,
    },
    consultant: {
      title: "Breakup Recovery Squad",
      brief: "AI-powered 24/7 emotional support system that scales infinitely without human intervention. Multiple specialized personas address different user needs. Zero operational cost after deployment.",
      detailed: `Built an AI system providing 24/7 emotional support without human intervention. Users can switch between different AI personas depending on their current emotional needs—empathy, honest feedback, closure exercises, or action planning.

The system handles unlimited concurrent users with zero marginal cost per session. No human scheduling, no therapist burnout, no limited availability.

Business model potential: Employee wellness benefit for HR departments, mental health coverage for insurance companies, or direct-to-consumer subscription. Impact: 100+ users in first 48 hours, free service providing value equivalent to multiple therapy sessions.`,
    },
  },

  "marketing-analytics-dashboard": {
    pm: {
      title: "Marketing Analytics Dashboard",
      brief: "Unified analytics dashboard consolidating data from Instagram, Twitter, and TikTok with AI-powered sentiment analysis. Replaced 3 expensive SaaS tools while saving $1,000+ monthly and 15+ hours of manual work weekly.",
      detailed: `Built a centralized Retool dashboard that pulls data from all three platforms via APIs, runs AI-powered sentiment analysis on comments, and identifies viral content patterns automatically.

Key features: Real-time metrics across platforms, automated comment analysis, and trend detection. The team no longer waits 2 days for compiled reports—insights are available in real-time.

Results: $1,000+ monthly savings (replaced Sprout Social, Buffer, and manual processes), 15+ hours weekly time savings, 25% improvement in content engagement rate.`,
    },
    builder: {
      title: "Marketing Analytics Dashboard",
      brief: "API integration layer aggregating data from Instagram, Twitter, and TikTok official APIs. Built with Python, Postgres, and Retool with GPT-4o-mini for sentiment analysis on 1,000+ daily comments.",
      detailed: `Built a data integration layer aggregating social media metrics from three platforms, each with different API structures and rate limits.

Architecture: Python scripts handling pagination and rate limits, transformation logic normalizing data into common schema, loading into Postgres (Redshift). Retool frontend with refresh controls. GPT-4o-mini for cost-optimized comment sentiment analysis. Cron jobs for scheduled data pulls.

Technical considerations: Graceful API failure handling, historical data backfill logic, efficient queries for real-time dashboard performance.`,
    },
    consultant: {
      title: "Marketing Analytics Dashboard",
      brief: "Replaced $1,000/month worth of SaaS subscriptions (Sprout Social, Buffer, etc.) with a custom internal dashboard. Annual savings: $12,000+ plus 15+ hours/week of manual work eliminated.",
      detailed: `Built an internal dashboard replacing three paid SaaS tools. The upfront build cost was less than 3 months of SaaS subscriptions. Ongoing cost: ~$50/month for Retool.

The system provides unified insights that no single SaaS tool offered. The client owns the system with no vendor lock-in and can extend functionality as needed.

ROI: Annual savings of $12,000+, plus 15+ hours weekly in manual data compilation eliminated. Real-time insights instead of 2-day report lag.`,
    },
  },

  "fine-tuned-chatbot": {
    pm: {
      title: "Fine-Tuned In-App Chatbot",
      brief: "GPT-4o fine-tuned on 450+ curated conversation examples to generate personalized, natural conversation starters. Increased opener usage by 487% and session time by 100%, becoming a key engagement driver.",
      detailed: `Led the end-to-end development from dataset creation to production deployment. Curated 450+ conversation examples, scoring each on naturalness, personalization, and engagement outcome. Only high-quality examples made it to the training set.

Key product decisions: Focused on profile-aware openers rather than generic greetings. The model learned to reference profile details naturally ('I saw you're into hiking. Have you done any trails near Mumbai?').

Results: 180% increase in response rate (15% → 42%), 144% increase in messages per conversation, 100% session time improvement, 487% opener usage increase.`,
    },
    builder: {
      title: "Fine-Tuned In-App Chatbot",
      brief: "Built GPT-4o fine-tuning pipeline with structured data quality framework. Curated 450+ conversation pairs, formatted in JSONL, with evaluation against held-out test set. Deployed to 100K+ users.",
      detailed: `Built a data pipeline to curate 450+ conversation examples from app logs. Each conversation scored on naturalness (1-5), personalization (1-5), and engagement outcome (did the other person respond?).

Fine-tuning process: Formatted data in OpenAI's JSONL format, ran fine-tuning job, evaluated against held-out test set. Three iterations to get the tone right.

Integration: Deployed as API endpoint, integrated into app's chat flow with fallback to base GPT-4o. Serving 100K+ daily active users in production.`,
    },
    consultant: {
      title: "Fine-Tuned In-App Chatbot",
      brief: "AI-powered conversation starters generating personalized openers instead of generic greetings. Increased session time by 100% and response rates by 180%, solving the 'dead app' engagement problem.",
      detailed: `Fine-tuned an AI to generate personalized conversation starters based on user profiles. Instead of generic 'Hey, how are you?', users get context-aware openers that reference shared interests.

The feature dramatically improved engagement metrics—users spend twice as long in the app, and conversations are substantially longer and more meaningful.

Business impact: 100% session time increase means higher retention. The feature sold itself once users tried it. Reduced 'the app feels dead' support tickets significantly.`,
    },
  },

  "git-roast": {
    pm: {
      title: "Git Roast: Dev Roasting Platform",
      brief: "AI-powered tool that analyzes GitHub profiles and roasts coding habits with brutal honesty. Features MCP integration for Claude Desktop, ChatGPT, and Cursor. Achieved organic viral traction on Reddit.",
      detailed: `Built a tool that fills a gap in developer tooling: honest feedback about coding habits. Git Roast analyzes commit patterns, late-night coding, poor commit messages, and weekend work patterns—things linters don't catch but affect developer wellbeing.

Strategic timing: MCP (Model Context Protocol) is the 2026 wave for AI tool integration. Built Git Roast as an MCP server working directly inside Claude Desktop, Cursor, and ChatGPT, making it viral within developer circles.

Launch: Reddit post got organic traction. Users share roasts on Twitter. Features PDF exports for 'Developer Report Cards'.`,
    },
    builder: {
      title: "Git Roast: Dev Roasting Platform",
      brief: "Full-stack TypeScript app with MCP server integration for Claude Desktop, ChatGPT, and Cursor. SSE streaming responses via Vercel serverless. PDF export for Developer Report Cards.",
      detailed: `Built a production MCP server enabling AI tool integration across Claude Desktop, ChatGPT, and Cursor.

Architecture: Vercel serverless functions handle GitHub API calls. SSE (Server-Sent Events) stream responses for real-time 'typewriter' effect. Google Gemini generates roasts based on structured GitHub data.

MCP implementation: Exposes /roast-profile and /roast-repo tools. Handles authentication, rate limiting, graceful degradation. PDF generation creates 'Developer Report Cards' with commit stats and savage grades.`,
    },
    consultant: {
      title: "Git Roast: Dev Roasting Platform",
      brief: "Developer engagement tool for team morale, hackathons, and retrospectives. Zero maintenance cost, self-service deployment on Vercel. Identifies overworking patterns in team members.",
      detailed: `A fun project with real applications for team engagement and developer wellness.

Use cases: Hackathon icebreakers (roast everyone's GitHub before the event), team retrospectives (identify who's overworking and might burn out), onboarding (fun introduction to the team's codebase).

Deployment: Free to use, hosted on Vercel with zero maintenance cost. Teams can self-serve. Value proposition: Developer happiness matters—fun tools reduce burnout and improve team culture.`,
    },
  },

  "poll-promotion-engine": {
    pm: {
      title: "Poll Promotion Engine",
      brief: "Automated campaign management interface for targeted poll distribution at Hunch, reducing campaign launch time from 2 days to under 5 minutes while eliminating 85% of manual work. Replaced dependency on Amazon Personalize.",
      detailed: `Designed a campaign management interface with no SQL knowledge needed, preview before launch, one-click A/B test setup, and real-time performance tracking during campaigns.

The key insight was replacing Amazon Personalize (an opaque black box) with custom targeting logic we owned. This gave us precision audience segmentation and explainable targeting decisions.

Results: 99% reduction in launch time, 85% less manual work, 35% better campaign engagement, 3x more campaigns launched per month.`,
    },
    builder: {
      title: "Poll Promotion Engine",
      brief: "Custom targeting engine replacing Amazon Personalize with transparent, tunable logic. Built with React, TypeScript, Node.js, and Redshift SQL for analytics.",
      detailed: `Built a replacement for Amazon Personalize: custom targeting logic that segments users based on app behavior, demographics, and content preferences. The algorithm is transparent and tunable.

Frontend: React + TypeScript campaign management interface. Drag-and-drop targeting criteria, estimated reach preview, real-time performance dashboard.

Backend: Node.js service for campaign logic, Redshift SQL for analytics. Handles A/B test assignment and performance tracking.`,
    },
    consultant: {
      title: "Poll Promotion Engine",
      brief: "Self-service campaign management system eliminating spreadsheet chaos. Marketing launches campaigns in 5 minutes without SQL or engineering help. 3x increase in campaigns per month with zero dependencies.",
      detailed: `Built a self-service campaign management system for the marketing team. No more spreadsheet manipulation, SQL queries, or waiting for engineering help.

The team went from launching a few campaigns per month (limited by manual capacity) to 3x that number. Engineers freed up for product work instead of marketing requests.

Maintenance: Low—easy to modify as needs change. ROI realized within the first month through time savings alone.`,
    },
  },

  "web-onboarding-revenue": {
    pm: {
      title: "Web MBTI Onboarding Funnel",
      brief: "Web-based personality test funnel capturing high-intent traffic and converting to paid app users. Generated $1,500 in month one, adding 30% to monthly revenue while building an SEO-optimized acquisition channel.",
      detailed: `Designed and built a web funnel to capture users who discover Hunch through search or social but don't want to download an app immediately.

The funnel: User finds us via search → Takes free MBTI test → Sees their type and compatible types → Offered premium features → Installs app with profile pre-loaded. Key insight: Users who invest psychologically (completing the test) before downloading convert at higher rates.

Results: $1,500 revenue in month one, 30% boost to total monthly revenue, new SEO-optimized acquisition channel with lower CAC than paid ads.`,
    },
    builder: {
      title: "Web MBTI Onboarding Funnel",
      brief: "Full-stack Next.js conversion funnel with Stripe payments, Mixpanel analytics, and seamless web-to-app profile carryover via deep links. Optimized for Core Web Vitals.",
      detailed: `Built a complete web funnel from scratch: landing pages with SSR for SEO, interactive personality test, payment flow, and app deep-linking.

Stack: Next.js (SSR for SEO), Stripe for payments, Mixpanel for conversion tracking, AWS S3 for assets, Framer Motion for smooth animations.

Technical challenge: Carrying user's profile from web to app. Solved with deep links passing a token the app exchanges for profile data. Performance: Optimized for Core Web Vitals—high test completion rate due to fast loads and smooth animations.`,
    },
    consultant: {
      title: "Web MBTI Onboarding Funnel",
      brief: "SEO-optimized revenue diversification system capturing users before app download. Psychological investment in free test increases conversion. $1,500 first month, compounds with SEO growth.",
      detailed: `Built a web-based revenue stream to reduce single-channel dependency. Users discover the product through SEO, engage with a free personality test, and convert to paid subscriptions before downloading the app.

Business value: Revenue diversification (not dependent on app store only), higher-quality users (psychological investment before download), SEO as growth channel (lower CAC than paid ads).

First month: $1,500 revenue. Ongoing: Compounds with SEO growth and provides a fallback if app store dynamics change.`,
    },
  },

  "fashion-street-ai": {
    pm: {
      title: "Fashion Street AI Stylist",
      brief: "AI-powered personal stylist analyzing skin undertones, facial features, and body structure to recommend flattering colors and outfits. Drives retail foot traffic via Telegram with free personalized style reports.",
      detailed: `Built an AI stylist for my family's retail store as lead generation. Users submit a photo via Telegram, and the AI analyzes skin undertones, facial features (beard, glasses, face shape), and body structure to recommend colors and outfit combinations.

Business model: Free style reports featuring store products as top-of-funnel strategy. Creates in-store visits with pre-qualified intent—users already know what styles work for them.

Status: Running in closed beta for 1+ month. Roadmap includes real-time store inventory integration for personalized product recommendations.`,
    },
    builder: {
      title: "Fashion Street AI Stylist",
      brief: "Multi-modal vision pipeline using Gemini 3 Pro for skin tone analysis, facial feature detection, and body proportion analysis. Generates branded PDF reports delivered via Telegram bot.",
      detailed: `Built a multi-modal AI pipeline for personalized fashion recommendations.

Vision analysis: Gemini 3 Pro processes photos to detect skin undertone (warm/cool/neutral), facial features (beard style, glasses, face shape), and body proportions.

Report generation: Python generates premium 4-page branded PDF with color palettes, outfit combinations, and styling tips. Telegram bot for frictionless customer access.

Roadmap: Connect to store inventory system for hyper-personalized product recommendations based on current stock.`,
    },
    consultant: {
      title: "Fashion Street AI Stylist",
      brief: "AI-powered style consultations as lead generation for retail. Zero manual work per consultation, delivered via Telegram with no app download friction. Pennies per report, high ROI from store visits.",
      detailed: `Built an AI stylist providing free personalized style reports as lead generation. Users get value (know which colors suit them), and the store gets qualified leads interested in buying clothes matching their style.

Delivery: Via Telegram, which customers already use. No friction, no app downloads, no signups.

ROI: Each report costs pennies to generate. If even 10% of users visit the store, the system pays for itself many times over. Zero manual work per consultation.`,
    },
  },

  "newsletter-generator": {
    pm: {
      title: "CreatorPulse Newsletter Generator",
      brief: "AI-powered newsletter automation aggregating content from YouTube, Reddit, Twitter, and RSS, then generating voice-matched drafts. Reduces drafting time from 2-3 hours to under 5 minutes with 95%+ ready content.",
      detailed: `Built CreatorPulse to automate the boring parts of newsletter creation: aggregate content from multiple sources, identify trending topics using clustering algorithms, and generate drafts in the creator's voice.

The key innovation was 'voice matching'—generic AI content doesn't work for newsletters. The system fine-tunes on previous writing samples to match each creator's distinctive style.

Results: 95%+ draft readiness. Creators go from morning research to published newsletter in under 5 minutes instead of 2-3 hours.`,
    },
    builder: {
      title: "CreatorPulse Newsletter Generator",
      brief: "Content aggregation layer using official APIs (YouTube Data API, Twitter API, Reddit PRAW) with hourly Vercel Cron jobs. Custom clustering for trend detection. GPT-OSS-20B (OpenRouter) for voice-matched draft generation.",
      detailed: `Built a production-grade newsletter automation system.

Data pipeline: Aggregates content via official APIs—YouTube Data API, Twitter API, Reddit (via PRAW wrapper), and RSS feeds. Runs hourly via Vercel Cron.

Trend detection: Custom clustering algorithm groups similar content across sources. Ranking based on recency, engagement metrics, and topic relevance to creator's niche.

Generation: GPT-OSS-20B via OpenRouter generates drafts with creator's past writing samples for voice matching. Frontend: Next.js app with draft editing, source toggling, and scheduled delivery via Resend.`,
    },
    consultant: {
      title: "CreatorPulse Newsletter Generator",
      brief: "Newsletter automation system achieving 95% draft readiness with voice-matched outputs. Cron-scheduled aggregation and delivery. Scales to power 10+ publications with different topics and voices.",
      detailed: `Built a system automating the entire newsletter pipeline: aggregate content, identify trends, draft newsletter, schedule delivery.

Value proposition: What took 2-3 hours now takes 5 minutes. Creators focus on editing and adding personal insights instead of research.

Use case: Perfect for agencies managing multiple newsletters. One system can power 10+ publications with different topics and voices. Each publication maintains its distinctive style through voice matching.`,
    },
  },

  "lecture-lens": {
    pm: {
      title: "Lecture Lens: Educational RAG",
      brief: "AI-powered knowledge search for educational cohorts with timestamped video citations. Won 1st Runner-Up at hackathon. Reduces information retrieval from hours to seconds across 100+ hours of content.",
      detailed: `Built Lecture Lens in 24 hours for a hackathon. Ask a question in natural language, get an answer with precise citations—not just 'this is in lecture 5' but 'this is at 23:45 in lecture 5' with clickable timestamps.

Key differentiator: Most RAG systems cite documents. We cite video timestamps. Most systems search one source. We search lectures, GitHub repos, YouTube videos, and blog posts in one unified query.

Result: 1st Runner-Up out of many teams. Solved a real pain point for cohort-based learning.`,
    },
    builder: {
      title: "Lecture Lens: Educational RAG",
      brief: "Production RAG pipeline with hybrid ranking (semantic + BM25), Supabase pgvector, and LlamaIndex. Multi-tenant architecture with Row Level Security. Timestamp-aware chunking for video content.",
      detailed: `Built an end-to-end RAG system in 24 hours.

Ingestion: VTT lecture transcripts with semantic chunking preserving context around timestamps. Auto-scraping of external resources (GitHub, YouTube, blogs) mentioned in lectures.

Retrieval: Hybrid ranking combining semantic search (pgvector) with BM25 keyword matching. Title boosting for exact topic matches. Returns video timestamps for clickable citations.

Security: Multi-cohort architecture with Row Level Security. Users only see content from enrolled cohorts. JWT authentication. Stack: Next.js 14, Supabase, LlamaIndex, OpenRouter.`,
    },
    consultant: {
      title: "Lecture Lens: Educational RAG",
      brief: "Knowledge base automation transforming 100+ hours of video into instant-answer system. Zero training required for end users. Click to jump to exact video moment or document paragraph.",
      detailed: `A system transforming existing video/document content into a searchable knowledge base. No reuploading or reformatting required—just point at content and it indexes everything.

User experience: Type a question, get an answer with sources. Click to jump to the exact moment in video or paragraph in document.

ROI calculation: Every hour saved searching is an hour doing productive work. For a 50-person team, even 1 hour saved per week is 2,600 hours annually recovered.`,
    },
  },

  "astro-ai": {
    pm: {
      title: "Astro AI: Vedic Astrology Bot",
      brief: "WhatsApp-based AI astrologer providing Vedic birth chart analysis and personalized insights. 95% cheaper than traditional astrologers ($2.99/month vs $50-200/session). Available 24/7 with 5-10 second responses.",
      detailed: `Building Astro AI to democratize astrology via WhatsApp. Users get accurate Vedic birth chart analysis and ongoing personalized insights for $2.99/month instead of $50-200+ per human consultation.

Strategic decisions: WhatsApp (no app download friction for Indian users), Vedic astrology (dominant system in target market), subscription model (astrology users want ongoing guidance, not one-time answers).

Value proposition: 95% cheaper than human astrologers, 24/7 availability, instant 5-10 second responses vs weeks of booking lead time.`,
    },
    builder: {
      title: "Astro AI: Vedic Astrology Bot",
      brief: "Swiss Ephemeris for NASA-grade astronomical calculations with GPT-5 conversational layer. WhatsApp Business API integration. Redis caching for repeated questions. Multilingual support (English, Hindi, Gujarati).",
      detailed: `Tech stack built for astronomical precision—getting planet positions wrong by degrees invalidates entire readings.

Core: Swiss Ephemeris library for birth chart calculations (same library used by professional astrology software). GPT-5 for conversational layer and insight generation.

Architecture: FastAPI backend, PostgreSQL for user data, WhatsApp Business API for delivery. Redis caching reduces API costs for repeated/similar questions.

Multilingual: Supports English, Hindi, and Gujarati at launch. Adding more languages based on user demand.`,
    },
    consultant: {
      title: "Astro AI: Vedic Astrology Bot",
      brief: "Expert consultation democratization: $200/session astrology made accessible at $2.99/month. WhatsApp integration for users' preferred platform. Unlimited concurrent users with zero marginal cost.",
      detailed: `AI fundamentally changes the economics of expert consultations. Human astrologers don't scale—one person can only serve so many clients per day.

This system provides professional-quality astrology readings at a fraction of the cost, available 24/7, to unlimited concurrent users.

Business model: $2.99/month subscription with high volume at low price point. WhatsApp delivery means zero friction. Target market: India has millions of astrology believers—even small market capture is substantial business.`,
    },
  },

  "foggy-rainwater-text-generator": {
    pm: {
      title: "Foggy Window Text LoRA",
      brief: "First-of-its-kind LoRA model generating foggy window text effects (writing on steamy glass). Open-sourced on CivitAI and Hugging Face. Proved smaller, high-quality datasets (30-60 images) outperform larger noisy ones.",
      detailed: `Created a first-of-its-kind LoRA for an aesthetic no existing model could generate: foggy window text, the effect of writing on steamy glass during rainy days.

The challenge: No existing dataset. Built everything from scratch including data collection, curation, and training pipeline.

Key learning: Smaller high-quality datasets (30-60 images) outperformed larger ones (150 images). Quality beats quantity in LoRA training. Open-sourced on CivitAI and Hugging Face for the creative community.`,
    },
    builder: {
      title: "Foggy Window Text LoRA",
      brief: "Custom LoRA training pipeline with 250-image curated dataset (200 real + 50 synthetic). BLIP-2 for captioning. Tested 4 versions to prove 30-60 images optimal. Handles emojis, formulas, multiline text.",
      detailed: `Built a complete LoRA training pipeline from scratch with no reference dataset.

Dataset: Scraped 200 real foggy window images from Pinterest, Google, iStock. Created 50 synthetic images in Photoshop for edge cases (symbols, digits, emojis).

Captioning: BLIP-2 for description generation with manual review and correction.

Training experiments: Tested 4 LoRA versions (150, 80, 60, 30 images). Discovered smaller curated datasets produced better results. Final model handles long text, multiline content, emojis, doodles, and math formulas.`,
    },
    consultant: {
      title: "Foggy Window Text LoRA",
      brief: "On-demand creative asset generation for foggy window text effects. What would cost a professional photoshoot (hundreds of dollars, hours of work) now generates in seconds for pennies.",
      detailed: `Solves a creative agency problem: specific visual effects that don't exist as stock assets, and custom photography is expensive.

This LoRA generates foggy window text effects on demand. Need a melancholic quote on rainy glass? Generate in seconds. Need 10 variations? Generate in a minute.

Use cases: Social media content, advertising, book covers, movie posters. Value: What would cost a photoshoot (hundreds of dollars, hours of time) can now be generated for pennies in seconds.`,
    },
  },
}

// =============================================================================
// SECTION 7: JOURNEY / TIMELINE
// =============================================================================

export const journeyContent = {
  pm: {
    "100x-engineers": [
      "Rapid Prototyping sprint. Built and validated 4 AI products in 6 months to master the 'Idea-to-MVP' loop",
      "Deep expertise in Agentic AI: OpenAI Agents SDK, Google ADK, Claude Agent SDK, and multi-agent orchestration",
      "Built production MCP servers enabling AI tool integration across Claude Desktop, ChatGPT, and Cursor",
    ],
    "hunch-apm": [
      "Increased user engagement by 200% through MBTI-based personality matching system",
      "Created web onboarding revenue stream generating $1.5K monthly, contributing 30% boost to $5K monthly revenue",
      "Built Retool analytics dashboard, saving $1K+ monthly and 15+ hours weekly of manual analysis",
      "Improved session time by 100% with fine-tuned chat models and AI conversation starters",
    ],
    "hunch-content": [
      "Orchestrated content strategy during app transition from polling to dating",
      "Managed team of 6, improving output by 60%",
      "Reduced Day-0 uninstall rate by 35% via optimized onboarding polls",
      "Ran content experiments for female categories, achieving 80% increase in publications",
    ],
    "plotx": [
      "Improved organic traffic by 50%, driving 3K+ monthly signups",
      "Authored 30+ SEO-rich blogs, boosting engagement time by 100%",
      "Conducted 100+ research interviews, validating polling concepts for Hunch's pivot",
    ],
    "inurture": [
      "Improved course completion by 20% and student satisfaction by 15%",
      "Developed academic content impacting 5K+ learners across AI, Finance, Law, and Cybersecurity",
    ],
    "freelance": [
      "Reached 5M+ readers by ghostwriting 300+ articles for 20+ global clients",
      "Secured long-term partnerships with 80% of clients",
    ],
  },
  builder: {
    "100x-engineers": [
      "Selected for Elite Cohort (Top 20). Shipped 14+ AI products: Voice UXR Agent, Git Roast, Lecture Lens, and more",
      "Mastered advanced RAG, Vector DBs (Pinecone, Supabase pgvector), custom LoRA training, and MCP server development",
      "Deep expertise in agent architecture: OpenAI Agents SDK, Google ADK, LangGraph, and multi-agent orchestration",
    ],
    "hunch-apm": [
      "Hands-on engineering: personally fine-tuned GPT-4o on 450+ conversation pairs",
      "Wrote SQL queries powering the analytics dashboard; integrated with Retool and Mixpanel",
      "Deployed voice-based UXR agent with Twilio, ElevenLabs, and custom websocket handling",
      "Built Poll Promotion Engine frontend with React and TypeScript",
    ],
    "hunch-content": [
      "Built internal tooling for content operations",
      "Designed data structures for poll categorization and targeting",
      "Integrated Retool dashboards with backend systems for content team",
    ],
    "plotx": [
      "Conducted 100+ user research interviews. Foundational for future UXR automation work",
      "Built content frameworks that scaled traffic by 50%",
    ],
    "inurture": [
      "Created technical content for AI and Cybersecurity courses",
      "Developed content frameworks for 5K+ learners",
    ],
    "freelance": [
      "Ghostwrote 300+ articles for blockchain, crypto, and finance clients",
      "Built writing systems that scaled to 5M+ readers",
    ],
  },
  consultant: {
    "100x-engineers": [
      "Deep dive into Agentic Workflows to understand how to replace expensive human labor with autonomous software",
      "Built and deployed production automation systems used by real clients and businesses",
      "Learned to balance code vs no-code solutions based on client needs and maintenance requirements",
    ],
    "hunch-apm": [
      "Deployed voice-based UXR agent, scaling research from 2 to 50+ daily calls, reducing costs by 70%",
      "Built Retool analytics dashboard replacing 3 SaaS tools, saving $1K+ monthly",
      "Automated A/B testing workflows, reducing dependency on tech team by 80%",
      "Designed Poll Promotion Interface, cutting manual campaign work by 85%",
    ],
    "hunch-content": [
      "Designed and launched Poll Promotion Interface, cutting manual work by 85%",
      "Automated content scheduling and distribution workflows",
      "Managed team of 6 while improving operational efficiency by 60%",
    ],
    "plotx": [
      "Improved organic traffic by 50%, driving 3K+ monthly signups",
      "Authored 30+ SEO-rich blogs reducing bounce rate by 25%",
      "Proved ROI of content marketing with measurable traffic metrics",
    ],
    "inurture": [
      "Improved course completion by 20% through content optimization",
      "Developed scalable content frameworks impacting 5K+ learners",
    ],
    "freelance": [
      "Increased engagement by 30% for client brands in finance and crypto",
      "Secured long-term partnerships with 80% of clients through ROI-focused content",
    ],
  },
}

// =============================================================================
// SECTION 8: SKILLS & STACK ORDERING
// =============================================================================

export const skillsOrder = {
  pm: [
    "Product Management",
    "Data & Analytics",
    "User & Growth",
    "AI Development",
    "Content & Strategy",
    "Product Operations",
  ],
  builder: [
    "AI Development",
    "Agentic AI & Orchestration",
    "AI Development Frameworks",
    "Frontend",
    "Backend & APIs",
    "Infra & DevOps",
  ],
  consultant: [
    "Automation & Workflows",
    "Data & Analytics",
    "Analytics & Operations",
    "AI Development",
    "User & Growth",
    "Backend & APIs",
  ],
}

export const techStackOrder = {
  pm: [
    "Analytics & Operations",
    "Design & Prototyping",
    "AI & ML Platforms",
  ],
  builder: [
    "AI Development Frameworks",
    "Agentic AI & Orchestration",
    "Backend & APIs",
    "Infra & DevOps",
  ],
  consultant: [
    "Automation & Workflows",
    "Analytics & Operations",
    "AI & ML Platforms",
    "Backend & APIs",
  ],
}

// =============================================================================
// SECTION 9: CONTACT & FOOTER
// =============================================================================

export const contactContent = {
  pm: {
    header: "Let's Connect",
    subheader: "Ready to discuss your next product idea or explore collaboration opportunities? I'd love to hear from you.",
    calendlyCta: "Book a 30-minute product strategy session",
  },
  builder: {
    header: "Let's Build Something",
    subheader: "Looking for a technical co-founder or AI engineer? Let's talk architecture.",
    calendlyCta: "Book a 30-minute technical deep-dive",
  },
  consultant: {
    header: "Let's Automate Your Business",
    subheader: "Ready to cut costs and save time? Book a free audit call.",
    calendlyCta: "Book a free 30-minute automation audit",
  },
}

export const footerContent = {
  pm: {
    headline: "🎉 Congratulations. Your search for the right PM ends here.",
    subheadline: "⏳ The time is ticking. Let's stop searching and start building.",
  },
  builder: {
    headline: "🚀 Ready to ship? Let's build something incredible.",
    subheadline: "⚡ I turn ideas into production in weeks, not months.",
  },
  consultant: {
    headline: "💰 Your first $1,000 savings is just one call away.",
    subheadline: "⏰ Time is money. Let's stop wasting both.",
  },
}

// =============================================================================
// SECTION 10: TESTIMONIALS / WALL OF LOVE
// =============================================================================

type Testimonial = {
  avatar: string
  name: string
  title: string
  quote: string
  linkedin: string
}

export const testimonialsContent: Record<Persona, Testimonial[]> = {
  pm: [
    {
      avatar: "/ashutosh-gupta.png",
      name: "Ashutosh Gupta",
      title: "Strategy at Hunch | Ex-IB | SSCBS",
      quote:
        "What sets Umang apart is his builder mindset and his ability to blend first-principles thinking with creativity and data-driven execution. His contributions substantially shaped Hunch's product direction, from boosting onboarding engagement to refining matchmaking logic and driving retention experiments. I've seen him work tirelessly, often going beyond his scope, to ensure projects shipped on time and with high quality.",
      linkedin: "https://www.linkedin.com/in/ashutosh-gupta-0321b2145/",
    },
    {
      avatar: "/shiv-pande.png",
      name: "Shiv Ram Pande",
      title: "Founding Team & CBO at BitSave | Digital Asset Management",
      quote:
        "Umang rose to the challenge with dedication and endless ideas. He wasn't just a wordsmith; he was a creative architect who shaped product direction through data-driven insights. His influence extended beyond his own work, shaping the content team through guidance and mentorship. Any team looking to innovate and execute at speed would be fortunate to have him.",
      linkedin: "https://www.linkedin.com/in/shivrampande/",
    },
    {
      avatar: "/dipayan-chatterjee.png",
      name: "Dipayan Chatterjee",
      title: "Full-stack marketer growing tech startups from 0-1 and 1-10",
      quote:
        "Umang embodies resilience, adaptability and grit. No matter how complex a problem may be, you can expect it to be assessed, quantified and worn down to a solution with simple determination. It has pleased me greatly to see him take on a larger strategy-focused role in the organization.",
      linkedin: "https://www.linkedin.com/in/dipayanchatterjee/",
    },
  ],
  builder: [
    {
      avatar: "/ashutosh-gupta.png",
      name: "Ashutosh Gupta",
      title: "Strategy at Hunch | Ex-IB | SSCBS",
      quote:
        "What sets Umang apart is his builder mindset and his ability to blend first-principles thinking with creativity and data-driven execution. He fine-tuned internal chat models that significantly improved engagement and built an internal analytics dashboard using Retool and Redshift, giving us real-time insights into virality and competitor activity. At the same time, he designed engaging poll formats, ran rigorous A/B tests, and dove deep into data to inform product decisions.",
      linkedin: "https://www.linkedin.com/in/ashutosh-gupta-0321b2145/",
    },
    {
      avatar: "/shiv-pande.png",
      name: "Shiv Ram Pande",
      title: "Founding Team & CBO at BitSave | Digital Asset Management",
      quote:
        "It's not often you find someone like Umang—a diligent writer brimming with boundless imagination. He wasn't just a wordsmith; he was a creative architect, crafting content that captured Hunch's essence and resonated with early users. His wit, nuance, and unexpected touches inspired the team to push boundaries and strive for excellence.",
      linkedin: "https://www.linkedin.com/in/shivrampande/",
    },
    {
      avatar: "/dipayan-chatterjee.png",
      name: "Dipayan Chatterjee",
      title: "Full-stack marketer growing tech startups from 0-1 and 1-10",
      quote:
        "No matter how complex a problem may be, you can expect it to be assessed, quantified and worn down to a solution with simple determination. Umang embodies resilience, adaptability and grit—qualities essential for any builder shipping production systems.",
      linkedin: "https://www.linkedin.com/in/dipayanchatterjee/",
    },
  ],
  consultant: [
    {
      avatar: "/ashutosh-gupta.png",
      name: "Ashutosh Gupta",
      title: "Strategy at Hunch | Ex-IB | SSCBS",
      quote:
        "Umang built an internal analytics dashboard using Retool and Redshift, giving us real-time insights into virality and competitor activity—always iterating rapidly to deliver results. His contributions substantially shaped Hunch's product direction. I've seen him work tirelessly, often going beyond his scope, to ensure projects shipped on time and with high quality.",
      linkedin: "https://www.linkedin.com/in/ashutosh-gupta-0321b2145/",
    },
    {
      avatar: "/shiv-pande.png",
      name: "Shiv Ram Pande",
      title: "Founding Team & CBO at BitSave | Digital Asset Management",
      quote:
        "Umang's dedication went beyond deadlines. His influence extended beyond his own work, shaping the young content team through guidance and mentorship. His constructive criticism, always delivered with genuine desire for everyone's success, became a beacon. Working with Umang was a joy—he brings his A-game every day.",
      linkedin: "https://www.linkedin.com/in/shivrampande/",
    },
    {
      avatar: "/dipayan-chatterjee.png",
      name: "Dipayan Chatterjee",
      title: "Full-stack marketer growing tech startups from 0-1 and 1-10",
      quote:
        "Umang embodies resilience, adaptability and grit. No matter how complex a problem may be, you can expect it to be assessed, quantified and worn down to a solution with simple determination. It was an absolute pleasure working with Umang.",
      linkedin: "https://www.linkedin.com/in/dipayanchatterjee/",
    },
  ],
}
