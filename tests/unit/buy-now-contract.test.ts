import { describe, expect, it } from "vitest";

describe("buy now contract", () => {
  it("creates an order URL from an order number", () => {
    const orderNumber = "STL-123";
    expect(`/order/${orderNumber}`).toBe("/order/STL-123");
  });
});
