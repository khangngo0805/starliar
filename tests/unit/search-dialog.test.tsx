import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchDialog } from "@/components/storefront/search-dialog";

describe("SearchDialog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
    fireEvent.change(screen.getByPlaceholderText("Search Starliar"), {
      target: { value: "shell" }
    });

    expect(() => unmount()).not.toThrow();
  });
});
