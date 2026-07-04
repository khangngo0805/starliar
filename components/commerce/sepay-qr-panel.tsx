"use client";

import { useEffect, useState } from "react";
import { PAYMENT_QR_EXPIRY_MS } from "@/components/commerce/order-status-panel";

type SePayQrPanelProps = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  issuedAtMs: number;
  orderNumber: string;
  qrUrl: string;
};

function getRemainingMs(issuedAtMs: number) {
  return Math.max(0, issuedAtMs + PAYMENT_QR_EXPIRY_MS - Date.now());
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SePayQrPanel({
  accountHolder,
  accountNumber,
  bankName,
  issuedAtMs,
  orderNumber,
  qrUrl
}: SePayQrPanelProps) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(issuedAtMs));
  const expired = remainingMs <= 0;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingMs(getRemainingMs(issuedAtMs));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [issuedAtMs]);

  return (
    <aside className="order-panel order-payment-panel">
      <div className="payment-panel-heading">
        <h2>Scan to pay</h2>
        <span className={expired ? "payment-countdown expired" : "payment-countdown"}>
          {expired ? "QR đã hết hiệu lực" : `Còn ${formatCountdown(remainingMs)}`}
        </span>
      </div>
      {expired ? (
        <div className="payment-qr-expired">
          <strong>QR đã hết hiệu lực sau 5 phút.</strong>
          <p>Tạo lại đơn hàng để nhận mã QR mới trước khi chuyển khoản.</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={`SePay QR for order ${orderNumber}`} src={qrUrl} />
      )}
      <div className="payment-transfer-lines">
        <div className="status-row">
          <span>Bank</span>
          <strong>{bankName}</strong>
        </div>
        <div className="status-row">
          <span>Account</span>
          <strong>{accountNumber}</strong>
        </div>
        <div className="status-row">
          <span>Name</span>
          <strong>{accountHolder}</strong>
        </div>
        <div className="status-row">
          <span>Memo</span>
          <strong>{orderNumber}</strong>
        </div>
      </div>
      <p className="muted">Keep the amount and memo unchanged so SePay can confirm the payment automatically.</p>
    </aside>
  );
}
