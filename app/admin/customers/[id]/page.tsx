import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { summarizeCustomerActivity, getAdminCustomer } from "@/lib/commerce/admin-customers";
import { formatOrderTotal } from "@/lib/commerce/admin-orders";
import { favoritePreviewImage } from "@/lib/commerce/favorites";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const customer = await getAdminCustomer(id);
  if (!customer) notFound();

  const summary = summarizeCustomerActivity(customer);

  return (
    <main className="admin-shell">
      <AdminNav />
      <Link className="text-link" href="/admin/customers">
        Back to customers
      </Link>
      <section className="admin-detail-hero">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>{customer.name ?? customer.email}</h1>
          <p>{customer.email}</p>
          <small>Joined {dateFormatter.format(customer.createdAt)}</small>
        </div>
        <div className="admin-metrics">
          <span>
            <strong>{summary.orderCount}</strong>
            Orders
          </span>
          <span>
            <strong>{formatOrderTotal(summary.paidSpendVnd)}</strong>
            Paid spend
          </span>
          <span>
            <strong>{summary.favoriteCount}</strong>
            Favorites
          </span>
        </div>
      </section>

      <section className="admin-section">
        <h2>Orders</h2>
        <div className="admin-list">
          {customer.orders.map((order) => (
            <Link className="admin-row" href={`/admin/orders/${order.id}`} key={order.id}>
              <span>{order.orderNumber}</span>
              <span>{dateFormatter.format(order.createdAt)}</span>
              <span>{formatOrderTotal(order.totalVnd)}</span>
              <OrderStatusBadge status={order.status} />
            </Link>
          ))}
          {customer.orders.length === 0 ? <p className="admin-empty">No orders yet.</p> : null}
        </div>
      </section>

      <section className="admin-section">
        <h2>Favorites</h2>
        <div className="admin-list">
          {customer.favorites.map((favorite) => {
            const previewImage = favoritePreviewImage(favorite);

            return (
              <Link className="admin-row admin-row-product" href={`/shop/${favorite.product.slug}`} key={favorite.id}>
                <span className="admin-product-thumb" aria-hidden="true">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" src={previewImage} />
                  ) : null}
                </span>
                <span>{favorite.product.name}</span>
                <span>{formatOrderTotal(favorite.product.priceVnd)}</span>
                <span>{favorite.product.category}</span>
              </Link>
            );
          })}
          {customer.favorites.length === 0 ? <p className="admin-empty">No favorites yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
