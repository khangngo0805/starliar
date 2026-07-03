import { describe, expect, it } from "vitest";
import { getProductAvailability, normalizeProductMediaInput } from "@/lib/commerce/product-presentation";

describe("product presentation helpers", () => {
  it("summarizes stock availability for product detail pages", () => {
    expect(getProductAvailability([{ stock: 0 }, { stock: 2 }, { stock: 3 }])).toEqual({
      label: "5 pieces available",
      tone: "available",
      totalStock: 5
    });
  });

  it("normalizes image URL fields for admin product forms", () => {
    expect(normalizeProductMediaInput([" /front.svg ", "", "https://cdn.example.com/back.jpg "])).toEqual([
      "/front.svg",
      "https://cdn.example.com/back.jpg"
    ]);
  });
});
