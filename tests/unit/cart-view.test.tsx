import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartView } from "@/components/commerce/cart-view";

const cartItem = {
  variantId: "sample-variant",
  productId: "sample-product",
  name: "Orbital Shell Jacket",
  slug: "orbital-shell-jacket",
  category: "Jacket",
  media: "/media/placeholders/orbital-shell.svg",
  size: "M",
  priceVnd: 2890000,
  quantity: 1
};

describe("CartView hydration", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates without mismatch when browser cart exists", async () => {
    window.localStorage.clear();
    const container = document.createElement("div");
    container.innerHTML = renderToString(<CartView />);
    document.body.append(container);

    window.localStorage.setItem("starliar-cart", JSON.stringify([cartItem]));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <CartView />);
    });

    expect(consoleError.mock.calls.flat().join("\n")).not.toContain("Hydration failed");

    await act(async () => {
      root?.unmount();
    });
    container.remove();
  });
});
