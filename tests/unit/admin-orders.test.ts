import { describe, expect, it } from "vitest";
import { formatOrderTotal } from "@/lib/commerce/admin-orders";

describe("admin order formatting", () => {
  it("shows VND totals consistently", () => {
    expect(formatOrderTotal(2930000)).toContain("2.930.000");
  });
});
