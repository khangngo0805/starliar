import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("shop hero presentation", () => {
  it("uses a left-aligned editorial heading instead of the oversized catalog title", () => {
    expect(css).toMatch(/\.shop-hero\s*{[^}]*max-width:\s*760px;/s);
    expect(css).toMatch(/\.shop-hero h1\s*{[^}]*font-family:\s*"Adelaide"/s);
    expect(css).toMatch(/\.shop-hero h1\s*{[^}]*font-size:\s*clamp\(42px,\s*5vw,\s*72px\);/s);
    expect(css).toMatch(/\.shop-hero h1\s*{[^}]*text-transform:\s*none;/s);
    expect(css).toMatch(/\.shop-breadcrumb,[\s\S]*\.shop-stock-summary\s*{[^}]*text-transform:\s*uppercase;/s);
  });
});
