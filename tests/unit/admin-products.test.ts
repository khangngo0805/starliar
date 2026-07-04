import { describe, expect, it } from "vitest";
import {
  adminProductErrorMessage,
  adminProductSchema,
  adminProductVisibilitySchema
} from "@/lib/commerce/admin-products";

describe("adminProductSchema", () => {
  it("requires slug, price, media, and variants", () => {
    expect(adminProductSchema.safeParse({ name: "Only a name" }).success).toBe(false);
  });

  it("accepts explicit product visibility updates", () => {
    expect(adminProductVisibilitySchema.parse({ published: false })).toEqual({ published: false });
    expect(adminProductVisibilitySchema.safeParse({ published: "false" }).success).toBe(false);
  });

  it("explains missing SKU validation failures", () => {
    const parsed = adminProductSchema.safeParse({
      slug: "sepay-test-10k",
      name: "SePay Test 10K",
      category: "Accessories",
      description: "Low-value product for SePay testing.",
      priceVnd: 10000,
      published: true,
      media: ["/media/placeholders/nocturne-shirt.svg"],
      variants: [{ size: "OS", sku: "", stock: 50 }]
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(adminProductErrorMessage(parsed.error)).toBe("Add a SKU with at least 3 characters for every size.");
    }
  });
});
