# 🚀 BUILD MILESTONES

> **Flow**: Phase‑based. Solo dev → **commit directly to `main`** (no PR). One logical change = one commit. Prefix with `feat:`, `fix:`, `refactor:`, `qa:`. Tag releases `v1.x.y`.

---

## 🧱 PHASE A – Static Mark‑up (v0.dev)

### Milestone A‑1 — Scaffold & Static DOM
**What to do**
- Scaffold Next.js app (`pnpm create next-app`), Tailwind, shadcn/ui, dark‑mode toggle stub.
- Build DOM for all sections (Hero → Footer) with **dummy arrays** from PRD.

**Tech**
- Next.js 14 (App Router), Tailwind, shadcn/ui.

**QA focus**
- Nine anchors exist; no placeholder lorem.  
- Dark‑mode toggle flips class; persists.  
- Bundle ≤ 90 kB at this stage; no Framer Motion.

**Acceptance**
- `pnpm build` green.  
- Lighthouse ≥ 90 perf.  
- Commit: `feat: A-1 static scaffold + anchors`.

---

### Milestone A‑2 — v0 Refinement (Hero/KPI/Wheel/Testimonials/Tools/Footer)
**What to do (incremental; do not regenerate scaffold)**
- **Hero**: add typewriter H1, 12‑word blurb, socials; insert **static multi‑armed illustration** (placeholder SVG); subtle gradient + noise background.
- **Header nav**: - add sticky header with anchor IDs (`#process`, `#highlights`, `#projects`, `#social proof`, `#journey`, `#contact`). It should have smooth scroll; active section highlight.
- **KPI section**: own `<section id="kpis">`; implement **count‑up** chips (stagger 80 ms; reduce motion → static).
- **Process Wheel**: switch to **5‑step** order (**Research → Build → Launch → Measure → Learn**); mic/whiteboard center; tooltips.
- **Shipped Highlights**: expand to **6** items; **keen‑slider** auto‑scroll (pause on hover; arrows).
- **Testimonials**: 2‑column (desktop) **auto‑swap** pager every 6 s (exit left, enter right); mobile horizontal snap.
- **Toolkit**: replace orbit with **dual belt scrollers** (top L→R, bottom R→L) + right‑side categorized lists.
- **Footer**: add **back‑to‑top arrow** (fixed bottom‑left). Move **Contact Me** into dedicated section (remove floating FAB).

**Tech**
- Framer Motion (light), react‑simple‑typewriter, react‑countup, keen‑slider, basic CSS keyframes for belts.

**QA focus**
- Header is sticky; anchors scroll under 100 ms and respect `prefers-reduced-motion`.  
- Count‑ups start only when in‑view; no negative numbers on rerender. 
- Testimonials swap cadence exact 6 s; pause on hover.  
- Belt scrollers are 60 FPS and pause on hover.  
- Back‑to‑top arrow visible after 120vh; scrolls to top.

**Acceptance**
- `pnpm build` green; no console warnings.  
- Commit: `feat: A-2 hero+kpis+wheel+testimonials+toolbelts+back-to-top`.

---

## ⚙️ PHASE B – Cursor IDE Iterations

### Milestone B‑1 — Motion Core
**Do**
  - Global fade‑in/out transitions.
  - Hero typewriter, KPI animated counters.
  - Process wheel animate on view.
  - Shipped Highlights auto‑scroll, pause on hover.
  - Projects tilt ≤ 6° on hover + modal open.
  - Testimonials 2‑col pager auto‑swap every 6s.
  - Toolkit dual‑scroll continuous loop.
  - Journey cards fade/slide in.
  - Ensure `prefers-reduced-motion` fallback.
**QA**
  - Animations occur once; no layout shift.
  - Motion smooth < 16ms frame.
  - Reduced‑motion respected.  
**Commit**
- `feat: motion-core fade/tilt + reduced-motion`

### Milestone B‑2 — AI Companion (Hero)
**Do**
- Edge route `/api/companion`.
- GPT‑4o streaming via **@vercel/ai** SDK.
- Prompt injection with Umang’s context (hardcoded JSON v1).
- AbortController handling.
- Debounce 300 ms input.
**QA**
  - Stream starts < 1 s; 429 toast shows; cancel on navigate; a11y for input label.
  - Response under 1.5 s TTI.
  - No hallucinations (stays on given data).
**Commit**
- `feat: ai-companion edge route + hero wire-up`

### Milestone B‑3 — Contact Flow
**Do**
- Contact section form (Name, Email, Website/Social (optional), Message).  
- Submit → **Resend** email to `umangthakkar005@gmail.com`; **Supabase** row insert.  
- Add **Calendly 30‑min** embed; **WhatsApp** deep‑link.
**QA**
- Client + server validation; success toast; Supabase row appears.  
**Commit**
- `feat: contact section + resend + calendly + whatsapp`

### Milestone B‑4 — Extras
**Do**
- Projects modal.  
- Client logos marquee motion.
- 404 fun egg page.
- Dark/light toggle.
**QA**
- Marquee loop 18 s; Projects modal closes on Esc; 404 reachable.
**Commit**
- `feat: extras marquee+modal+404`

### Milestone B‑5 — Release v1
**Do**
- Replace dummy arrays with config JSON/TS.
- Project cards: real images + GitHub/Live/YouTube links.
- Testimonials: ≥6 real quotes.
- Clients: 8 logos.
- Tools: actual logos.
- Timeline: roles + promotions (multi‑role support in same company).
- Integrate:
  - **Plausible analytics**
  - Custom event hooks
- Performance:
  - Lighthouse Score ≥ 95
  - Axe: 0 critical A11y issues
- Final steps:
  - Switch DNS
  - Tag version: `v1.0.0`
**QA**
- Lighthouse ≥ 95; Axe: 0 critical; OG images correct.
**Commit**
- `chore: ship v1 (data+analytics+seo)`
