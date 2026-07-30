"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { OrderStatusPayload } from "@/lib/commerce/order-status";
import { formatVnd } from "@/lib/commerce/cart";
import { statusTranslationKey, useLanguage } from "@/components/storefront/language-provider";

export const ORDER_STATUS_POLL_INTERVAL_MS = 1500;
export const PAYMENT_QR_EXPIRY_MS = 5 * 60 * 1000;

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
  const { t } = useLanguage();
  const displayStatus = (value: string) => {
    const textKey = statusTranslationKey(value);
    return textKey ? t(textKey) : t("statusUnknown");
  };
  const [status, setStatus] = useState(initialStatus);
  const [showSuccess, setShowSuccess] = useState(initialStatus.confirmed);
  const [qrRemainingMs, setQrRemainingMs] = useState(() => (qrIssuedAtMs ? remainingQrMs(qrIssuedAtMs) : null));
  const successModalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!showSuccess) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modal = successModalRef.current;
    const focusable = Array.from(
      modal?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    );
    focusable[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowSuccess(false);
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [showSuccess]);

  return (
    <>
      <aside className="order-panel order-status-panel">
        <h2>{t("status")}</h2>
        {status.confirmed ? (
          <p className="payment-confirmed" role="status">
            {t("paymentConfirmed")}
          </p>
        ) : (
          <p className="muted">{t("waitingPayment")}</p>
        )}
        {qrRemainingMs !== null && !status.confirmed ? (
          <p className={qrRemainingMs > 0 ? "payment-countdown" : "payment-countdown expired"}>
            {qrRemainingMs > 0
              ? t("qrValidFor", { time: formatCountdown(qrRemainingMs) })
              : t("qrExpired")}
          </p>
        ) : null}
        <div className="status-row">
          <span>{t("order")}</span>
          <strong>{displayStatus(status.orderStatus)}</strong>
        </div>
        <div className="status-row">
          <span>{t("payment")}</span>
          <strong>{displayStatus(status.paymentStatus)}</strong>
        </div>
        <div className="status-row total">
          <span>{t("total")}</span>
          <strong>{formatVnd(totalVnd)}</strong>
        </div>
      </aside>
      {showSuccess ? (
        <div
          className="payment-success-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("paymentSuccessful")}
        >
          <div className="payment-success-modal" ref={successModalRef} tabIndex={-1}>
            <button
              aria-label={t("closePaymentNotification")}
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
            <h2>{t("paymentSuccessful")}</h2>
            <p>{t("paymentSuccessDescription")}</p>
            <div className="payment-success-actions">
              <Link className="primary-link" href="/shop">
                {t("continueShopping")}
              </Link>
              <button type="button" onClick={() => setShowSuccess(false)}>
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
