# Frosted Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Match the approved opaque Gentle Monster-style navbar: a milky white surface that heavily diffuses page imagery without a glow, while preserving the transparent hero state.

**Architecture:** Keep the existing header state model and CSS-only material system. Tune the shared CSS custom properties and backdrop filters so the regular and scrolled headers use the same frosted material, the hero overlay remains transparent until scrolled, and the dropdown uses a slightly deeper version of the same material.

**Tech Stack:** Next.js 16, React, CSS backdrop filters, Vitest, in-app browser visual verification

---

### Task 1: Lock The Frosted Material Contract

**Files:**
- Modify: `tests/unit/site-header-style.test.ts`
- Test: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Change the shared material assertions to the approved values**

Update the shared material test to require:

```ts
expect(css).toMatch(/\.site-header\s*{[^}]*--header-surface-opacity:\s*0\.8;/s);
expect(css).toMatch(/\.site-header\s*{[^}]*--header-blur:\s*34px;/s);
expect(css).toMatch(/\.site-header\s*{[^}]*--header-diffusion-blur:\s*26px;/s);
expect(css).toMatch(/\.site-header\s*{[^}]*--header-dropdown-blur:\s*42px;/s);
```

Update filter assertions to require neutralized color saturation:

```ts
expect(css).toMatch(/\.site-header-overlay\.site-header-scrolled\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-blur\)\)\s*saturate\(0\.92\);/s);
expect(css).toMatch(/\.site-header::after\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-diffusion-blur\)\)\s*saturate\(0\.94\);/s);
expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-dropdown-blur\)\)\s*saturate\(0\.9\);/s);
```

Keep the existing negative assertions that forbid white gradients and glow layers.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npx vitest run tests/unit/site-header-style.test.ts
```

Expected: FAIL because the stylesheet still uses opacity `0.9`, blur `18px`, and increased saturation.

### Task 2: Implement The Milky Frosted Surface

**Files:**
- Modify: `app/globals.css:69-130`
- Test: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Tune the shared navbar material variables**

Use these values in `.site-header`:

```css
--header-blur: 34px;
--header-diffusion-blur: 26px;
--header-dropdown-blur: 42px;
--header-surface-opacity: 0.8;
```

- [ ] **Step 2: Neutralize color saturation in the frosted layers**

Use `saturate(0.92)` for the header and scrolled header, `saturate(0.94)` for the diffusion edge, and `saturate(0.9)` for the dropdown material. Apply matching values to both standard and `-webkit-` backdrop filter declarations.

- [ ] **Step 3: Preserve the state and glow constraints**

Keep `.site-header-overlay` fully transparent with `blur(0)` at the top of the hero. Keep `.site-header::after` and `.nav-dropdown-panel::before` backgrounds transparent so no white gradient or luminous strip is introduced.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npx vitest run tests/unit/site-header-style.test.ts
```

Expected: PASS.

### Task 3: Verify Real Rendering

**Files:**
- Verify: `app/globals.css`

- [ ] **Step 1: Verify desktop top and scrolled states**

Open `/shop` at `1440x900`, capture the top state, scroll approximately 500px, and capture the sticky state. Confirm the sticky surface is milky white, broad background shapes are softly diffused, and there is no glow below the header.

- [ ] **Step 2: Verify the dropdown material**

Hover or focus the All Products navigation item. Confirm the full-width dropdown uses a slightly deeper frost, links remain interactive, and the panel edge fades softly without a gradient glow.

- [ ] **Step 3: Verify mobile behavior**

Open `/shop` at `390x844`, capture the header at the top and after scrolling, and confirm controls fit without overlap while preserving the same material states.

- [ ] **Step 4: Run regression verification**

Run:

```bash
npm test -- --run
npm run build
git diff --check
```

Expected: all tests pass, the production build succeeds, and `git diff --check` prints no errors.

### Task 4: Publish The Refined Navbar

**Files:**
- Commit: `app/globals.css`
- Commit: `tests/unit/site-header-style.test.ts`

- [ ] **Step 1: Commit the tested implementation**

```bash
git add app/globals.css tests/unit/site-header-style.test.ts
git commit -m "fix: refine frosted navbar material"
```

- [ ] **Step 2: Push the verified commit to production**

```bash
git fetch origin main
git push origin HEAD:main
```

Expected: the remote `main` branch advances to the navbar refinement commit and triggers a Vercel deployment.
