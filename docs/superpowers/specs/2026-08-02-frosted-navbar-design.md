# Frosted Navbar Design

## Goal

Match the opaque frosted-glass navbar in the supplied Gentle Monster reference. The surface should read as soft white glass: page imagery remains visible only as broad, diffused color fields, while navigation text and icons stay crisp. The material must not create a white glow below the header.

## States

- Hero top: keep the navbar fully transparent, with no blur or white surface.
- Sticky/scrolled: use a moderately opaque white surface (target range 0.78-0.82) with a strong backdrop blur (about 34px) and restrained saturation.
- Dropdown: use the same visual material with a deeper blur, preserving the existing full-width interaction and fade mask.

## Constraints

- Do not add a white gradient or box shadow below the navbar.
- Keep the existing header height, spacing, logo, language control, icons, transitions, and responsive behavior.
- Preserve readable black navigation controls over light and dark product imagery.
- Respect `prefers-reduced-motion`.

## Verification

- Unit CSS assertions cover the chosen surface opacity, blur, transparent hero state, and absence of glow gradients.
- Desktop screenshots verify the top, scrolled, and dropdown states on `/shop`.
- A mobile screenshot verifies that the frosted surface remains readable without overlap.

