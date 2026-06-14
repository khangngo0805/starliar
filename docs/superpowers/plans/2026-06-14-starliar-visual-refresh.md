# Starliar Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Refresh Starliar into a minimal editorial storefront with dark cinematic streetwear campaign moments while preserving existing commerce behavior.

**Architecture:** Keep the existing Next.js app and component boundaries. Update storefront markup in the homepage and hero component, then restyle shared CSS selectors used by header, cards, shop, and product detail. Add Playwright assertions for visual contract points that can be tested deterministically.

**Tech Stack:** Next.js App Router, React Server/Client Components, plain CSS in `app/globals.css`, Playwright integration tests.

---

## File Structure

- Modify: `app/page.tsx` for the richer homepage sections.
- Modify: `components/storefront/hero-video.tsx` for editorial hero copy and CTA hierarchy.
- Modify: `components/storefront/site-header.tsx` to remove storefront-visible Admin navigation and tighten nav labels.
- Modify: `components/storefront/product-grid.tsx` to add editorial metadata hooks without changing product data contracts.
- Modify: `app/globals.css` for the visual refresh across header, hero, homepage sections, cards, shop, and product detail.
- Modify: `tests/integration/home-responsive.spec.ts` for regression coverage around homepage sections, product cards, and aligned purchase actions.

---

### Task 1: Add Visual Contract Tests

**Files:**
- Modify: `tests/integration/home-responsive.spec.ts`

- [ ] **Step 1: Add tests for homepage editorial sections and product card navigation**

Add these tests below the existing search test and above the purchase alignment test:

```ts
test("homepage presents editorial storefront sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "STARLIAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /First Signal/i })).toBeVisible();
  await expect(page.getByText(/Quiet luxury structure/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Latest silhouettes/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /After dark uniform/i })).toBeVisible();
});

test("featured product cards remain navigable", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /Silent Poplin Shirt/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/shop\/silent-poplin-shirt/);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test tests/integration/home-responsive.spec.ts -g "homepage presents editorial storefront sections|featured product cards remain navigable"
```

Expected: the homepage editorial test fails because the new editorial text and headings do not exist yet. The product navigation test may pass if the product is already featured; if it fails because the product is not in the featured grid, inspect `lib/commerce/catalog.ts` and choose an actually featured product in the test.

---

### Task 2: Refresh Homepage and Hero Markup

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/storefront/hero-video.tsx`
- Modify: `components/storefront/site-header.tsx`
- Modify: `components/storefront/product-grid.tsx`

- [ ] **Step 1: Update `components/storefront/hero-video.tsx`**

Replace the hero content block with this editorial copy:

```tsx
<div className="hero-video-content">
  <p className="hero-eyebrow">Starliar / 2026 Collection</p>
  <h1 className="hero-kicker">First Signal</h1>
  <p className="hero-summary">
    Quiet luxury structure cut with dark streetwear attitude.
  </p>
  <div className="hero-actions">
    <Link className="pill-button pill-button-filled" href="/shop">
      Shop the drop
    </Link>
    <Link className="pill-button" href="#campaign">
      View campaign
    </Link>
  </div>
</div>
```

- [ ] **Step 2: Update `components/storefront/site-header.tsx`**

Remove the storefront-visible admin link from primary navigation:

```tsx
<Link href="/#campaign">Campaign</Link>
```

The nav should keep Shop, Campaign, Search, Account, and Cart.

- [ ] **Step 3: Update `components/storefront/product-grid.tsx`**

Change the metadata block to include stable class hooks:

```tsx
<div className="product-card-meta">
  <div>
    <small>{product.category}</small>
    <span className="product-card-name">{product.name}</span>
  </div>
  <span className="product-card-price">{formatVnd(product.priceVnd)}</span>
</div>
```

- [ ] **Step 4: Update `app/page.tsx`**

Replace the existing two homepage sections after `HeroVideo` with:

```tsx
<section className="editorial-intro" aria-label="Starliar direction">
  <p>Quiet luxury structure. Dark streetwear attitude. Built for the first signal after midnight.</p>
  <div>
    <span>01</span>
    <span>Cold silhouettes</span>
  </div>
</section>
<section className="home-section featured-section">
  <div className="section-heading-row">
    <div>
      <p className="section-kicker">New arrival</p>
      <h2>Latest silhouettes</h2>
    </div>
    <Link className="text-link" href="/shop">
      View all
    </Link>
  </div>
  <ProductGrid products={products} />
</section>
<section className="campaign-section" id="campaign">
  <div className="campaign-copy">
    <p className="section-kicker">Campaign 2026</p>
    <h2>After dark uniform</h2>
    <p>Monochrome layers, quiet hardware, and silhouettes made for low light.</p>
  </div>
  <div className="campaign-details" aria-label="Campaign details">
    <span>Night release</span>
    <span>Structured cotton</span>
    <span>Limited run</span>
  </div>
  <Link className="campaign-link" href="/shop">
    Enter the drop
  </Link>
</section>
<section className="material-notes" aria-label="Collection notes">
  <article>
    <span>Material</span>
    <p>Poplin, mesh, and compact fleece balanced for sharp everyday wear.</p>
  </article>
  <article>
    <span>Palette</span>
    <p>Paper, ink, frost gray, and small cold-blue signals.</p>
  </article>
  <article>
    <span>Fit</span>
    <p>Relaxed volume with clean shoulders, cropped layers, and utility lines.</p>
  </article>
