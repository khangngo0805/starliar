# Unified Navbar Dropdown Design

## Goal

Make the storefront navbar and its open product dropdown read as one continuous frosted-white rectangular surface, matching the supplied Gentle Monster reference.

## Visual Behavior

- The closed navbar keeps its current frosted-white treatment on shop and other non-hero pages.
- Opening the product dropdown creates one uninterrupted material surface from the top of the viewport to the bottom edge of the dropdown.
- The navbar and dropdown must use the same white opacity, blur, and saturation values.
- There must be no visible seam, overlap, glow, gradient, mask, or fade between the navbar and dropdown.
- The bottom edge of the open dropdown ends cleanly as a straight horizontal boundary.
- Product imagery behind the entire open surface remains visibly diffused, not merely covered by opaque white.
- The existing transparent navigation behavior over the unscrolled homepage hero remains unchanged.

## Implementation Direction

Use one material layer for the open state. When the dropdown is active on a frosted navbar, the regular navbar material is suppressed and the dropdown's material layer covers the full combined navbar-and-menu rectangle. The dropdown content remains a transparent layout layer above that material.

The open-state selector may use CSS `:has()` because the supported production browsers already implement it and it avoids introducing React hover state. The hero exception remains explicitly scoped so opening the dropdown over the unscrolled hero does not add a frosted background.

## Testing

- Add a CSS regression test proving the open state disables the navbar's separate material.
- Assert the unified dropdown surface has no mask or gradient.
- Assert navbar and dropdown use the same material variables.
- Retain tests for transparent hero behavior, pointer interaction, reduced motion, and production CSS preservation.
- Verify the open dropdown visually at desktop width and run the complete unit suite and production build.
