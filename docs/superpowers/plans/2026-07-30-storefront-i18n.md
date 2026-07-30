# Storefront EN/VI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Make the complete customer-facing Starlier storefront consistently bilingual and replace the split language control with one full-width toggle button.

**Architecture:** Keep `LanguageProvider` as the only language state and dictionary owner. Add interpolation support for dynamic labels, expose one `toggleLanguage` action, and use `LocalizedText` as the server/client boundary for server-rendered pages. Admin routes and stored product data remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library, Playwright, CSS.

---

### Task 1: Language Core And Single-Button Toggle

**Files:**
- Modify: `components/storefront/language-provider.tsx`
- Modify: `components/storefront/localized-text.tsx`
- Modify: `components/storefront/site-header.tsx`
- Modify: `app/globals.css`
- Test: `tests/unit/language-provider.test.tsx`
- Test: `tests/unit/site-header.test.tsx`

- [ ] **Step 1: Write failing provider and header tests**

Add tests proving that interpolation works, one button renders both labels, clicking anywhere toggles once, the accessible label names the destination language, local storage persists the result, and `<html lang>` updates.

```tsx
expect(screen.getByRole("button", { name: "Switch to Tiếng Việt" })).toHaveTextContent("EN");
expect(screen.getByRole("button", { name: "Switch to Tiếng Việt" })).toHaveTextContent("VI");
fireEvent.click(screen.getByRole("button", { name: "Switch to Tiếng Việt" }));
expect(document.documentElement.lang).toBe("vi");
expect(localStorage.getItem("starliar-language")).toBe("vi");
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vitest run tests/unit/language-provider.test.tsx tests/unit/site-header.test.tsx
```

Expected: FAIL because `toggleLanguage`, interpolation, and the single language button do not exist.

- [ ] **Step 3: Implement the language core and button**

Change the context API to:

```ts
type TranslationValues = Record<string, string | number>;
type LanguageContextValue = {
  language: StorefrontLanguage;
  setLanguage: (language: StorefrontLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};
```

Render one `.language-switcher` button containing two spans and one persistent divider. Use `aria-label={language === "en" ? t("switchToVietnamese") : t("switchToEnglish")}` and call `toggleLanguage` from its single click handler.

- [ ] **Step 4: Make the control visually stable**

Use one pill border, a fixed two-column grid, an absolutely positioned center divider, and active/inactive label styles. Preserve dimensions in overlay, scrolled, desktop, and mobile header states.

- [ ] **Step 5: Run tests and verify GREEN**

Run the Task 1 test command and expect both files to pass.

### Task 2: Homepage, Shop, Search, And Product Pages

**Files:**
- Modify: `components/storefront/language-provider.tsx`
- Modify: `app/page.tsx`
- Modify: `components/storefront/discover-section.tsx`
- Modify: `components/storefront/product-grid.tsx`
- Modify: `components/storefront/shop-catalog.tsx`
- Modify: `components/storefront/search-dialog.tsx`
- Modify: `app/shop/[slug]/page.tsx`
- Modify: `components/commerce/variant-picker.tsx`
- Modify: `components/commerce/add-to-cart-button.tsx`
- Modify: `components/commerce/buy-now-button.tsx`
- Test: `tests/unit/storefront-i18n.test.tsx`
- Test: `tests/unit/shop-catalog.test.tsx`

- [ ] **Step 1: Write failing storefront translation tests**

