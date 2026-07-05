"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/commerce/cart";

export function ShippingSettingsForm({ shippingFeeVnd }: { shippingFeeVnd: number }) {
  const [message, setMessage] = useState("");
  const [value, setValue] = useState(shippingFeeVnd);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/settings/shipping", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        shippingFeeVnd: Number(formData.get("shippingFeeVnd"))
      })
    });
    setBusy(false);

    if (!response.ok) {
      setMessage("Could not save shipping fee.");
      return;
    }

    setMessage("Shipping fee saved.");
  }

  return (
    <form action={submit} className="admin-form admin-settings-form">
      <label>
        Shipping fee
        <input
          min="0"
          name="shippingFeeVnd"
          required
          step="1000"
          type="number"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </label>
      <p className="muted">Checkout will use {formatVnd(value || 0)} for new orders.</p>
      <button className="primary-button" disabled={busy} type="submit">
        {busy ? "Saving..." : "Save shipping fee"}
      </button>
      {message ? <p className={message.includes("saved") ? undefined : "form-error"}>{message}</p> : null}
    </form>
  );
}
