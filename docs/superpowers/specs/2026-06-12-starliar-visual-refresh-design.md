# Starliar Visual Refresh Design

Date: 2026-06-12

## Goal

Refresh Starliar from a functional commerce demo into a more professional fashion storefront with a clear art direction: quiet luxury structure with dark cinematic streetwear attitude.

The refresh should improve first impression, product browsing polish, and brand consistency without changing the underlying commerce flows.

## Direction

Starliar should feel like a minimal luxury catalog interrupted by darker campaign moments.

- Primary mood: off-white, black, restrained gray, crisp spacing, editorial typography.
- Accent mood: dark campaign panels, cinematic contrast, cold streetwear language, subtle motion.
- The UI should feel precise and commercial, not decorative or marketing-heavy.
- Product readability remains more important than visual effects.

Reference intent:

- SSENSE: minimal product/editorial commerce structure.
- Jil Sander: clean luxury restraint, spacing, typography discipline.
- A-COLD-WALL and Rick Owens: darker industrial/streetwear attitude.

## Scope

Included:

- Home page visual refresh.
- Shared visual system updates in global styles.
- Header and navigation polish.
- Product card polish.
- Campaign section redesign.
- Product detail page polish for media, copy, variant picker, and purchase actions.
- Shop/catalog polish where shared components naturally apply.
- Responsive behavior for mobile and desktop.

Excluded:

- New checkout/payment behavior.
- Admin redesign.
- Database schema changes.
- Authentication changes.
- Adding a full design system package.
- Replacing all product photography with real assets.

## Home Page

The home page should become a complete storefront experience instead of a hero followed by a plain grid.

Structure:

1. Hero video with refined overlay, restrained headline, and two clear CTAs.
2. Editorial intro strip with short brand statement and collection signal.
3. Featured product section with a cleaner product grid and stronger section heading.
4. Dark campaign band with cinematic copy, contrast, and a campaign CTA.
5. Curated category or material notes section to add rhythm below the grid.

The first viewport should still make the brand obvious immediately, with a hint of the next section visible where possible.

## Header

The header should feel more like a fashion storefront:

- Reduce generic app feel.
- Keep navigation simple and scannable.
- Avoid exposing admin as a primary storefront nav item.
- Use better spacing, hover states, and contrast over the hero.
- Preserve search, account, and cart access.

## Product Cards

Product cards should look premium even when using placeholder assets.

Requirements:

- Stable image aspect ratio across cards.
- Cleaner product metadata hierarchy: category, name, price.
- Favorite button should feel integrated, not bolted on.
- Hover state should be subtle: image scale, contrast shift, or metadata reveal.
- Placeholder SVG products should sit in a styled editorial frame so they do not read as unfinished mockups.

## Campaign Section

The campaign section should carry the dark streetwear attitude.

Requirements:

- Dark full-width band.
- Strong typographic statement.
- Short supporting copy.
- Optional stat/detail chips such as season, release, or material.
- CTA back to shop or campaign anchor.

It should not become a generic hero card. It should feel like a lookbook break inside the shopping flow.

## Product Detail

Product detail pages should feel more premium and less default.

Requirements:

- Larger, more deliberate media area.
- Product copy should have clearer hierarchy and better spacing.
- Size picker should look like a refined control group.
- Buy now and Add to cart should read as a coherent purchase module.
- Favorite action should remain available without competing with purchase actions.

## Responsive Behavior

Desktop:

- Editorial spacing can be generous.
- Product detail can use a strong two-column layout.
- Product grid should feel dense enough for shopping but not cramped.

Mobile:

- Header must remain usable and not overlap content.
- CTAs should stack or wrap cleanly.
- Product cards must preserve readable names and prices.
- Hero copy must not cover important video content.

## Testing

Add or update integration coverage for:

- Home page key brand and CTA visibility on mobile.
- Product purchase actions remaining aligned.
- Product grid cards remaining visible and navigable.
- Search/cart flows should continue to work if affected by shared header changes.

Manual visual verification:

- Desktop home page.
- Mobile home page.
- Shop page.
- Product detail page.

## Acceptance Criteria

- The home page looks like a complete fashion storefront, not a demo page.
- The blend is visibly minimal luxury plus dark streetwear, not one-note dark mode.
- Existing commerce flows still work.
- Product cards and purchase controls remain aligned and responsive.
- The design uses available assets well and makes placeholders feel intentional.