Cover representative English and Vietnamese strings for `New arrival`, `Discover`, `Explore Bags`, category labels, `In stock`, search headings/empty state, product details, size, shipping, `Buy now`, and `Add to cart`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vitest run tests/unit/storefront-i18n.test.tsx tests/unit/shop-catalog.test.tsx
```

Expected: FAIL on the currently hard-coded storefront strings.

- [ ] **Step 3: Add dictionary keys and replace hard-coded labels**

Add typed keys such as:

```ts
newArrival: "New arrival",
discover: "Discover",
exploreCategory: "Explore {category}",
inStock: "In stock",
searchResults: "Search results",
productDetails: "Details",
addToCart: "Add to cart",
buyNow: "Buy now"
```

Provide natural Vietnamese equivalents and use `t()` in client components or `LocalizedText` in server components. Translate category display labels without changing database values.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 2 command and expect all tests to pass.

### Task 3: Cart, Checkout, Location, QR, And Payment Status

**Files:**
- Modify: `components/storefront/language-provider.tsx`
- Modify: `components/commerce/cart-view.tsx`
- Modify: `app/checkout/page.tsx`
- Modify: `components/commerce/checkout-form.tsx`
- Modify: `components/commerce/location-picker.tsx`
- Modify: `components/commerce/sepay-qr-panel.tsx`
- Modify: `components/commerce/order-status-panel.tsx`
- Modify: `app/checkout/result/page.tsx`
- Test: `tests/unit/cart-view.test.tsx`
- Test: `tests/unit/checkout-i18n.test.tsx`
- Test: `tests/unit/order-status-panel.test.tsx`

- [ ] **Step 1: Write failing commerce i18n tests**

Verify cart empty/summary states, checkout field labels and placeholders, map instructions, QR expiry copy, payment pending/success copy, and dynamic count/total templates in both languages.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vitest run tests/unit/cart-view.test.tsx tests/unit/checkout-i18n.test.tsx tests/unit/order-status-panel.test.tsx
```

Expected: FAIL because these flows currently mix hard-coded English and Vietnamese.

- [ ] **Step 3: Replace commerce copy with dictionary keys**

Translate visible headings, labels, placeholders, buttons, errors, success messages, and accessibility labels. Keep prices, bank account values, QR memo, order numbers, and customer-entered values unchanged.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 3 command and expect all tests to pass.

### Task 4: Authentication, Account, Favorites, And Orders

**Files:**
- Modify: `components/storefront/language-provider.tsx`
- Modify: `components/storefront/google-auth-button.tsx`
- Modify: `app/account/login/page.tsx`
- Modify: `app/account/signup/page.tsx`
- Modify: `app/account/page.tsx`
- Modify: `app/orders/page.tsx`
- Modify: `components/commerce/guest-order-lookup.tsx`
- Modify: `app/order/[orderNumber]/page.tsx`
- Test: `tests/unit/user-auth.test.ts`
- Test: `tests/unit/account-i18n.test.tsx`
- Test: `tests/unit/order-history-i18n.test.tsx`

- [ ] **Step 1: Write failing account and order translation tests**

Cover Google sign-in, login/signup labels and errors, account empty states, favorites, signed-in orders, guest lookup, order confirmation, items, shipping, and status labels.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vitest run tests/unit/user-auth.test.ts tests/unit/account-i18n.test.tsx tests/unit/order-history-i18n.test.tsx
```

Expected: FAIL on hard-coded account/order copy.

- [ ] **Step 3: Localize account and order surfaces**

Use dictionary keys for all customer-facing labels, placeholders, empty states, validation messages, and accessibility text. Leave admin login and admin routes untouched.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 4 command and expect all tests to pass.

### Task 5: Audit, Responsive Verification, And Deployment

**Files:**
- Modify: `tests/integration/home-responsive.spec.ts`
- Modify only if audit finds omissions: customer-facing files under `app/`, `components/storefront/`, and `components/commerce/`

- [ ] **Step 1: Audit hard-coded customer copy**

Run:

```bash
rg -n '>[[:space:]]*[A-Za-zÀ-ỹ][^<{]*<|placeholder=\"[^\"]+\"|aria-label=\"[^\"]+\"' app components/storefront components/commerce --glob '*.tsx'
```

Classify allowed literals (brand/product/payment data) and replace every remaining customer-facing literal with a translation key.

- [ ] **Step 2: Extend Playwright coverage**

Add a test that toggles the single language pill on mobile, checks representative homepage and shop strings, navigates between pages, and verifies language persistence.

- [ ] **Step 3: Run complete verification**

Run:

```bash
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/eslint .
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/vitest run
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/playwright test tests/integration/home-responsive.spec.ts
PATH=/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/next build
```

Expected: lint clean, all unit tests pass, Playwright passes, and the production build completes.

- [ ] **Step 4: Commit and push**

```bash
git add app components tests docs/superpowers/plans/2026-07-30-storefront-i18n.md
git commit -m "feat: complete storefront language experience"
git push origin HEAD:main
```

Expected: GitHub `main` receives the verified bilingual storefront and Vercel starts a production deployment.
