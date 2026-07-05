import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHIPPING_FEE_VND,
  parseShippingFeeInput,
  resolveOrderTotals,
  resolveMapProvider,
  geolocationErrorMessage
} from "@/lib/commerce/store-settings";

describe("store settings", () => {
  it("parses admin shipping fee input", () => {
    expect(parseShippingFeeInput({ shippingFeeVnd: 55000 })).toEqual({ shippingFeeVnd: 55000 });
    expect(parseShippingFeeInput({ shippingFeeVnd: "0" })).toEqual({ shippingFeeVnd: 0 });
  });

  it("rejects invalid shipping fee values", () => {
    expect(() => parseShippingFeeInput({ shippingFeeVnd: -1 })).toThrow("INVALID_SHIPPING_FEE");
    expect(() => parseShippingFeeInput({ shippingFeeVnd: "abc" })).toThrow("INVALID_SHIPPING_FEE");
  });

  it("resolves order totals with configured shipping", () => {
    expect(resolveOrderTotals({ subtotalVnd: 10000, shippingFeeVnd: 25000 })).toEqual({
      subtotalVnd: 10000,
      shippingVnd: 25000,
      totalVnd: 35000
    });
  });

  it("keeps a stable default shipping fee", () => {
    expect(DEFAULT_SHIPPING_FEE_VND).toBe(40000);
  });

  it("uses Google Maps only when a public API key is configured", () => {
    expect(resolveMapProvider("AIza-demo")).toBe("google");
    expect(resolveMapProvider("")).toBe("openstreetmap");
    expect(resolveMapProvider(undefined)).toBe("openstreetmap");
  });

  it("explains browser location permission failures", () => {
    expect(geolocationErrorMessage(1)).toContain("permission");
    expect(geolocationErrorMessage(2)).toContain("available");
  });
});
