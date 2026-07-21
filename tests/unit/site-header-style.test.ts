import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("site header visual states", () => {
  it("keeps the hero navigation transparent until the scrolled glass state", () => {
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*background:\s*transparent;/s);
    expect(css).toMatch(/\.site-header-overlay\s*{[^}]*backdrop-filter:\s*blur\(0\);/s);
    expect(css).toMatch(/\.site-header-overlay\.site-header-scrolled\s*{[^}]*background:\s*rgba\(248,\s*249,\s*250,\s*0\.78\);/s);
    expect(css).toMatch(/\.site-header-overlay\.site-header-scrolled\s*{[^}]*backdrop-filter:\s*blur\(22px\)\s*saturate\(1\.12\);/s);
    expect(css).not.toMatch(/\.site-header:has\(\.nav-dropdown:hover\),\s*\.site-header:has\(\.nav-dropdown:focus-within\)/s);
  });
});
