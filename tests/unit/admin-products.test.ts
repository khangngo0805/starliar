import { describe, expect, it } from "vitest";
import { adminProductSchema } from "@/lib/commerce/admin-products";

describe("adminProductSchema", () => {
  it("requires slug, price, media, and variants", () => {
    expect(adminProductSchema.safeParse({ name: "Only a name" }).success).toBe(false);
  });
});
