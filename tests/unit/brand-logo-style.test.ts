import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("brand logo typography", () => {
  it("uses a condensed bold logo font stack for Starliar marks", () => {
    expect(css).toContain("--starliar-logo-font");
    expect(css).toMatch(/--starliar-logo-font:\s*Impact,\s*Haettenschweiler,/);
    expect(css).toMatch(/\.site-logo\s*{[^}]*font-family:\s*var\(--starliar-logo-font\)/s);
    expect(css).toMatch(/\.site-logo\s*{[^}]*font-weight:\s*900/s);
    expect(css).toMatch(/\.search-overlay-logo\s*{[^}]*font-family:\s*var\(--starliar-logo-font\)/s);
  });
});
