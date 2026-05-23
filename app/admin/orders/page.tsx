import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { formatOrderTotal, getAdminOrders } from "@/lib/commerce/admin-orders";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <main className="admin-shell">
      <AdminNav />
      <h1>Orders</h1>
      <div className="admin-list">
        {orders.map((order) => (
          <Link className="admin-row" href={`/admin/orders/${order.id}`} key={order.id}>
            <span>{order.orderNumber}</span>
            <span>{order.customerName}</span>
            <span>{formatOrderTotal(order.totalVnd)}</span>
            <OrderStatusBadge status={order.status} />
          </Link>
        ))}
      </div>
    </main>
  );
}
