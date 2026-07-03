import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCustomers } from "@/lib/commerce/admin-customers";
import { formatOrderTotal } from "@/lib/commerce/admin-orders";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export default async function AdminCustomersPage() {
  await requireAdmin();
  const customers = await getAdminCustomers();

  return (
    <main className="admin-shell">
      <AdminNav />
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Customer management</p>
          <h1>Customers</h1>
        </div>
        <span className="muted">{customers.length} accounts</span>
      </div>
      <div className="admin-list">
        {customers.map((customer) => (
          <Link className="admin-row admin-row-five" href={`/admin/customers/${customer.id}`} key={customer.id}>
            <span>
              <strong>{customer.name ?? "Unnamed customer"}</strong>
              <small>{customer.email}</small>
            </span>
            <span>{customer.orderCount} orders</span>
            <span>{formatOrderTotal(customer.paidSpendVnd)}</span>
            <span>{customer.favoriteCount} favorites</span>
            <span>{customer.lastOrderAt ? dateFormatter.format(customer.lastOrderAt) : "No orders"}</span>
          </Link>
        ))}
        {customers.length === 0 ? <p className="admin-empty">No customer accounts yet.</p> : null}
      </div>
    </main>
  );
}
