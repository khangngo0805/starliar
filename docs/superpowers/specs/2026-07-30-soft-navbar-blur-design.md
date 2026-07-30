# Soft Navbar Blur Design

## Goal

Match the supplied Gentle Monster reference: a white navigation surface that
feels nearly solid at the top, then diffuses softly into the page below without
a hard glass edge.

## Visual States

### Standard pages

- Keep the existing navbar height, spacing, typography, and controls.
- Use a near-white translucent surface aligned with the storefront white.
- Apply moderate backdrop blur to the navbar itself.
- Add a short, non-interactive diffusion layer below the navbar. It fades from
  the navbar white to transparent while its blur strength is visually softened
  by the fade.
- Do not add a visible border, dark shadow, gray band, or rounded container.

### Hero before scrolling

- Preserve the current transparent navbar over the hero.
- Do not show the white diffusion layer while the hero navbar is transparent.

### Hero after scrolling

- Transition to the same near-white surface and diffusion treatment used on
  standard pages.
- Keep the transition smooth and avoid a sudden white block.

### Shop dropdown

- When opened on a white/scrolled navbar, use the same white tone and blur
  language as the navbar.
- The panel may extend vertically, but its lower edge must fade softly instead
  of ending in a rectangular translucent band.
- When opened over the unscrolled hero, preserve the existing transparent
  treatment.

## Implementation

- Build the diffusion edge with a header pseudo-element so no extra markup or
  pointer-event surface is introduced.
- Reuse CSS custom properties for the white tone, opacity, blur, and fade
  distance across the header and dropdown.
- Respect `prefers-reduced-motion` through the existing motion rules.
- Keep navigation behavior and responsive layout unchanged.

## Verification

- Extend the header style unit test to require the diffusion layer and ensure
  it is disabled on the transparent hero state.
- Check desktop and mobile in the in-app browser on both the homepage and shop.
- Verify the dropdown remains clickable and the diffusion layer never captures
  pointer events.
- Run ESLint, the focused header test, and the production build before pushing.
