import { describe, expect, it } from "vitest";
import { summarizeCustomerActivity } from "@/lib/commerce/admin-customers";

describe("admin customer summaries", () => {
  it("counts orders, favorites, and paid spend for a customer", () => {
    const summary = summarizeCustomerActivity({
      orders: [
        { totalVnd: 1240000, status: "PAID" },
        { totalVnd: 760000, status: "PENDING_PAYMENT" },
        { totalVnd: 990000, status: "COMPLETED" }
      ],
      favorites: [{ id: "fav-1" }, { id: "fav-2" }]
    });

    expect(summary).toEqual({
      orderCount: 3,
      favoriteCount: 2,
      paidSpendVnd: 2230000
    });
  });
});
