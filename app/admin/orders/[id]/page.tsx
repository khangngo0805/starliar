import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrderDeleteButton } from "@/components/admin/order-delete-button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { formatOrderTotal } from "@/lib/commerce/admin-orders";
import { prisma } from "@/lib/prisma";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  if (!order) notFound();

  return (
    <main className="admin-shell">
      <AdminNav />
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Order</p>
          <h1>{order.orderNumber}</h1>
        </div>
        <OrderDeleteButton orderId={order.id} />
      </div>
      <OrderStatusBadge status={order.status} />
      <p>
        {order.customerName} / {order.email} / {order.phone}
      </p>
      <p>
        {order.addressLine1}, {order.city}, {order.country}
      </p>
      <h2>Items</h2>
      {order.items.map((item) => (
        <article className="admin-row" key={item.id}>
          <span>{item.productName}</span>
          <span>{item.size}</span>
          <span>x {item.quantity}</span>
          <span>{formatOrderTotal(item.unitPriceVnd)}</span>
        </article>
      ))}
      <h2>Payments</h2>
      {order.payments.map((payment) => (
        <article className="admin-row" key={payment.id}>
          <span>{payment.provider}</span>
          <span>{payment.status}</span>
          <span>{formatOrderTotal(payment.amountVnd)}</span>
        </article>
      ))}
    </main>
  );
}
