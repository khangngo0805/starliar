import { describe, expect, it } from "vitest";
import { formatOrderTotal, normalizeAdminOrderIds } from "@/lib/commerce/admin-orders";

describe("admin order formatting", () => {
  it("shows VND totals consistently", () => {
    expect(formatOrderTotal(2930000)).toContain("2.930.000");
  });

  it("normalizes selected order ids for bulk deletion", () => {
    expect(normalizeAdminOrderIds({ ids: [" order-1 ", "order-2", "order-1"] })).toEqual(["order-1", "order-2"]);
  });

  it("rejects empty bulk deletion requests", () => {
    expect(() => normalizeAdminOrderIds({ ids: [] })).toThrow("Select at least one order to delete.");
  });
});
