# QA CHECKLIST

> Use this per‑milestone list in addition to the **Golden Path**.

---

## ALWAYS
- [ ] `pnpm run build` passes (no warnings).
- [ ] No console errors (open DevTools).
- [ ] Lighthouse Performance ≥ 95.
- [ ] iPhone SE / 320px: no horizontal scroll.
- [ ] Dark‑mode toggles and **persists** (localStorage).

---

## A‑1 — Static DOM & Anchors
- [ ] Header is sticky; anchors exist for every section.
- [ ] No placeholder lorem; headings match PRD.
- [ ] Common v0 pitfalls checked: missing `key`, missing `alt`, wrong aria roles.

---

## A‑2 — Hero / KPI / Process / Testimonials / Tools / Footer
**Hero**
- [ ] Typewriter cycles verbs; fallback text shown when disabled.
- [ ] Illustration renders with `next/image` and has meaningful `alt`.
- [ ] Header links **smooth‑scroll** and highlight active section.

**KPI Chips**
- [ ] Count‑up starts **when in view**; does not re‑run on every scroll.
- [ ] `prefers-reduced-motion` shows static values.

**Process Wheel (5‑step)**
- [ ] Order is **Research → Build → Launch → Measure → Learn**.
- [ ] SVG draw 1.5 s once; tooltips/labels are keyboard focusable.

**Shipped Highlights**
- [ ] At least **6** items; autoplay 6 s; pause on hover; arrow keys work.

**Testimonials**
- [ ] Desktop auto‑swap every **6 s** (exit left, enter right).
- [ ] Mobile horizontal snap; swipe works; LinkedIn “in” colored.

**Toolkit (Dual Belts)**
- [ ] Top belt L→R; bottom belt R→L; 60 FPS; pause on hover.
- [ ] Right column shows categorized lists; responsive stacking on mobile.

**Footer / Back‑to‑Top**
- [ ] Back‑to‑top arrow appears after 120vh and returns to Hero.
- [ ] Footer duplicates nav links; résumé link works.

---

## B‑1 — Motion Core
- [ ] Fades/tilt respect reduced‑motion; no layout shift (CLS).

## B‑2 — AI Companion
- [ ] Debounce 300 ms; stream starts < 1 s; can cancel on navigate.
- [ ] Rate‑limit 429 shows toast; input has accessible label.

## B‑3 — Contact Flow
- [ ] Form validation; success toast.
- [ ] **Resend** email arrives at `umangthakkar005@gmail.com`.
- [ ] (If enabled) Supabase row in `leads` table.
- [ ] **Calendly 30‑min** opens and closes cleanly.
- [ ] **WhatsApp** opens `https://wa.me/919426154668`.

## B‑4 — Extras
- [ ] Logos marquee loop 18 s; pause on hover.
- [ ] Projects modal closes on **Esc** and overlay click.
- [ ] `/404` reachable; easter‑egg animation plays; link home works.

## B‑5 — Release
- [ ] Real data swapped; OG tags valid; Plausible events fire.
