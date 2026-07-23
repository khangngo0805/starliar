"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrderStatusPayload } from "@/lib/commerce/order-status";
import { formatVnd } from "@/lib/commerce/cart";

export const ORDER_STATUS_POLL_INTERVAL_MS = 1500;
export const PAYMENT_QR_EXPIRY_MS = 5 * 60 * 1000;

function displayStatus(status: string) {
  return status.replaceAll("_", " ");
}

function remainingQrMs(issuedAtMs: number) {
  return Math.max(0, issuedAtMs + PAYMENT_QR_EXPIRY_MS - Date.now());
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function OrderStatusPanel({
  orderNumber,
  initialStatus,
  totalVnd,
  qrIssuedAtMs
}: {
  orderNumber: string;
  initialStatus: OrderStatusPayload;
  totalVnd: number;
  qrIssuedAtMs?: number;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [showSuccess, setShowSuccess] = useState(initialStatus.confirmed);
  const [qrRemainingMs, setQrRemainingMs] = useState(() => (qrIssuedAtMs ? remainingQrMs(qrIssuedAtMs) : null));

  useEffect(() => {
    if (status.confirmed) return;

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}/status`, { cache: "no-store" });
        if (!response?.ok) return;
        const nextStatus = (await response.json()) as OrderStatusPayload;
        setStatus(nextStatus);
        if (nextStatus.confirmed) setShowSuccess(true);
      } catch {
        return;
      }
    }, ORDER_STATUS_POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [orderNumber, status.confirmed]);

  useEffect(() => {
    if (!qrIssuedAtMs || status.confirmed) return;

    const interval = window.setInterval(() => {
      setQrRemainingMs(remainingQrMs(qrIssuedAtMs));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [qrIssuedAtMs, status.confirmed]);

  return (
    <>
      <aside className="order-panel order-status-panel">
        <h2>Status</h2>
        {status.confirmed ? (
          <p className="payment-confirmed" role="status">
            Payment confirmed
          </p>
        ) : (
          <p className="muted">Waiting for payment confirmation...</p>
        )}
        {qrRemainingMs !== null && !status.confirmed ? (
          <p className={qrRemainingMs > 0 ? "payment-countdown" : "payment-countdown expired"}>
            {qrRemainingMs > 0 ? `QR còn hiệu lực ${formatCountdown(qrRemainingMs)}` : "QR đã hết hiệu lực"}
          </p>
        ) : null}
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
      {showSuccess ? (
        <div className="payment-success-overlay" role="dialog" aria-modal="true" aria-label="Thanh toán thành công">
          <div className="payment-success-modal">
            <button
              aria-label="Đóng thông báo thanh toán"
              className="payment-success-close"
              type="button"
              onClick={() => setShowSuccess(false)}
            >
              ×
            </button>
            <span className="payment-success-mark" aria-hidden="true">
              <svg viewBox="0 0 96 96" focusable="false">
                <circle cx="48" cy="48" r="42" />
                <path d="M29 50.5 42.4 64 68 34.5" />
              </svg>
            </span>
            <h2>Thanh toán thành công</h2>
            <p>Đơn hàng của bạn đã được xác nhận. Starlier sẽ chuẩn bị đơn và liên hệ khi cần.</p>
            <div className="payment-success-actions">
              <Link className="primary-link" href="/shop">
                Tiếp tục mua sắm
              </Link>
              <button type="button" onClick={() => setShowSuccess(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
