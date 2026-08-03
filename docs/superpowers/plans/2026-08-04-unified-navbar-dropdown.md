# Unified Navbar Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Render the navbar and open product dropdown as one continuous rectangular frosted-white surface with no seam, mask, gradient, or fading edge.

**Architecture:** Keep the existing DOM and CSS-driven hover/focus interaction. Reuse the navbar's existing `--header-surface` and `--header-blur` values for the dropdown material, then suppress the navbar's separate background, backdrop filter, and diffusion strip while the dropdown is open using `:has()`. Preserve the transparent unscrolled hero exception.

**Tech Stack:** Next.js 16, React 19, CSS, Vitest, Lightning CSS

---

## File Map

- Modify `tests/unit/site-header-style.test.ts`: define the desired unified material contract and guard against masks, gradients, or separate dropdown material values.
- Modify `app/globals.css`: share one material definition between navbar and dropdown and suppress the navbar's independent compositing surface while the dropdown is open.

### Task 1: Define the Unified Material Contract

**Files:**
- Modify: `tests/unit/site-header-style.test.ts:9-76`

- [ ] **Step 1: Replace the old separate-surface expectations with a failing regression test**

Update the shared-value assertions so dropdown-specific opacity, blur, and fade variables are no longer required. Replace the dropdown material assertions with the following contract:

```ts
it("uses one continuous material while the dropdown is open", () => {
  expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-blur\)\)\s*saturate\(0\.78\);/s);
  expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*background:\s*var\(--header-surface\);/s);
  expect(css).not.toMatch(/\.nav-dropdown-panel::before\s*{[^}]*(?:mask-image|-webkit-mask-image):/s);
  expect(css).not.toMatch(/\.nav-dropdown-panel::before\s*{[^}]*background:\s*linear-gradient/s);
  expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\),\s*\.site-header:has\(\.nav-dropdown:focus-within\)\s*{[^}]*background:\s*transparent;[^}]*backdrop-filter:\s*none;/s);
  expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\)::after,\s*\.site-header:has\(\.nav-dropdown:focus-within\)::after\s*{[^}]*opacity:\s*0;/s);
});
```

Keep the existing pointer-interaction and hero-transparency assertions. Remove the old assertion that forbids `:has()` and remove expectations for `--header-dropdown-blur`, `--header-dropdown-surface-opacity`, and `--header-material-fade-stop`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  node node_modules/vitest/vitest.mjs run tests/unit/site-header-style.test.ts
```

Expected: FAIL because the dropdown still uses separate blur/opacity variables and mask images, and the open-state navbar suppression rules do not exist.

- [ ] **Step 3: Commit the failing regression test**

```bash
git add tests/unit/site-header-style.test.ts
git commit -m "test: define unified navbar dropdown material"
```

### Task 2: Implement One Continuous Frosted Surface

**Files:**
- Modify: `app/globals.css:69-255`
- Test: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Remove dropdown-only material variables**

Delete these declarations from `.site-header`:

```css
--header-dropdown-blur: 58px;
--header-dropdown-surface-opacity: 0.82;
--header-material-fade-stop: 72%;
```

The dropdown will inherit the exact navbar values through `--header-surface` and `--header-blur`.

- [ ] **Step 2: Make the dropdown pseudo-element use the shared rectangular material**

Change `.nav-dropdown-panel::before` to:

```css
.nav-dropdown-panel::before {
  backdrop-filter: blur(var(--header-blur)) saturate(0.78);
  background: var(--header-surface);
  content: "";
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}
```

Do not add `mask-image`, `-webkit-mask-image`, gradients, shadows, or a separate opacity variable. The panel remains a fixed rectangle beginning at `top: 0`, so this material covers both navbar and dropdown space.

- [ ] **Step 3: Suppress the navbar's separate compositing surface during the open state**

Add the following rules after the scrolled header state and before dropdown layout rules:

```css
.site-header:has(.nav-dropdown:hover),
.site-header:has(.nav-dropdown:focus-within) {
  background: transparent;
  backdrop-filter: none;
}

.site-header:has(.nav-dropdown:hover)::after,
.site-header:has(.nav-dropdown:focus-within)::after {
  opacity: 0;
}
```

This ensures the full open rectangle is painted by exactly one backdrop-filter surface. Leave `.site-header-overlay:not(.site-header-scrolled) .nav-dropdown-panel::before { opacity: 0; }` intact so the unscrolled hero menu remains transparent.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  node node_modules/vitest/vitest.mjs run tests/unit/site-header-style.test.ts
```

Expected: PASS with all site-header style tests green.

- [ ] **Step 5: Commit the implementation**

```bash
git add app/globals.css
git commit -m "fix: unify navbar and dropdown material"
```

### Task 3: Verify Interaction, Production CSS, and Deployment

**Files:**
- Verify: `app/globals.css`
- Verify: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Verify the desktop dropdown visually**

Open `http://127.0.0.1:3001/shop` at a desktop viewport, hover **All products**, and confirm:

- one uniform frosted-white rectangle spans from viewport top to dropdown bottom;
- content behind navbar and dropdown has identical diffusion;
- no horizontal seam appears beneath the navbar;
- no fading, gradient, glow, or transparent band appears at the dropdown bottom;
- menu links remain clickable and the panel stays open while moving from the trigger to its links.

- [ ] **Step 2: Verify the hero exception visually**

Open `http://127.0.0.1:3001/` at the top of the page, hover **All products**, and confirm the hero navigation and dropdown remain transparent. Scroll past the hero threshold, open the dropdown again, and confirm the unified frosted rectangle appears.

- [ ] **Step 3: Run the full unit suite**

Run:

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  node node_modules/vitest/vitest.mjs run
```

Expected: all test files and tests PASS.

- [ ] **Step 4: Run the production build**

Run:

```bash
set -a
source /Users/khangngo/NewWeb/.env
set +a
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
  node node_modules/next/dist/bin/next build --webpack
```

Expected: optimized production build completes successfully with all routes generated.

- [ ] **Step 5: Push the verified implementation**

```bash
git push origin HEAD:main
```

Expected: GitHub `main` advances to the implementation commit and Vercel starts a production deployment.
