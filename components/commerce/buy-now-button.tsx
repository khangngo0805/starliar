"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyNowButton({ variant }: { variant: { id: string; stock: number } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buyNow() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/buy-now", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, quantity: 1 })
    });
    const result = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(result.error ?? "BUY_NOW_FAILED");
      return;
    }

    router.push(result.orderUrl);
  }

  return (
    <div className="buy-now-control">
      <button className="buy-now-button" disabled={busy || variant.stock < 1} onClick={buyNow} type="button">
        {busy ? "Creating order..." : "Buy now"}
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
