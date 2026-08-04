import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transform } from "lightningcss";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function splitTopLevelCssList(value: string) {
  const entries: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (value[index] === "," && depth === 0) {
      entries.push(value.slice(start, index));
      start = index + 1;
    }
  }

  entries.push(value.slice(start));
  return entries;
}

function collectTransitionDeclarationValues(stylesheet: string) {
  return Array.from(
    stylesheet.matchAll(
      /(?:^|[;{}])\s*(?:transition|transition-property)\s*:\s*([^;{}]+)/gi
    ),
    ([, value]) => value.trim().toLowerCase()
  );
}

describe("site header visual states", () => {
  it("splits transition lists only at top-level commas", () => {
    expect(splitTopLevelCssList(
      "background 280ms cubic-bezier(0.22, 1, 0.36, 1), border-color 280ms var(--starliar-ease)"
    )).toEqual([
      "background 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      " border-color 280ms var(--starliar-ease)"
    ]);
  });

  it("defines the shared navbar material values", () => {
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-white-rgb:\s*255,\s*255,\s*255;/s);
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-surface-opacity:\s*0\.74;/s);
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-blur:\s*52px;/s);
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-diffusion-blur:\s*34px;/s);
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-diffusion-height:\s*28px;/s);
    expect(css).toMatch(/\.site-header\s*{[^}]*--header-surface:\s*rgba\(var\(--header-white-rgb\),\s*var\(--header-surface-opacity\)\);/s);
  });

  it("preserves the standard backdrop filter in production CSS", () => {
    const compiledCss = transform({
      code: Buffer.from(css),
      filename: "globals.css",
      minify: true
    }).code.toString();

    expect(compiledCss).toMatch(/\.site-header\{[^}]*backdrop-filter:blur\(/);
    expect(css).not.toContain("-webkit-backdrop-filter:");
  });

  it("keeps the hero navigation transparent until the scrolled glass state", () => {
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*background:\s*transparent;/s);
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*backdrop-filter:\s*blur\(0\);/s);
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*border-bottom-color:\s*transparent;/s);
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*box-shadow:\s*none;/s);
    expect(css).toMatch(/\.site-header-overlay\.site-header-scrolled\s*{[^}]*background:\s*var\(--header-surface\);/s);
    expect(css).toMatch(/\.site-header-overlay\.site-header-scrolled\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-blur\)\)\s*saturate\(0\.78\);/s);
    expect(css).not.toMatch(/background:\s*rgba\(248,\s*249,\s*250,\s*0\.78\);/s);
    expect(css).not.toMatch(/backdrop-filter:\s*blur\(22px\)\s*saturate\(1\.12\);/s);
  });

  it("animates normal scroll material without animating the dropdown handoff", () => {
    const siteHeaderRule = css.match(/\.site-header\s*{([^}]*)}/s)?.[1] ?? "";
    const transition = siteHeaderRule.match(/transition:\s*([^;]+);/s)?.[1] ?? "";
    const transitionEntries = splitTopLevelCssList(transition)
      .map((entry) => entry.trim().replace(/\s+/g, " "));
    const allowedTransitions = [
      "background 280ms var(--starliar-ease)",
      "border-color 280ms var(--starliar-ease)",
      "color 280ms var(--starliar-ease)",
      "box-shadow 280ms var(--starliar-ease)"
    ];

    expect(transitionEntries).toHaveLength(4);
    expect(transitionEntries).toEqual(expect.arrayContaining(allowedTransitions));

    for (const value of collectTransitionDeclarationValues(css)) {
      expect(value).not.toMatch(
        /(?:^|[^-_a-zA-Z0-9])(?:all|backdrop-filter|-webkit-backdrop-filter)(?=$|[^-_a-zA-Z0-9])/
      );
    }

    expect(css).toMatch(/\.site-header::after\s*{[^}]*transition:\s*opacity\s+280ms\s+var\(--starliar-ease\);/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\),\s*\.site-header:has\(\.nav-dropdown:focus-within\)\s*{[^}]*transition:\s*none;/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\)::after,\s*\.site-header:has\(\.nav-dropdown:focus-within\)::after\s*{[^}]*transition:\s*none;/s);
  });

  it("diffuses page content without adding a white glow", () => {
    expect(css).toMatch(/\.site-header::after\s*{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-diffusion-blur\)\)\s*saturate\(0\.82\);/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*background:\s*transparent;/s);
    expect(css).not.toMatch(/\.site-header::after\s*{[^}]*background:\s*linear-gradient/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*height:\s*var\(--header-diffusion-height\);/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*left:\s*0;[^}]*position:\s*absolute;[^}]*right:\s*0;[^}]*top:\s*100%;/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*mask-image:\s*linear-gradient\(to bottom, black, transparent\);/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*-webkit-mask-image:\s*linear-gradient\(to bottom, black, transparent\);/s);
    expect(css).toMatch(/\.site-header::after\s*{[^}]*z-index:\s*-1;/s);
    expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)::after\s*{[^}]*opacity:\s*0;/s);
  });

  it("keeps dropdown material behind independently interactive links", () => {
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*background:\s*transparent;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*backdrop-filter:\s*none;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*isolation:\s*isolate;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\) \.nav-dropdown-panel::before\s*{[^}]*opacity:\s*0;/s);
    expect(css).toMatch(/\.nav-dropdown-panel a\s*{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.nav-dropdown:hover \.nav-dropdown-panel a,\s*\.nav-dropdown:focus-within \.nav-dropdown-panel a\s*{[^}]*pointer-events:\s*auto;/s);
    expect(css).toMatch(/\.nav-dropdown::after\s*{[^}]*height:\s*64px;/s);
    expect(css).toMatch(/\.nav-dropdown::after\s*{[^}]*pointer-events:\s*none;/s);
    expect(css).toMatch(/\.nav-dropdown::after\s*{[^}]*position:\s*absolute;/s);
    expect(css).toMatch(/\.nav-dropdown::after\s*{[^}]*width:\s*100%;/s);
    expect(css).toMatch(/\.nav-dropdown:hover::after,\s*\.nav-dropdown:focus-within::after\s*{[^}]*pointer-events:\s*auto;/s);
  });

  it("uses one continuous material while the dropdown is open", () => {
    expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*backdrop-filter:\s*blur\(var\(--header-blur\)\)\s*saturate\(0\.78\);/s);
    expect(css).toMatch(/\.nav-dropdown-panel::before\s*{[^}]*background:\s*var\(--header-surface\);/s);
    expect(css).not.toMatch(/\.nav-dropdown-panel::before\s*{[^}]*(?:mask-image|-webkit-mask-image):/s);
    expect(css).not.toMatch(/\.nav-dropdown-panel::before\s*{[^}]*background:\s*linear-gradient/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\),\s*\.site-header:has\(\.nav-dropdown:focus-within\)\s*{[^}]*background:\s*transparent;[^}]*backdrop-filter:\s*none;/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\)::after,\s*\.site-header:has\(\.nav-dropdown:focus-within\)::after\s*{[^}]*opacity:\s*0;/s);
  });

  it("removes diffusion motion when reduced motion is requested", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{\s*\.site-header,\s*\.site-header::after,\s*\.nav-dropdown-panel,\s*\.nav-dropdown-panel::before\s*{[^}]*transition:\s*none;/s);
  });

  it("keeps one centered divider visible in every language state", () => {
    expect(css).toMatch(/\.language-switcher\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\);/s);
    expect(css).toMatch(/\.language-switcher::after\s*{[^}]*background:\s*currentColor;/s);
    expect(css).not.toMatch(/\.language-option\s*\+\s*\.language-option\s*{/s);
  });
});
