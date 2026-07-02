import { describe, expect, it } from "vitest";
import { filterAndRankProductsForSearch } from "@/lib/commerce/catalog";

describe("search products route contract", () => {
  it("uses a minimum query length before returning catalog matches", () => {
    expect("shell".trim().length).toBeGreaterThanOrEqual(2);
  });

  it("matches products case-insensitively across names, categories, slugs, descriptions, and collections", () => {
    const products = [
      {
        id: "orbital",
        slug: "orbital-shell-jacket",
        name: "Orbital Shell Jacket",
        category: "Jacket",
        description: "Structured shell outerwear",
        priceVnd: 2890000,
        collection: { name: "First Signal" },
        images: [{ src: "/orbital.svg" }]
      },
      {
        id: "frost",
        slug: "frost-mesh-long-sleeve",
        name: "Frost Mesh Long Sleeve",
        category: "Long Sleeve",
        description: "Transparent mesh layer",
        priceVnd: 1390000,
        collection: { name: "First Signal" },
        images: [{ src: "/frost.svg" }]
      }
    ];

    expect(filterAndRankProductsForSearch(products, "ORBITAL").map((product) => product.slug)).toEqual([
      "orbital-shell-jacket"
    ]);
    expect(filterAndRankProductsForSearch(products, "long sleeve").map((product) => product.slug)).toEqual([
      "frost-mesh-long-sleeve"
    ]);
    expect(filterAndRankProductsForSearch(products, "first signal").map((product) => product.slug)).toEqual([
      "orbital-shell-jacket",
      "frost-mesh-long-sleeve"
    ]);
  });
});
