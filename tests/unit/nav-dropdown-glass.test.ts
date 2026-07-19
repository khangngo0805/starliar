import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("navigation dropdown glass panel", () => {
  it("uses a full-width frosted white sheet aligned from the top of the viewport", () => {
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*top:\s*0;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*width:\s*100vw;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*min-height:\s*500px;/s);
    expect(css).toMatch(/\.nav-dropdown-panel\s*{[^}]*backdrop-filter:\s*blur\(34px\)\s*saturate\(1\.08\);/s);
    expect(css).not.toMatch(/\.site-header-overlay:not\(\.site-header-scrolled\)\s+\.nav-dropdown-panel\s*{[^}]*background:\s*transparent;/s);
  });
});
