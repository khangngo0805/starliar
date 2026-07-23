import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/components/storefront/language-provider";
import { ShopCatalog } from "@/components/storefront/shop-catalog";

vi.mock("@/components/commerce/favorite-button", () => ({
  FavoriteButton: ({ productName }: { productName: string }) => (
    <button aria-label={`Favorite ${productName}`} type="button" />
  )
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn() })
}));

const products = [
  {
    id: "shirt-1",
    slug: "axis-cropped-shirt",
    name: "Axis Cropped Shirt",
    category: "Shirt",
    priceVnd: 1290000,
    media: ["/media/placeholders/nocturne-shirt.svg"]
  },
  {
    id: "jacket-1",
    slug: "mirror-bomber",
    name: "Mirror Bomber Jacket",
    category: "Jacket",
    priceVnd: 3290000,
    media: ["/media/placeholders/orbital-shell.svg"]
  },
  {
    id: "tee-1",
    slug: "starliar-test-tee",
    name: "Starlier Test Tee",
    category: "T-Shirt",
    priceVnd: 10000,
    media: ["/media/placeholders/nocturne-shirt.svg"]
  }
];

function renderCatalog(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("ShopCatalog", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/shop");
  });

  afterEach(() => {
    cleanup();
  });

  it("filters categories instantly without leaving the shop page", () => {
    renderCatalog(<ShopCatalog initialCategory={null} products={products} />);

    const breadcrumb = screen.getByLabelText("Shop breadcrumb");
    expect(breadcrumb).toHaveTextContent("First Signal");
    expect(breadcrumb).toHaveTextContent("All products");
    expect(screen.getByText(/In stock · 3 styles/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Axis Cropped Shirt/i })).toHaveAttribute(
      "href",
      "/shop/axis-cropped-shirt"
    );
    expect(screen.getByRole("link", { name: /Mirror Bomber Jacket/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Shirt" }));

    expect(screen.getByRole("heading", { name: "Shirt" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/shop");
    expect(window.location.search).toBe("?category=shirt");
    expect(screen.getByRole("link", { name: /Axis Cropped Shirt/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Mirror Bomber Jacket/i })).not.toBeInTheDocument();
  });

  it("marks the active category and can return to all products", () => {
    window.history.replaceState({}, "", "/shop?category=jacket");
    renderCatalog(<ShopCatalog initialCategory="Jacket" products={products} />);

    expect(screen.getByRole("heading", { name: "Jacket" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mirror Bomber Jacket/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Axis Cropped Shirt/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jacket" })).toHaveClass("active");

    fireEvent.click(screen.getByRole("button", { name: "All" }));

    const grid = screen.getByTestId("shop-product-grid");
    expect(within(grid).getByRole("link", { name: /Mirror Bomber Jacket/i })).toBeInTheDocument();
    expect(within(grid).getByRole("link", { name: /Axis Cropped Shirt/i })).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("shows in-stock status on product cards", () => {
    renderCatalog(<ShopCatalog initialCategory={null} products={products} />);

    const grid = screen.getByTestId("shop-product-grid");
    expect(within(grid).getAllByText("In stock")).toHaveLength(products.length);
  });
});
