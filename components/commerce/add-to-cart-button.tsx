"use client";

import { addCartItem, type CartItem } from "@/lib/commerce/cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]") as CartItem[];
}

export function AddToCartButton({
  product,
  variant
}: {
  product: { id: string; name: string; slug: string; priceVnd: number };
  variant: { id: string; size: string; stock: number };
}) {
  return (
    <button
      className="primary-button"
      disabled={variant.stock < 1}
      onClick={() => {
        const next = addCartItem(readCart(), {
          variantId: variant.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          size: variant.size,
          priceVnd: product.priceVnd,
          quantity: 1
        });
        window.localStorage.setItem("starliar-cart", JSON.stringify(next));
        window.dispatchEvent(new Event("starliar-cart-updated"));
      }}
      type="button"
    >
      Add to cart
    </button>
  );
}
