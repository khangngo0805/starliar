import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transform } from "lightningcss";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

const transitionProperties = new Set(["transition", "transition-property"]);
const disallowedTransitionTargets = new Set(["all", "backdrop-filter"]);
const vendorPropertyPrefixes = [
  ["-webkit-", "webkit"],
  ["-moz-", "moz"],
  ["-ms-", "ms"],
  ["-o-", "o"]
] as const;

function visitStyleRules(stylesheet: string) {
  const rules: Array<{ selectors: unknown[]; declarations: unknown[] }> = [];

  transform({
    code: Buffer.from(stylesheet),
    filename: "site-header-fixture.css",
    visitor: {
      Rule(rule) {
        if (rule.type !== "style") return;
        rules.push({
          selectors: rule.value.selectors,
          declarations: [
            ...rule.value.declarations.declarations,
            ...rule.value.declarations.importantDeclarations
          ]
        });
      }
    }
  });

  return rules;
}

function getSemanticProperty(declaration: any) {
  if (declaration.property === "unparsed") {
    return {
      name: declaration.value.propertyId.property,
      vendorPrefix: declaration.value.propertyId.vendor_prefix ?? [],
      value: declaration.value.value
    };
  }

  if (declaration.property === "custom") {
    return {
      name: declaration.value.name,
      vendorPrefix: [],
      value: declaration.value.value
    };
  }

  return {
    name: declaration.property,
    vendorPrefix: declaration.vendorPrefix ?? [],
    value: declaration.value
  };
}

function collectTransitionDeclarations(stylesheet: string) {
  return visitStyleRules(stylesheet).flatMap((rule) =>
    rule.declarations.flatMap((declaration) => {
      const semanticProperty = getSemanticProperty(declaration);
      if (!transitionProperties.has(semanticProperty.name)) return [];

      return [{
        name: semanticProperty.name,
        vendorPrefix: semanticProperty.vendorPrefix,
        value: semanticProperty.value
      }];
    })
  );
}

function splitTokenList(tokens: any[]) {
  const entries: any[][] = [[]];

  for (const token of tokens) {
    if (token.type === "token" && token.value.type === "comma") {
      entries.push([]);
    } else {
      entries.at(-1)?.push(token);
    }
  }

  return entries;
}

function getTransitionTargets(declaration: any) {
  const transitionTarget = (property: any, entryVendorPrefix: string[] = []) => {
    const rawName = (typeof property === "string" ? property : property.property).toLowerCase();
    const astVendorPrefix = entryVendorPrefix.length > 0
      ? entryVendorPrefix
      : typeof property === "string"
        ? []
        : property.vendor_prefix ?? [];
    const fallbackVendorPrefix = vendorPropertyPrefixes.find(([prefix]) => rawName.startsWith(prefix));

    return {
      name: fallbackVendorPrefix ? rawName.slice(fallbackVendorPrefix[0].length) : rawName,
      vendorPrefix: astVendorPrefix.length > 0
        ? astVendorPrefix
        : fallbackVendorPrefix
          ? [fallbackVendorPrefix[1]]
          : []
    };
  };

  if (declaration.name === "transition") {
    if (!Array.isArray(declaration.value)) return [];

    if (declaration.value.every((entry: any) => entry.property)) {
      return declaration.value.flatMap((entry: any) => {
        const target = transitionTarget(entry.property, entry.vendor_prefix ?? []);
        return target.name === "none" ? [] : [target];
      });
    }

    return splitTokenList(declaration.value).flatMap((entry) => {
      const propertyToken = entry.find(
        (token) => token.type === "token" && token.value.type === "ident"
      );
      return propertyToken
        ? [{ name: propertyToken.value.value.toLowerCase(), vendorPrefix: [] }]
        : [];
    });
  }

  if (Array.isArray(declaration.value)) {
    if (declaration.value.every((entry: any) => entry.property)) {
      return declaration.value.map((entry: any) =>
        transitionTarget(entry.property, entry.vendor_prefix ?? [])
      );
    }

    return splitTokenList(declaration.value).flatMap((entry) => {
      const propertyToken = entry.find(
        (token) => token.type === "token" && token.value.type === "ident"
      );
      return propertyToken
        ? [{ name: propertyToken.value.value.toLowerCase(), vendorPrefix: [] }]
        : [];
    });
  }

  return [];
}

function isSingleClassSelector(selector: any[], className: string) {
  return selector.length === 1 && selector[0]?.type === "class" && selector[0].name === className;
}

function getSiteHeaderTransitions(stylesheet: string) {
  const siteHeaderRule = visitStyleRules(stylesheet).find((rule) =>
    rule.selectors.some((selector: any[]) => isSingleClassSelector(selector, "site-header"))
  );

  return siteHeaderRule
    ? siteHeaderRule.declarations
        .map(getSemanticProperty)
        .filter((declaration) => transitionProperties.has(declaration.name))
        .flatMap(getTransitionTargets)
        .map((target) => target.name)
    : [];
}

function assertNoDisallowedTransitions(stylesheet: string) {
  for (const declaration of collectTransitionDeclarations(stylesheet)) {
    expect(declaration.vendorPrefix).toEqual([]);
    for (const target of getTransitionTargets(declaration)) {
      expect(target.vendorPrefix).toEqual([]);
      for (const disallowedTarget of disallowedTransitionTargets) {
        expect(target.name).not.toBe(disallowedTarget);
      }
    }
  }
}

describe("site header visual states", () => {
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
    expect(getSiteHeaderTransitions(css)).toEqual([
      "background",
      "border-color",
      "color",
      "box-shadow"
    ]);
    assertNoDisallowedTransitions(css);

    expect(css).toMatch(/\.site-header::after\s*{[^}]*transition:\s*opacity\s+280ms\s+var\(--starliar-ease\);/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\),\s*\.site-header:has\(\.nav-dropdown:focus-within\)\s*{[^}]*transition:\s*none;/s);
    expect(css).toMatch(/\.site-header:has\(\.nav-dropdown:hover\)::after,\s*\.site-header:has\(\.nav-dropdown:focus-within\)::after\s*{[^}]*transition:\s*none;/s);
  });

  it("inspects escaped transition identifiers and ignores custom properties semantically", () => {
    expect(() => assertNoDisallowedTransitions(`
      .fixture {
        --transition: backdrop-filter;
        transition: opacity 1ms;
        transition-property: \\61 ll;
      }
    `)).toThrow();

    expect(() => assertNoDisallowedTransitions(`
      .fixture {
        --transition: all;
        transition: opacity 1ms;
        transition-property: transform;
      }
    `)).not.toThrow();

    expect(() => assertNoDisallowedTransitions(`
      .fixture {
        -webkit-transition: backdrop-filter 1ms;
        transition-property: -webkit-backdrop-filter;
      }
    `)).toThrow();
  });

  it("rejects vendor-prefixed transition targets", () => {
    const fixture = `
      .fixture {
        transition-property: -webkit-transform, -moz-opacity;
      }
    `;
    const declarations = collectTransitionDeclarations(fixture);

    expect(getTransitionTargets(declarations[0])).toEqual([
      { name: "transform", vendorPrefix: ["webkit"] },
      { name: "opacity", vendorPrefix: ["moz"] }
    ]);
    expect(() => assertNoDisallowedTransitions(fixture)).toThrow();
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
