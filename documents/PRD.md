# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD) · AI‑PM Portfolio

> **Owner**: Umang Thakkar  
> **Editor**: ChatGPT-o3  
> **Status**: Final  
> **Scope**: One-page portfolio site demonstrating proof of product craft, metrics, and direct contact within 60 seconds.

---

## 1. 🎯 Purpose & Vision

Create a single bespoke page that:
- Loads in **≤ 1.5 s** worldwide (even on 4G).
- Surfaces **metrics + identity** within the first scroll.
- Provides **email, Calendly, and WhatsApp** contact in **≤ 2 clicks**.
- Reflects **Umang’s product mindset and storytelling velocity**.

---

## 2. ❗ Problem Statement

Most template portfolios:
- Hide impact behind cluttered UIs.
- Are slow or feel generic.
- Make it hard to connect with the creator.

**We need**:
- A **crafted, fast** site.
- With **micro-interactions** under 150 kB JS.
- That converts quickly through embedded contact features.

---

## 3. 📈 Success Metrics

| Goal        | KPI                                | Target   |
|-------------|-------------------------------------|----------|
| Speed       | LCP (desktop 4G)                    | ≤ 1.5 s  |
| Engagement  | Scroll to Shipped Highlights        | ≥ 85 %   |
| Conversion  | CTR (form/Calendly/WhatsApp)        | ≥ 10 %   |
| Quality     | Lighthouse Performance Score        | ≥ 95     |

---

## 4. 👤 Personas & JTBD

1. **Hiring Manager** → “Can this PM ship data‑backed results?”
2. **Seed-stage VC** → “Is this builder’s story compelling?”
3. **Engineer Collaborator** → “Do we align on stack & values?”

---

## 5. 🔑 Guiding Principles

1. **Skim First** – metrics, tools, logos visible immediately.
2. **Delight, Not Distract** – subtle Framer Motion; no heavy WebGL.
3. **Data-Driven** – each project card displays KPIs.
4. **Swap-Friendly** – all copy lives in small TS arrays for easy edits.

---

## 6. 🔧 Functional Requirements (per Section)

### Hero
- Greeting pill (cycles every 4s).
- Typewriter H1 (verbs: *shipping → scaling → de-risking*).
- 12-word blurb (fade-in).
- **AI Companion Lite** search bar → `/api/companion` (Edge GPT‑4o).
- KPI strip (4 chips, staggered 0.08s).

### Process Wheel
- SVG draw over 1.5s.
- 4 steps with tooltip.
- Respects `prefers-reduced-motion`.

### Shipped Highlights
- `keen-slider`; 6s auto-scroll; pause on hover; arrow keys supported.

### Projects Slider
- `react-parallax-tilt` (6°).
- Click = video modal (React Player).
- Bottom-left KPI chip; GitHub + Live badges top-right.

### Client Logos
- Greyscale marquee (18s loop); color on hover.

### Wall of Love (Testimonials) — 🆕
- Heading: **"What People Say"**.
- Cards:
  - 48px avatar (with ring).
  - Truncated quote + “Read more ▼”.
  - Name, LinkedIn icon (optional), role.
- Layout:
  - Mobile: horizontal scroll with `snap-x`.
  - Desktop: 3-card grid, max card width: 480px.
  - Fade-in stagger: 0.2s.

### Tools Ring
- 8 tech icons orbit (20s); hover = icon scales 1.2× + label appears.

### Timeline / About
- `react-vertical-timeline`
- First card = About.
- Items fade in on scroll; image optional.

### Chat FAB
- Pulsing bubble (bottom-right).
- Modal (320 × 420): Name, Email, Message.
  - Submit → sends email (Resend) + inserts Supabase row (`leads`).
  - Buttons:
    - **Send**
    - **Book 15 min** (Calendly iframe)
    - **WhatsApp** deep-link → `https://wa.me/919426154668?...`

### Footer
- Social links: LinkedIn, GitHub, Twitter.
- Résumé (PDF link), light/dark aware.

### 404 Easter-Egg
- Route: `/404`
- Animation: tumbling LoRA jar.
- Text: “You broke the loop!”
- CTA: link back to home.

---

## 7. 🛠️ Back-End APIs

| Route                 | Method | Purpose                              | Tech                     |
|----------------------|--------|--------------------------------------|--------------------------|
| `/api/companion?q=`  | GET    | Stream markdown from AI Companion    | @vercel/ai, GPT‑4o, Edge |
| `/api/contact`       | POST   | Resend email + Supabase insert       | Resend, Supabase Edge    |

---

## 8. 🚧 Non-Functional Requirements

- JS Bundle: **≤ 150 kB gzipped**
- Render blocking time: **≤ 100 ms**
- Accessibility: **WCAG 2.1 AA**
- SEO: meta tags + OG tags, `sitemap.xml`
- CI/CD:
  - GitHub PR → Vercel Preview with Lighthouse‑CI gate (≥ 95).
  - `pnpm` as package manager.
- Analytics: Plausible (deferred script, privacy-first)

---

## 9. 🧱 Tech Stack

- **Framework**: Next.js 14 (App Router, Edge runtime)
- **Styling**: Tailwind CSS (dark-mode toggle)
- **UI Kit**: shadcn/ui (Radix-based)
- **Motion**: Framer Motion 6
- **Carousel**: keen-slider
- **Tilt**: react-parallax-tilt
- **AI API**: @vercel/ai + GPT‑4o
- **Email**: Resend
- **DB**: Supabase
- **Analytics**: Plausible

---

## 10. 🧪 Dummy Data Stubs

\`\`\`ts
export const testimonials = [
  {
    avatar: '/avatars/sid.png',
    name: 'Siddharth Arya',
    title: 'Director, Aryacorp',
    quote: 'Ashhar is a highly enthusiastic…',
    linkedin: 'https://…'
  },
  // …2 more
];

export const kpiChips = [
  '3.2× Match-rate',
  '100k+ Polls',
  '6 yrs PM',
  '40 Features',
];

export const processSteps = [
  { title: 'Build', icon: '🛠️', desc: 'Ship vertical slice quickly' },
  { title: 'Measure', icon: '📊', desc: 'Mixpanel & SQL' },
  { title: 'Learn', icon: '🧠', desc: 'Rapid user feedback loops' },
  { title: 'Launch', icon: '🚀', desc: 'Scale, iterate, market' },
];
\`\`\`

---

## 11. 🔓 Open Items (v1 Freeze)

1. Final text for KPI chips.
2. Final logo SVGs.
3. 3 testimonial quotes + avatars.
