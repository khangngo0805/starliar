import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchDialog } from "@/components/storefront/search-dialog";

describe("SearchDialog", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("opens a full-screen editorial search surface with trends and recently viewed products", () => {
    render(<SearchDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByRole("dialog", { name: "Search products" })).toHaveClass("search-overlay");
    expect(screen.getByPlaceholderText("Please enter the search term(s)")).toBeInTheDocument();
    expect(screen.getByText("SEARCH TRENDS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Trace Cap/i })).toHaveAttribute("href", "/shop/trace-cap");
    expect(screen.getByText("RECENTLY VIEWED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove recently viewed products" })).toBeInTheDocument();
  });

  it("replaces trends with matching search results when a query is entered", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          products: [
            {
              id: "product-1",
              slug: "orbital-shell-jacket",
              name: "Orbital Shell Jacket",
              category: "Jacket",
              priceVnd: 2890000,
              collection: "First Signal",
              media: ["/media/placeholders/orbital-shell.svg"]
            }
          ]
        })
      }))
    );

    render(<SearchDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByPlaceholderText("Please enter the search term(s)"), {
      target: { value: "shell" }
    });

    await waitFor(() => expect(screen.getByRole("link", { name: /Orbital Shell Jacket/i })).toBeInTheDocument());
    expect(screen.getByText("SEARCH RESULTS")).toBeInTheDocument();
    expect(screen.queryByText("SEARCH TRENDS")).not.toBeInTheDocument();
  });

  it("does not crash when search cleanup aborts a pending request", () => {
    class ThrowingAbortController {
      signal = {} as AbortSignal;

      abort() {
        throw new DOMException("signal is aborted without reason", "AbortError");
      }
    }

    vi.stubGlobal("AbortController", ThrowingAbortController);

    const { unmount } = render(<SearchDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    fireEvent.change(screen.getByPlaceholderText("Please enter the search term(s)"), {
      target: { value: "shell" }
    });

    expect(() => unmount()).not.toThrow();
  });
});
