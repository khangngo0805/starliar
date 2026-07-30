"use client";

import Link from "next/link";
import { useState } from "react";
import {
  statusTranslationKey,
  useLanguage,
  type TranslationKey
} from "@/components/storefront/language-provider";
import { formatVnd } from "@/lib/commerce/cart";

type GuestOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalVnd: number;
  createdAt: string;
  items: Array<{ productName: string; size: string; quantity: number }>;
};

export function GuestOrderLookup() {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [messageKey, setMessageKey] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);
  const { language, t } = useLanguage();
  const displayStatus = (status: string) => {
    const textKey = statusTranslationKey(status);
    return textKey ? t(textKey) : status.replaceAll("_", " ");
  };

  async function lookup(formData: FormData) {
    setBusy(true);
    setMessageKey(null);
    setOrders([]);
    const response = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        phone: formData.get("phone")
      })
    });
    const result = (await response.json().catch(() => null)) as { orders?: GuestOrder[]; error?: string } | null;
    setBusy(false);

    if (!response.ok) {
      setMessageKey("orderLookupFailed");
      return;
    }

    setOrders(result?.orders ?? []);
    if (!result?.orders?.length) setMessageKey("noOrdersMatched");
  }

  return (
    <section className="account-panel guest-order-lookup">
      <div className="account-panel-heading">
        <div>
          <p className="eyebrow">{t("guestOrders")}</p>
          <h2>{t("findOrderHistory")}</h2>
        </div>
      </div>
      <form action={lookup} className="guest-order-form">
        <input name="email" placeholder={t("emailUsedAtCheckout")} required type="email" />
        <input name="phone" placeholder={t("phoneUsedAtCheckout")} required />
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? t("searchingOrders") : t("searchOrders")}
        </button>
      </form>
      {messageKey ? <p className="muted">{t(messageKey)}</p> : null}
      {orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => (
            <Link className="account-order-row" href={`/order/${order.orderNumber}`} key={order.id}>
              <span>
                {order.orderNumber}
                <small>{new Date(order.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-GB")}</small>
              </span>
              <small>
                {displayStatus(order.status)} / {displayStatus(order.paymentStatus)}
              </small>
              <strong>{formatVnd(order.totalVnd)}</strong>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
