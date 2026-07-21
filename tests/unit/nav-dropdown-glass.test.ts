import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("navigation dropdown glass panel", () => {
  it("keeps hover dropdown transparent while the hero navigation is unscrolled", () => {
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*top:\s*0;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*width:\s*100vw;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*min-height:\s*500px;/s);
    expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)\s+\.nav-dropdown-panel\s*{[^}]*background:\s*transparent;/s);
    expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)\s+\.nav-dropdown-panel\s*{[^}]*backdrop-filter:\s*none;/s);
    expect(css).toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)\s+\.nav-dropdown-panel\s*{[^}]*color:\s*white;/s);
  });
});
