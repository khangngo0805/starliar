import { describe, expect, it } from "vitest";
import { adminProductSchema, adminProductVisibilitySchema } from "@/lib/commerce/admin-products";

describe("adminProductSchema", () => {
  it("requires slug, price, media, and variants", () => {
    expect(adminProductSchema.safeParse({ name: "Only a name" }).success).toBe(false);
  });

  it("accepts explicit product visibility updates", () => {
    expect(adminProductVisibilitySchema.parse({ published: false })).toEqual({ published: false });
    expect(adminProductVisibilitySchema.safeParse({ published: "false" }).success).toBe(false);
  });
});
