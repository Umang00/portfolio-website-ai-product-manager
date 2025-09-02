# ✅ QA GUIDELINES

These guidelines preserve your original structure and expand checks for the new A‑2 scope.

---

## 1) 🔁 Golden Path (must always work)
1. Load home on throttled **4G**.
2. Click header **Process** → smooth‑scroll; back via header **Projects**.
3. Scroll to **Shipped Highlights** (auto‑scroll pauses on hover).
4. Open a **Project** and view its modal (or external links).
5. Use **AI Companion** (“What’s your PM loop?”) → streaming reply.
6. Submit **Contact** (valid data) → success toast.
7. Tap **WhatsApp** CTA.
8. Toggle **Dark mode**, reload → preference persists.
9. Tap **Back‑to‑top** arrow → returns to top.
10. Check for **Testimonials** pager (2-col desktop, snap mobile, autoswap 6s).

---

## 2) ♿ Accessibility (A11y)
- Run Axe CLI and manual keyboard pass.  
- All interactive elements have focus ring; testimonials pager operable by keyboard.  
- Images/illustrations include descriptive `alt` text.
- Use 'pnpm exec @axe-core/cli http://localhost:3000' **Expectation**: **Zero critical violations**.

---

## 3) 🚀 Performance Budget
- JS gzipped ≤ **150 kB**; no unused Framer Motion bundles.  
- LCP ≤ **1.5 s** (hero illustration optimized with `next/image`).  
- Use `pnpm run analyze` to verify tree‑shaking.

---

## 4) 🎞️ Motion Respect
- Emulate `prefers-reduced-motion: reduce`:
  - Count‑ups become static numbers.
  - Wheel draw & section fades disabled.
  - Belt scrollers pause.

---

## 5) 🔄 Regression Strategy
- Whenever a section changes, re‑run the **Golden Path** and the relevant milestone checklist (below).  
- Keep a short **regression notes** log per commit (what you touched, what you retested).

---

## 6) 🧾 Commit Discipline (solo, direct‑to‑main)
- One logical change per commit.  
- Prefix: `feat:`, `fix:`, `refactor:`, `qa:`.  
- Write **imperative** subject lines; include scope (e.g., `hero`, `kpis`).  
- Tag releases `v1.x.y`.
