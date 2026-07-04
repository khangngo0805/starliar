"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderDeleteButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteOrder() {
    const confirmed = window.confirm("Delete this order? This also removes its items and payments.");
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage("");
    const response = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!response.ok) {
      setMessage("Could not delete order.");
      return;
    }

    router.push("/admin/orders");
    router.refresh();
  }

  return (
    <div className="admin-danger-action">
      <button className="danger-button" disabled={isDeleting} type="button" onClick={deleteOrder}>
        {isDeleting ? "Deleting..." : "Delete order"}
      </button>
      {message ? <p className="form-error">{message}</p> : null}
    </div>
  );
}
