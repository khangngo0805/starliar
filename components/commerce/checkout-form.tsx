"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocationPicker } from "@/components/commerce/location-picker";
import { BUY_NOW_STORAGE_KEY, CART_STORAGE_KEY, formatVnd, getCartSubtotal, type CartItem } from "@/lib/commerce/cart";
import { useLanguage } from "@/components/storefront/language-provider";

function readCheckoutItems(mode: "cart" | "buy-now"): CartItem[] {
  const key = mode === "buy-now" ? BUY_NOW_STORAGE_KEY : CART_STORAGE_KEY;
  return JSON.parse(window.localStorage.getItem(key) ?? "[]") as CartItem[];
}

export function CheckoutForm({
  mode = "cart",
  shippingFeeVnd
}: {
  mode?: "cart" | "buy-now";
  shippingFeeVnd: number;
}) {
  const router = useRouter();
  const { t } = useLanguage();
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
      setError(t("checkoutEmpty"));
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
      setError(t(result.error === "UNAVAILABLE_VARIANT" ? "unavailableVariant" : "checkoutFailed"));
      return;
    }
    window.localStorage.removeItem(mode === "buy-now" ? BUY_NOW_STORAGE_KEY : CART_STORAGE_KEY);
    window.dispatchEvent(new Event("starliar-cart-updated"));
    router.push(result.checkoutUrl ?? `/order/${result.orderNumber}`);
  }

  return (
    <form action={submit} className="checkout-form checkout-form-expanded">
      <section className="checkout-card">
        <p className="eyebrow">{t(mode === "buy-now" ? "buyNowCheckout" : "checkout")}</p>
        <h2>{t("contact")}</h2>
        <div className="checkout-field-grid">
          <input aria-label={t("email")} name="email" placeholder={t("email")} required type="email" />
          <input aria-label={t("fullName")} name="customerName" placeholder={t("fullName")} required />
          <input aria-label={t("phone")} name="phone" placeholder={t("phone")} required />
          <input aria-label={t("country")} defaultValue="VN" name="country" placeholder={t("country")} required />
        </div>
      </section>

      <section className="checkout-card">
        <h2>{t("deliveryAddress")}</h2>
        <input aria-label={t("streetAddress")} name="addressLine1" placeholder={t("streetAddress")} required />
        <input aria-label={t("apartmentLandmark")} name="addressLine2" placeholder={t("apartmentLandmark")} />
        <div className="checkout-field-grid">
          <input aria-label={t("city")} name="city" placeholder={t("city")} required />
          <input aria-label={t("province")} name="province" placeholder={t("province")} />
          <input aria-label={t("postalCode")} name="postalCode" placeholder={t("postalCode")} />
        </div>
        <textarea aria-label={t("deliveryNote")} name="deliveryNote" placeholder={t("deliveryNote")} />
      </section>

      <LocationPicker />

      <section className="checkout-card checkout-summary-panel">
        <div className="account-panel-heading">
          <h2>{t("orderSummary")}</h2>
          <span>{t(items.length === 1 ? "cartItemCount" : "cartItemCountPlural", { count: items.length })}</span>
        </div>
        {items.length ? (
          <div className="checkout-summary-lines">
            {items.map((item) => (
              <article className="checkout-summary-line" key={item.variantId}>
                <span>{item.name}</span>
                <small>{t("sizeQuantity", { size: item.size, quantity: item.quantity })}</small>
                <strong>{formatVnd(item.priceVnd * item.quantity)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">{t("noCheckoutItems")}</p>
        )}
        <div className="cart-summary-row">
          <span>{t("subtotal")}</span>
          <strong>{formatVnd(getCartSubtotal(items))}</strong>
        </div>
        <div className="cart-summary-row">
          <span>{t("estimatedShipping")}</span>
          <strong>{formatVnd(shippingFeeVnd)}</strong>
        </div>
        <div className="cart-summary-row">
          <span>{t("total")}</span>
          <strong>{formatVnd(getCartSubtotal(items) + shippingFeeVnd)}</strong>
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button" disabled={busy || !items.length} type="submit">
        {busy ? t("creatingPayment") : t("payByQr")}
      </button>
    </form>
  );
}
