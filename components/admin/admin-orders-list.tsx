"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatOrderTotal } from "@/lib/commerce/money";
import { OrderStatusBadge } from "./order-status-badge";

type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalVnd: number;
  status: string;
};

export function AdminOrdersList({ orders }: { orders: AdminOrderListItem[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  function toggleOrder(orderId: string) {
    setSelectedIds((current) => (current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]));
  }

  function toggleAllOrders() {
    setSelectedIds(allSelected ? [] : orders.map((order) => order.id));
  }

  async function deleteSelectedOrders() {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected order(s)? This also removes their items and payments.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage("");
    const response = await fetch("/api/admin/orders", {
      body: JSON.stringify({ ids: selectedIds }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE"
    });
    setIsDeleting(false);

    if (!response.ok) {
      setMessage("Could not delete selected orders.");
      return;
    }

    setSelectedIds([]);
    setMessage("Selected orders deleted.");
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="admin-empty">No orders yet.</p>;
  }

  return (
    <section className="admin-orders-panel" aria-label="Orders list">
      <div className="admin-bulk-toolbar">
        <label className="admin-checkbox-label">
          <input
            checked={allSelected}
            onChange={toggleAllOrders}
            type="checkbox"
            aria-label="Select all orders"
          />
          <span>{selectedIds.length ? `${selectedIds.length} selected` : "Select orders"}</span>
        </label>
        <button className="danger-button" disabled={selectedIds.length === 0 || isDeleting} type="button" onClick={deleteSelectedOrders}>
          {isDeleting ? "Deleting..." : `Delete selected (${selectedIds.length})`}
        </button>
      </div>
      {message ? <p className={message.includes("deleted") ? "admin-success-message" : "form-error"}>{message}</p> : null}
      <div className="admin-list">
        {orders.map((order) => (
          <article className="admin-row admin-row-selectable" key={order.id}>
            <input
              checked={selectedSet.has(order.id)}
              onChange={() => toggleOrder(order.id)}
              type="checkbox"
              aria-label={`Select order ${order.orderNumber}`}
            />
            <Link href={`/admin/orders/${order.id}`}>
              <span>{order.orderNumber}</span>
            </Link>
            <span>{order.customerName}</span>
            <span>{formatOrderTotal(order.totalVnd)}</span>
            <OrderStatusBadge status={order.status} />
          </article>
        ))}
      </div>
    </section>
  );
}
