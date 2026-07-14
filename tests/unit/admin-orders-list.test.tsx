import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const orders = [
  {
    id: "order-1",
    orderNumber: "STL-1001",
    customerName: "Khang",
    totalVnd: 10000,
    status: "PENDING_PAYMENT"
  },
  {
    id: "order-2",
    orderNumber: "STL-1002",
    customerName: "Linh",
    totalVnd: 20000,
    status: "PAID"
  }
];

describe("AdminOrdersList", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    refreshMock.mockReset();
  });

  it("selects all orders and deletes them in one request", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ deletedCount: 2 }) }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOrdersList orders={orders} />);

    fireEvent.click(screen.getByRole("checkbox", { name: /select all orders/i }));
    expect(screen.getByRole("button", { name: /delete selected \(2\)/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /delete selected \(2\)/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/orders", {
        body: JSON.stringify({ ids: ["order-1", "order-2"] }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE"
      })
    );
    expect(refreshMock).toHaveBeenCalled();
  });
});
