import { describe, expect, it } from "vitest";
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
});
