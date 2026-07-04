"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocationPicker } from "@/components/commerce/location-picker";
import { BUY_NOW_STORAGE_KEY, CART_STORAGE_KEY, formatVnd, getCartSubtotal, type CartItem } from "@/lib/commerce/cart";

function readCheckoutItems(mode: "cart" | "buy-now"): CartItem[] {
  const key = mode === "buy-now" ? BUY_NOW_STORAGE_KEY : CART_STORAGE_KEY;
  return JSON.parse(window.localStorage.getItem(key) ?? "[]") as CartItem[];
}

export function CheckoutForm({ mode = "cart" }: { mode?: "cart" | "buy-now" }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setItems(readCheckoutItems(mode)));
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    if (!items.length) {
      setBusy(false);
      setError("Your checkout is empty.");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        customerName: formData.get("customerName"),
        phone: formData.get("phone"),
        country: formData.get("country"),
        addressLine1: formData.get("addressLine1"),
        addressLine2: formData.get("addressLine2") || undefined,
        city: formData.get("city"),
        province: formData.get("province") || undefined,
        postalCode: formData.get("postalCode") || undefined,
        deliveryLatitude: Number(formData.get("deliveryLatitude")),
        deliveryLongitude: Number(formData.get("deliveryLongitude")),
        deliveryNote: formData.get("deliveryNote") || undefined,
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      })
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error ?? "CHECKOUT_FAILED");
      return;
    }
    window.localStorage.removeItem(mode === "buy-now" ? BUY_NOW_STORAGE_KEY : CART_STORAGE_KEY);
    window.dispatchEvent(new Event("starliar-cart-updated"));
    router.push(result.checkoutUrl ?? `/order/${result.orderNumber}`);
  }

  return (
    <form action={submit} className="checkout-form checkout-form-expanded">
      <section className="checkout-card">
        <p className="eyebrow">{mode === "buy-now" ? "Buy now checkout" : "Checkout"}</p>
        <h2>Contact</h2>
        <div className="checkout-field-grid">
          <input name="email" placeholder="Email" required type="email" />
          <input name="customerName" placeholder="Full name" required />
          <input name="phone" placeholder="Phone" required />
          <input defaultValue="VN" name="country" placeholder="Country" required />
        </div>
      </section>

      <section className="checkout-card">
        <h2>Delivery address</h2>
        <input name="addressLine1" placeholder="Street address" required />
        <input name="addressLine2" placeholder="Apartment, suite, landmark" />
        <div className="checkout-field-grid">
          <input name="city" placeholder="City" required />
          <input name="province" placeholder="Province / state" />
          <input name="postalCode" placeholder="Postal code" />
        </div>
        <textarea name="deliveryNote" placeholder="Delivery note" />
      </section>

      <LocationPicker />

      <section className="checkout-card checkout-summary-panel">
        <div className="account-panel-heading">
          <h2>Order summary</h2>
          <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
        </div>
        {items.length ? (
          <div className="checkout-summary-lines">
            {items.map((item) => (
              <article className="checkout-summary-line" key={item.variantId}>
                <span>{item.name}</span>
                <small>Size {item.size} / Qty {item.quantity}</small>
                <strong>{formatVnd(item.priceVnd * item.quantity)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No checkout item found. Add a product again before payment.</p>
        )}
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <strong>{formatVnd(getCartSubtotal(items))}</strong>
        </div>
        <div className="cart-summary-row">
          <span>Estimated shipping</span>
          <strong>40.000 VND</strong>
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button" disabled={busy || !items.length} type="submit">
        {busy ? "Creating payment..." : "Pay by QR"}
      </button>
    </form>
  );
}
