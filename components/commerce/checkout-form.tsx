"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartItem } from "@/lib/commerce/cart";

function readCart(): CartItem[] {
  return JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]") as CartItem[];
}

export function CheckoutForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    const items = readCart();
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
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      })
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error ?? "CHECKOUT_FAILED");
      return;
    }
    window.localStorage.removeItem("starliar-cart");
    router.push(result.checkoutUrl ?? `/order/${result.orderNumber}`);
  }

  return (
    <form action={submit} className="checkout-form">
      <input name="email" placeholder="Email" required type="email" />
      <input name="customerName" placeholder="Name" required />
      <input name="phone" placeholder="Phone" required />
      <input defaultValue="VN" name="country" placeholder="Country" required />
      <input name="addressLine1" placeholder="Address" required />
      <input name="addressLine2" placeholder="Apartment, suite, etc." />
      <input name="city" placeholder="City" required />
      <input name="province" placeholder="Province / state" />
      <input name="postalCode" placeholder="Postal code" />
      {error ? <p role="alert">{error}</p> : null}
      <button className="primary-button" disabled={busy} type="submit">
        {busy ? "Creating payment..." : "Pay by QR"}
      </button>
    </form>
  );
}
