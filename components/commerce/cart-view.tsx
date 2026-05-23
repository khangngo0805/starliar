"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd, getCartSubtotal, updateCartQuantity, type CartItem } from "@/lib/commerce/cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]") as CartItem[];
}

export function CartView() {
  const [items, setItems] = useState<CartItem[]>(readCart);

  function setQuantity(variantId: string, quantity: number) {
    const next = updateCartQuantity(items, variantId, quantity);
    setItems(next);
    window.localStorage.setItem("starliar-cart", JSON.stringify(next));
  }

  if (!items.length) {
    return (
      <section className="page-shell">
        <h1>Your cart is empty.</h1>
        <Link className="text-link" href="/shop">
          Enter the shop
        </Link>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <h1>Cart</h1>
      <div className="cart-lines">
        {items.map((item) => (
          <article className="cart-line" key={item.variantId}>
            <div>
              <Link href={`/shop/${item.slug}`}>{item.name}</Link>
              <p>
                {item.size} / {formatVnd(item.priceVnd)}
              </p>
            </div>
            <input
              aria-label={`Quantity for ${item.name}`}
              min="0"
              onChange={(event) => setQuantity(item.variantId, Number(event.target.value))}
              type="number"
              value={item.quantity}
            />
          </article>
        ))}
      </div>
      <div className="cart-total">
        <span>Subtotal</span>
        <strong>{formatVnd(getCartSubtotal(items))}</strong>
      </div>
      <Link className="primary-link" href="/checkout">
        Checkout
      </Link>
    </section>
  );
}
