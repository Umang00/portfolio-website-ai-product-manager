# ✅ QA GUIDELINES

### 1. 🔁 Golden Path Test
> The core user journey that must always work.

**Steps:**
1. Load home on 4G throttling.
2. Scroll to **Highlights** section.
3. Open a **Project video modal**.
4. Use **AI companion bar** (e.g., “What’s your PM loop?”).
5. Submit **Chat form** → observe success.
6. Click **WhatsApp CTA button**.
7. Toggle **dark mode** and reload → preference should persist.

### 2. ♿ Accessibility (A11y)
> Ensure inclusivity using Axe CLI.

\`\`\`bash
pnpm exec @axe-core/cli http://localhost:3000
\`\`\`
- **Expectation**: **Zero critical violations**.

### 3. 🚀 Performance Budget & Analysis
> Maintain speed across devices.

\`\`\`bash
pnpm run analyze  # next-bundle-analyzer
\`\`\`
- **JS bundle**: ≤ **150 kB gzipped** (after tree-shaking).
- **LCP** (Largest Contentful Paint): ≤ **1.5 seconds** on Chrome (network throttled to 4G).

### 4. 🎞️ Motion Respect
> Test for users with reduced motion preferences.

- Emulate:  
  `prefers-reduced-motion: reduce`
- **Expectation**: All wheel-draws, fades, and animations **must pause or skip** appropriately.

### 5. ✅ Regression Strategy
> Prevent old bugs from returning.

- Whenever a feature is touched, update the regression matrix (e.g., `qa_checklist_v2.md`).
- **Always retest**:
  - Hero section
  - Highlights/Projects
  - Chat Form (especially on **mobile**).

### 6. 🧼 Commit & Branching Hygiene
> Keep Git history clean and traceable.

- **Branching**:
  - Use descriptive names:  
    `feat/ai-search`, `fix/header-overlap`
- **Commits**:
  - **Squash** commits before merge.
  - Add meaningful **prefixes** (e.g., `fix:`, `test:`, `refactor:`).
  - No **force-push** to `main`.
  - For QA feedback: use `-qa` suffix in commit message when acting on review.
