import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminProductsList } from "@/components/admin/admin-products-list";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const products = [
  { id: "product-1", name: "Silent Poplin Shirt", priceVnd: 1690000, published: true },
  { id: "product-2", name: "Trace Cap", priceVnd: 690000, published: false }
];

describe("AdminProductsList", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    refreshMock.mockReset();
  });

  it("selects all products and deletes them in one request", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ deletedCount: 2 }) }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminProductsList products={products} />);

    fireEvent.click(screen.getByRole("checkbox", { name: /select all products/i }));
    expect(screen.getByRole("button", { name: /delete selected \(2\)/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /delete selected \(2\)/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/products", {
        body: JSON.stringify({ ids: ["product-1", "product-2"] }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE"
      })
    );
    expect(refreshMock).toHaveBeenCalled();
  });
});
