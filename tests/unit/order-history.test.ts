import { describe, expect, it } from "vitest";
import { normalizeGuestOrderLookup } from "@/lib/commerce/order-history";

describe("guest order history lookup", () => {
  it("normalizes email and phone before searching guest orders", () => {
    expect(normalizeGuestOrderLookup({ email: " Guest@Starlier.Test ", phone: " 090 123-4567 " })).toEqual({
      email: "guest@starlier.test",
      phone: "0901234567"
    });
  });

  it("rejects short phone values for guest history privacy", () => {
    expect(() => normalizeGuestOrderLookup({ email: "guest@starliar.test", phone: "123" })).toThrow(
      "INVALID_ORDER_LOOKUP"
    );
  });
});
