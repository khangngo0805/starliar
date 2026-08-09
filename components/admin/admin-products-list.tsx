"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatVnd } from "@/lib/commerce/cart";

type AdminProductListItem = {
  id: string;
  name: string;
  priceVnd: number;
  published: boolean;
};

export function AdminProductsList({ products }: { products: AdminProductListItem[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  function toggleProduct(productId: string) {
    setSelectedIds((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  }

  function toggleAllProducts() {
    setSelectedIds(allSelected ? [] : products.map((product) => product.id));
  }

  async function deleteSelectedProducts() {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected product(s) permanently? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage("");
    const response = await fetch("/api/admin/products", {
      body: JSON.stringify({ ids: selectedIds }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE"
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsDeleting(false);

    if (!response.ok) {
      setMessage(result?.error ?? "Could not delete selected products.");
      return;
    }

    setSelectedIds([]);
    setMessage("Selected products deleted.");
    router.refresh();
  }

  if (products.length === 0) {
    return <p className="admin-empty">No products yet.</p>;
  }

  return (
    <section className="admin-products-panel" aria-label="Products list">
      <div className="admin-bulk-toolbar">
        <label className="admin-checkbox-label">
          <input checked={allSelected} onChange={toggleAllProducts} type="checkbox" aria-label="Select all products" />
          <span>{selectedIds.length ? `${selectedIds.length} selected` : "Select products"}</span>
        </label>
        <button className="danger-button" disabled={selectedIds.length === 0 || isDeleting} type="button" onClick={deleteSelectedProducts}>
          {isDeleting ? "Deleting..." : `Delete selected (${selectedIds.length})`}
        </button>
      </div>
      {message ? <p className={message.includes("deleted") ? "admin-success-message" : "form-error"}>{message}</p> : null}
      <div className="admin-list">
        {products.map((product) => (
          <article className="admin-row admin-row-selectable admin-product-row" key={product.id}>
            <input
              checked={selectedSet.has(product.id)}
              onChange={() => toggleProduct(product.id)}
              type="checkbox"
              aria-label={`Select product ${product.name}`}
            />
            <Link href={`/admin/products/${product.id}`}>
              <span>{product.name}</span>
            </Link>
            <span>{formatVnd(product.priceVnd)}</span>
            <span>{product.published ? "Published" : "Hidden"}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
