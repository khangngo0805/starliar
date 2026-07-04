"use client";

import { useEffect, useState } from "react";
import type { OrderStatusPayload } from "@/lib/commerce/order-status";
import { formatVnd } from "@/lib/commerce/cart";

function displayStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function OrderStatusPanel({
  orderNumber,
  initialStatus,
  totalVnd
}: {
  orderNumber: string;
  initialStatus: OrderStatusPayload;
  totalVnd: number;
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status.confirmed) return;

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/orders/${orderNumber}/status`, { cache: "no-store" });
      if (!response.ok) return;
      setStatus((await response.json()) as OrderStatusPayload);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [orderNumber, status.confirmed]);

  return (
    <aside className="order-panel order-status-panel">
      <h2>Status</h2>
      {status.confirmed ? (
        <p className="payment-confirmed" role="status">
          Payment confirmed
        </p>
      ) : (
        <p className="muted">Waiting for payment confirmation...</p>
      )}
      <div className="status-row">
        <span>Order</span>
        <strong>{displayStatus(status.orderStatus)}</strong>
      </div>
      <div className="status-row">
        <span>Payment</span>
        <strong>{status.paymentStatus}</strong>
      </div>
      <div className="status-row total">
        <span>Total</span>
        <strong>{formatVnd(totalVnd)}</strong>
      </div>
    </aside>
  );
}
