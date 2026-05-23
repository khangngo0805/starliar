import { describe, expect, it } from "vitest";
import { addCartItem, getCartSubtotal } from "@/lib/commerce/cart";

describe("cart helpers", () => {
  it("merges the same variant and totals VND prices", () => {
    const cart = addCartItem([], {
      variantId: "m",
      productId: "p1",
      slug: "shell",
      name: "Shell",
      size: "M",
      priceVnd: 2890000,
      quantity: 1
    });
    const merged = addCartItem(cart, {
      variantId: "m",
      productId: "p1",
      slug: "shell",
      name: "Shell",
      size: "M",
      priceVnd: 2890000,
      quantity: 2
    });

    expect(merged[0].quantity).toBe(3);
    expect(getCartSubtotal(merged)).toBe(8670000);
  });
});
