import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderDeleteButton } from "@/components/admin/order-delete-button";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}));

describe("OrderDeleteButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("confirms before deleting an admin order", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    render(<OrderDeleteButton orderId="order-123" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete order" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/orders/order-123", { method: "DELETE" }));
    expect(pushMock).toHaveBeenCalledWith("/admin/orders");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("keeps the order when deletion is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<OrderDeleteButton orderId="order-123" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete order" }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
