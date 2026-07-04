import { describe, expect, it } from "vitest";
import {
  adminProductErrorMessage,
  buildProductFormInitialValue,
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

  it("maps an existing product into editable form defaults", () => {
    expect(
      buildProductFormInitialValue({
        slug: "silent-poplin-shirt",
        name: "Silent Poplin Shirt",
        category: "Shirt",
        description: "Crisp poplin shirt with a quiet structured fit.",
        priceVnd: 1290000,
        published: true,
        images: [
          { src: "/media/products/silent-front.jpg", position: 1 },
          { src: "/media/products/silent-back.jpg", position: 0 }
        ],
        variants: [
          { size: "L", sku: "STL-SILENT-L", stock: 4 },
          { size: "M", sku: "STL-SILENT-M", stock: 9 }
        ]
      })
    ).toEqual({
      slug: "silent-poplin-shirt",
      name: "Silent Poplin Shirt",
      category: "Shirt",
      description: "Crisp poplin shirt with a quiet structured fit.",
      priceVnd: 1290000,
      published: true,
      media: ["/media/products/silent-back.jpg", "/media/products/silent-front.jpg"],
      variants: [
        { size: "L", sku: "STL-SILENT-L", stock: 4 },
        { size: "M", sku: "STL-SILENT-M", stock: 9 }
      ]
    });
  });
});
