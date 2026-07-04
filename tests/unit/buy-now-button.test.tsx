import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BUY_NOW_STORAGE_KEY } from "@/lib/commerce/cart";
import { BuyNowButton } from "@/components/commerce/buy-now-button";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("BuyNowButton", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    pushMock.mockReset();
  });

  it("stores the selected product as a buy-now checkout draft", () => {
    render(
      <BuyNowButton
        product={{
          id: "product-1",
          name: "SePay Test 10K",
          slug: "sepay-test-10k",
          category: "Accessories",
          media: ["/media/test.svg"],
          priceVnd: 10000
        }}
        variant={{ id: "variant-1", size: "OS", stock: 5 }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));

    expect(JSON.parse(window.localStorage.getItem(BUY_NOW_STORAGE_KEY) ?? "[]")).toEqual([
      {
        variantId: "variant-1",
        productId: "product-1",
        name: "SePay Test 10K",
        slug: "sepay-test-10k",
        category: "Accessories",
        media: "/media/test.svg",
        size: "OS",
        priceVnd: 10000,
        quantity: 1
      }
    ]);
    expect(pushMock).toHaveBeenCalledWith("/checkout?mode=buy-now");
  });
});
