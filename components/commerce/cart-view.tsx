"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_STORAGE_KEY, formatVnd, getCartSubtotal, updateCartQuantity, type CartItem } from "@/lib/commerce/cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
}

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCart());
    const frame = window.requestAnimationFrame(syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener("starliar-cart-updated", syncCart);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("starliar-cart-updated", syncCart);
    };
  }, []);

  function setQuantity(variantId: string, quantity: number) {
    const next = updateCartQuantity(items, variantId, quantity);
    setItems(next);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("starliar-cart-updated"));
  }

  if (!items.length) {
    return (
      <section className="cart-shell empty-cart">
        <div>
          <p className="eyebrow">Cart</p>
          <h1>Your cart is empty.</h1>
          <p className="muted">Add sample products from the expanded shop catalog to test checkout.</p>
          <Link className="primary-link" href="/shop">
            Enter the shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-shell">
      <div className="cart-main">
        <p className="eyebrow">Cart</p>
        <h1>{items.length} item{items.length > 1 ? "s" : ""}</h1>
        <div className="cart-lines">
          {items.map((item) => (
            <article className="cart-line" key={item.variantId}>
              <div className="cart-line-media">
                {item.media ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={item.name} src={item.media} />
                ) : (
                  <span>{item.name.slice(0, 2)}</span>
                )}
              </div>
              <div className="cart-line-copy">
                <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                <p>
                  {item.category ?? "Starlier"} / Size {item.size}
                </p>
                <button type="button" onClick={() => setQuantity(item.variantId, 0)}>
                  Remove
                </button>
              </div>
              <div className="cart-line-quantity">
                <input
                  aria-label={`Quantity for ${item.name}`}
                  min="0"
                  onChange={(event) => setQuantity(item.variantId, Number(event.target.value))}
                  type="number"
                  value={item.quantity}
                />
                <span>{formatVnd(item.priceVnd * item.quantity)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="cart-summary">
        <p className="eyebrow">Summary</p>
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <strong>{formatVnd(getCartSubtotal(items))}</strong>
        </div>
        <div className="cart-summary-row">
          <span>Estimated shipping</span>
          <strong>Calculated at checkout</strong>
        </div>
        <div className="cart-summary-actions">
          <Link className="primary-link" href="/checkout">
            Checkout
          </Link>
          <Link className="text-link" href="/shop">
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
