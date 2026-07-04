"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(formData: FormData) {
    setBusy(true);
    setMessage("");
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
      setMessage("Could not find orders with those details.");
      return;
    }

    setOrders(result?.orders ?? []);
    if (!result?.orders?.length) setMessage("No orders matched that email and phone.");
  }

  return (
    <section className="account-panel guest-order-lookup">
      <div className="account-panel-heading">
        <div>
          <p className="eyebrow">Guest orders</p>
          <h2>Find your order history</h2>
        </div>
      </div>
      <form action={lookup} className="guest-order-form">
        <input name="email" placeholder="Email used at checkout" required type="email" />
        <input name="phone" placeholder="Phone used at checkout" required />
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? "Searching..." : "Search orders"}
        </button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
      {orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => (
            <Link className="account-order-row" href={`/order/${order.orderNumber}`} key={order.id}>
              <span>
                {order.orderNumber}
                <small>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</small>
              </span>
              <small>
                {order.status.replaceAll("_", " ")} / {order.paymentStatus}
              </small>
              <strong>{formatVnd(order.totalVnd)}</strong>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