</section>
```

---

### Task 3: Apply the Visual System in CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update root tokens and base rendering**

Set the palette and body type:

```css
:root {
  --starliar-ink: #080808;
  --starliar-paper: #f3f1ec;
  --starliar-panel: #ebe7df;
  --starliar-muted: #6c6a63;
  --starliar-line: #d4cec3;
  --starliar-accent: #b8dce5;
}
```

Keep `letter-spacing: 0` on `body`.

- [ ] **Step 2: Restyle header and hero**

Update `.site-header`, `.site-logo`, `.hero-video`, `.hero-video-scrim`, `.hero-video-content`, `.hero-eyebrow`, `.hero-kicker`, `.hero-summary`, `.pill-button`, `.pill-button-filled`, and `.hero-progress` so:

```css
.site-header {
  padding: 24px clamp(18px, 4vw, 54px);
}

.site-logo {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(30px, 4vw, 58px);
  letter-spacing: 0;
}

.hero-video {
  min-height: 96svh;
}

.hero-video-scrim {
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.12) 36%, rgba(0, 0, 0, 0.58)),
    radial-gradient(circle at 50% 78%, rgba(255, 255, 255, 0.14), transparent 38%);
}

.hero-video-content {
  align-items: flex-start;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 72px) 118px;
  text-align: left;
  width: 100%;
}

.hero-eyebrow,
.section-kicker {
  color: rgba(244, 245, 247, 0.72);
  font-size: 12px;
  margin: 0 0 14px;
  text-transform: uppercase;
}

.hero-kicker {
  font-size: clamp(52px, 9vw, 142px);
  line-height: 0.86;
  margin: 0;
  max-width: 760px;
}

.hero-summary {
  color: rgba(244, 245, 247, 0.78);
  font-size: clamp(16px, 1.4vw, 21px);
  line-height: 1.5;
  margin: 24px 0 0;
  max-width: 500px;
}
```

- [ ] **Step 3: Add homepage editorial sections**

Add styles for `.editorial-intro`, `.section-heading-row`, `.featured-section`, `.campaign-copy`, `.campaign-details`, `.campaign-link`, and `.material-notes` so sections are full-width, unframed, responsive, and avoid card-in-card layout.

- [ ] **Step 4: Polish product cards**

Update `.product-grid`, `.product-card-media`, `.product-card-meta`, `.product-card-name`, `.product-card-price`, `.favorite-button-compact`, and hover styles so cards have stable 4:5 media, subtle borders, integrated favorite button, and readable metadata.

- [ ] **Step 5: Polish shop and product detail shared selectors**

Update `.shop-hero`, `.shop-toolbar`, `.category-chip`, `.product-detail`, `.product-detail-copy`, `.product-hero-media`, `.variant-picker`, `.size-options button`, `.product-actions`, `.buy-now-button`, and `.primary-button` related rules to match the new palette and purchase module.

- [ ] **Step 6: Update responsive media queries**

Ensure the existing mobile media queries keep:

```css
.site-header {
  grid-template-columns: 1fr;
}

.product-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-detail {
  grid-template-columns: 1fr;
}
```

and add mobile rules for the new homepage sections so CTAs and material notes stack cleanly.

---

### Task 4: Verify and Iterate Visually

**Files:**
- Modify only if verification exposes layout defects: `app/globals.css`, `app/page.tsx`, component files touched above.

- [ ] **Step 1: Run the integration spec**

Run:

```bash
/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test tests/integration/home-responsive.spec.ts
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run:

```bash
/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js app components tests/integration/home-responsive.spec.ts
```

Expected: exit code 0.

- [ ] **Step 3: Use the in-app browser for desktop visual QA**

Open `http://127.0.0.1:3000/`, reload, and check:

- Header does not overlap unreadably on hero.
- First viewport clearly signals Starliar.
- Editorial intro appears below hero.
- Product cards align in a professional grid.
- Campaign band reads as dark streetwear, not generic dark mode.

- [ ] **Step 4: Use the in-app browser for product detail visual QA**

Open `http://127.0.0.1:3000/shop/silent-poplin-shirt`, reload, and check:

- Media and copy form a polished product page.
- Size buttons are aligned and usable.
- Buy now and Add to cart remain aligned.
- Favorite button does not compete with purchase actions.

- [ ] **Step 5: Commit implementation**

Stage only intended files:

```bash
git add app/page.tsx app/globals.css components/storefront/hero-video.tsx components/storefront/site-header.tsx components/storefront/product-grid.tsx tests/integration/home-responsive.spec.ts docs/superpowers/plans/2026-06-14-starliar-visual-refresh.md
git commit -m "feat: refresh starliar storefront visuals"
```

---

## Verification

- Playwright: `home-responsive.spec.ts` passes.
- ESLint: `app`, `components`, and touched integration spec pass.
- Browser QA: desktop home, mobile home, shop/product detail checked for visible overlap and layout polish.

## Next Skill

Use `$superpower-executing-plans` for inline execution in this session.
