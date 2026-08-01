# Soft Navbar Blur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Match the supplied soft white Gentle Monster navbar blur while preserving the transparent hero state and existing navigation behavior.

**Architecture:** Keep the existing header markup and state logic unchanged. Add reusable CSS custom properties to `.site-header`, render the soft lower diffusion with `.site-header::after`, and reuse the same white/blur language in the shop dropdown. Lock the visual states with the existing CSS-source unit test, then verify the rendered result in the in-app browser.

**Tech Stack:** Next.js 16, React 19, CSS, Vitest, Playwright through the in-app browser

---

### Task 1: Lock the soft diffusion contract

**Files:**
- Modify: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Write the failing style assertions**

Add a test requiring a pointer-transparent header pseudo-element with a white-to-transparent mask and requiring the unscrolled hero state to hide it:

```ts
it("diffuses the white navbar softly into page content", () => {
  expect(css).toMatch(/\.site-header::after\s*{[^}]*pointer-events:\s*none;/s);
  expect(css).toMatch(/\.site-header::after\s*{[^}]*backdrop-filter:\s*blur\(18px\)/s);
  expect(css).toMatch(/\.site-header::after\s*{[^}]*mask-image:\s*linear-gradient\(to bottom, black, transparent\);/s);
  expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)::after\s*{[^}]*opacity:\s*0;/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run tests/unit/site-header-style.test.ts
```

Expected: FAIL because `.site-header::after` does not exist.

### Task 2: Implement the reference blur

**Files:**
- Modify: `app/globals.css:69-260`
- Test: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Add shared material properties and the diffusion layer**

Add these properties to `.site-header` and remove its visible lower border:

```css
--header-surface: rgba(255, 255, 255, 0.9);
--header-blur: 18px;
--header-diffusion-height: 76px;
background: var(--header-surface);
backdrop-filter: blur(var(--header-blur)) saturate(1.04);
border-bottom-color: transparent;
```

Add the diffusion layer:

```css
.site-header::after {
  backdrop-filter: blur(18px) saturate(1.02);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0));
  content: "";
  height: var(--header-diffusion-height);
  left: 0;
  mask-image: linear-gradient(to bottom, black, transparent);
  opacity: 1;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 100%;
  transition: opacity 280ms var(--starliar-ease);
  -webkit-backdrop-filter: blur(18px) saturate(1.02);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent);
  z-index: -1;
}
```

- [ ] **Step 2: Preserve transparent hero behavior**

Hide the material edge until the hero threshold is crossed:

```css
.site-header-overlay:not(.site-header-scrolled)::after {
  opacity: 0;
}
```

Keep `.site-header-overlay` transparent, and make `.site-header-overlay.site-header-scrolled` use the same `var(--header-surface)` and `var(--header-blur)` values as standard pages.

- [ ] **Step 3: Align the dropdown material**

Change the white/scrolled dropdown gradient to start from the shared surface and fade to transparent at its lower edge. Keep the unscrolled hero dropdown transparent and keep `pointer-events` behavior unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run tests/unit/site-header-style.test.ts
```

Expected: all tests in `site-header-style.test.ts` pass.

### Task 3: Visual and regression verification

**Files:**
- Verify: `app/globals.css`
- Verify: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Check desktop and mobile visually**

Use the in-app browser on `/`, `/shop`, and an open shop dropdown. Verify:

- the homepage navbar is transparent over the unscrolled hero;
- after scrolling, the white surface diffuses softly with no hard edge;
- the shop navbar matches the reference white tone;
- the dropdown lower edge fades softly and links remain clickable;
- the mobile navbar does not overflow or cover content incoherently.

- [ ] **Step 2: Run lint and unit tests**

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/eslint app components tests
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run
```

Expected: both commands exit 0.

- [ ] **Step 3: Run the production build**

```bash
PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/next build
```

Expected: build exits 0 and all routes compile.

- [ ] **Step 4: Commit and push**

```bash
git add app/globals.css tests/unit/site-header-style.test.ts docs/superpowers/plans/2026-08-02-soft-navbar-blur.md
git commit -m "style: soften navbar blur"
git push origin HEAD:main
```
