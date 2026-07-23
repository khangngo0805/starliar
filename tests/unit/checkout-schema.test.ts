import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "@/lib/commerce/checkout-schema";

describe("checkoutInputSchema", () => {
  it("requires contact, address, country, and cart items", () => {
    const parsed = checkoutInputSchema.safeParse({ email: "bad" });
    expect(parsed.success).toBe(false);
  });

  it("accepts delivery coordinates and notes for map-assisted checkout", () => {
    expect(
      checkoutInputSchema.parse({
        email: "guest@starliar.test",
        customerName: "Starlier Guest",
        phone: "090 123 4567",
        country: "VN",
        addressLine1: "123 Nguyen Hue",
        city: "Ho Chi Minh",
        deliveryLatitude: 10.7769,
        deliveryLongitude: 106.7009,
        deliveryNote: "Call before delivery",
        items: [{ variantId: "variant-1", quantity: 1 }]
      })
    ).toMatchObject({
      deliveryLatitude: 10.7769,
      deliveryLongitude: 106.7009,
      deliveryNote: "Call before delivery"
    });
  });
});
