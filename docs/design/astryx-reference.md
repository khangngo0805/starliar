# Astryx Reference For Starliar

Date learned: 2026-06-30

Sources:
- https://github.com/facebook/astryx
- https://astryx.atmeta.com/
- https://astryx.atmeta.com/blog/introducing-astryx

## What To Borrow

Astryx is a React design system from Meta. It is currently beta, built on React and StyleX, and focuses on accessible typed components, CSS-variable theming, composable internals, templates, and agent-readable tooling.

For Starliar, use Astryx as a design reference before adopting the package directly. Starliar is a fashion storefront with a visual brand direction inspired by Gentle Monster, so the homepage and campaign sections should stay editorial and cinematic. Astryx patterns are most useful for functional surfaces: cart, checkout, account, orders, search, admin pages, forms, lists, and repeated controls.

## Starliar Application Rules

1. Use consistent component roles.
   Buttons, links, inputs, panels, status rows, and list rows should have predictable dimensions and states across cart, account, checkout, and admin.

2. Prefer token-like CSS over one-off styling.
   Add shared variables or grouped selectors for spacing, border, foreground, muted text, panels, and hover states before adding isolated component colors.

3. Keep components composable.
   Build small structures such as `row`, `panel`, `actions`, `media`, and `copy` rather than single large blocks with many special cases.

4. Maintain brand control.
   Do not import a full Astryx theme into the public storefront without checking visual fit. Starliar should stay restrained, fashion-led, and image-forward.

5. Use Astryx-style density for utility pages.
   Cart, account, orders, admin, and checkout should feel organized and repeatable: compact rows, clear hierarchy, restrained borders, no oversized marketing-style cards.

6. Avoid package adoption until needed.
   Installing `@astryxdesign/core` should be a deliberate step after testing Next.js compatibility, bundle impact, theming integration, and visual match.

## Practical Checklist For Future UI Work

- Does the page have stable spacing at mobile and desktop?
- Are repeated rows aligned using a clear grid/flex contract?
- Are actions grouped consistently instead of floating around the page?
- Are text sizes appropriate for the context, not hero-scale inside utility panels?
- Are hover/active/focus states visible but soft?
- Can this styling be reused by account, cart, checkout, or admin?
- Does the UI still look like Starliar rather than a generic dashboard?

## When To Consider Installing Astryx

Install Astryx only if we need a larger admin or account surface with many accessible controls, such as data tables, menus, dialogs, form patterns, or template-driven dashboards. For the current storefront, keep using local components and borrow the design-system discipline rather than adding a beta dependency.
