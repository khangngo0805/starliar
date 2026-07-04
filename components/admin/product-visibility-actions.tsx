"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductVisibilityActions({
  productId,
  productSlug,
  published
}: {
  productId: string;
  productSlug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function updateVisibility(nextPublished: boolean) {
    const action = nextPublished ? "restore" : "hide";
    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/products/${productId}/visibility`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: nextPublished })
    });
    setBusy(false);

    if (!response.ok) {
      setMessage("Could not update product visibility");
      return;
    }

    setMessage(nextPublished ? "Product restored" : "Product hidden");
    router.refresh();
  }

  return (
    <section className="admin-product-actions" aria-label="Product actions">
      <a className="text-link" href={`/shop/${productSlug}`}>
        View storefront
      </a>
      <button
        className={published ? "danger-button" : "primary-button"}
        disabled={busy}
        type="button"
        onClick={() => updateVisibility(!published)}
      >
        {busy ? "Updating..." : published ? "Hide product" : "Restore product"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
