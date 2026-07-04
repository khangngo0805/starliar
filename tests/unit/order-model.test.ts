import { describe, expect, it } from "vitest";
import { createOrderStatusPayload } from "@/lib/commerce/order-status";
import { orderStatusValues, paymentStatusValues } from "@/lib/commerce/types";

describe("commerce statuses", () => {
  it("keeps pending payment and paid orders distinct", () => {
    expect(orderStatusValues).toContain("PENDING_PAYMENT");
    expect(paymentStatusValues).toEqual([
      "CREATED",
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELED"
    ]);
  });

  it("marks the live order status as confirmed only after order and payment are paid", () => {
    expect(createOrderStatusPayload({ orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING" })).toEqual({
      orderStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      confirmed: false
    });
    expect(createOrderStatusPayload({ orderStatus: "PAID", paymentStatus: "PAID" })).toEqual({
      orderStatus: "PAID",
      paymentStatus: "PAID",
      confirmed: true
    });
  });
});
