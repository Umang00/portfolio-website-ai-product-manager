# QA CHECKLIST · v3

### Always
- [ ] `pnpm run build` passes
- [ ] No console errors
- [ ] Lighthouse ≥ 95 perf
- [ ] Mobile iPhone SE no h‑scroll
- [ ] Dark‑mode works, persists

### A‑1 Static DOM
- Anchors exist, no placeholder text
- Common v0: missing `key`, bad aria

### B‑1 Motion Core
- Fade‑in once only
- Wheel draws 1.5 s
- Tilt 6° max

### B‑2 AI Companion
- Debounce 300 ms, stream < 1 s
- Edge header correct
- 429 toast error handled

### B‑3 Contact Flow
- Validation ok
- Email arrives (Resend)
- Supabase row created
- WhatsApp link opens correct number
- Calendly loads & closes

### B‑4 Extras
- Marquee 18 s loop, hover pause
- Tools ring 20 s full orbit
- Testimonials cards fade stagger 200 ms

### B‑5 Release
- Real data swapped
- OG tags good
- Plausible events fire
- 404 egg works

