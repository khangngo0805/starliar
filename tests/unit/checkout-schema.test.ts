import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "@/lib/commerce/checkout-schema";

describe("checkoutInputSchema", () => {
  it("requires contact, address, country, and cart items", () => {
    const parsed = checkoutInputSchema.safeParse({ email: "bad" });
    expect(parsed.success).toBe(false);
  });
});
