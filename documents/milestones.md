# 🚀 BUILD MILESTONES

> **Flow**: Two-phase approach  
> **Discipline**: One logical change = one commit. Prefixes: `feat/`, `fix/`, `refactor/`, `qa/`. Squash before merge. No force-push to `main`.

---

## 🧱 PHASE A – Static Mark‑up (v0.dev)

**Branch: `feat/markup`**
- Scaffold repo: `pnpm create next-app`
- Init Tailwind 3.4 + shadcn/ui; add dark‑mode toggle stub.
- Build DOM markup for: Hero → Footer using dummy arrays.
- Push → open PR.
- **QA-A**:
  - Ensure **nine anchors** exist (one per major section).
  - No Framer motion yet.
  - Dark toggle flips `class`.

---

## ⚙️ PHASE B – Cursor IDE Iterations

### 🔹 Milestone B‑1 – `feat/motion-core`
- Add Framer Motion:
  - Section fade-ins
  - KPI chip stagger (80ms)
  - Process Wheel path draw (1.5 s)
  - Tilt effect for cards
- Store dark-mode preference in `localStorage.theme`
- **QA-B1**:
  - All animations honor `prefers-reduced-motion`
  - Wheel draws only once on view

### 🔹 Milestone B‑2 – `feat/ai-companion`
- Add `/api/companion` Edge route using `@vercel/ai`, model `gpt-4o`.
- Connect to Hero’s AI Companion Bar.
- Use AbortController to cancel streams.
- **QA-B2**:
  - Debounce input (300 ms)
  - Stream starts <1 s
  - Error toast on `429`

### 🔹 Milestone B‑3 – `feat/contact-flow`
- Build Chat FAB Dialog (shadcn):
  - Fields: Name, Email, Message
- On submit:
  - Send email via **Resend**
  - Add row to **Supabase** `leads`
- Add:
  - **Calendly iframe button**
  - **WhatsApp deep-link**
- **QA-B3**:
  - Form validation
  - Email delivered
  - Supabase row created
  - WhatsApp opens correctly

### 🔹 Milestone B‑4 – `feat/extras`
- Add:
  - **Logo marquee** (18 s loop, pause on hover)
  - **Tools ring** (8 icons orbit in 20 s, hover = label appears)
  - **Wall of Love** testimonials section:
    - Mobile: horizontal scroll with snap
    - Desktop: 3-card grid
  - **Fun 404 page**:
    - LoRA jar tumbling animation
    - Link back home
- **QA-B4**:
  - Marquee at 60 FPS
  - Testimonials fade-in correctly
  - 404 page is accessible

### 🔹 Milestone B‑5 – `release/v1`
- Replace all dummy arrays:
  - KPI chips
  - Logos
  - Testimonials
- Integrate:
  - **Plausible analytics**
  - Custom event hooks
- Performance:
  - Lighthouse Score ≥ 95
  - Axe: 0 critical A11y issues
- Final steps:
  - Switch DNS
  - Tag version: `v1.0.0`
