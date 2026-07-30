"use client";

import { useState } from "react";
import { addCartItem, CART_STORAGE_KEY, type CartItem } from "@/lib/commerce/cart";
import { useLanguage } from "@/components/storefront/language-provider";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
}

export function AddToCartButton({
  product,
  variant
}: {
  product: { id: string; name: string; slug: string; category?: string; media?: string[]; priceVnd: number };
  variant: { id: string; size: string; stock: number };
}) {
  const { t } = useLanguage();
  const [toast, setToast] = useState("");

  return (
    <div className="add-to-cart-control">
      <button
        className="primary-button"
        disabled={variant.stock < 1}
        onClick={() => {
          const next = addCartItem(readCart(), {
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category,
            media: product.media?.[0],
            size: variant.size,
            priceVnd: product.priceVnd,
            quantity: 1
          });
          window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event("starliar-cart-updated"));
          setToast(t("addedToCart", { product: product.name }));
          window.setTimeout(() => setToast(""), 1800);
        }}
        type="button"
      >
        {t("addToCart")}
      </button>
      {toast ? <p className="cart-toast" role="status">{toast}</p> : null}
    </div>
  );
}
