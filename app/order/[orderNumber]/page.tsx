import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/storefront/site-header";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/commerce/cart";

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, items: true }
  });
  if (!order) notFound();
  const payment = order.payments[0];

  return (
    <>
      <SiteHeader />
      <main className="order-shell">
        <section className="order-hero">
          <p className="eyebrow">Order confirmation</p>
          <h1>{order.orderNumber}</h1>
          <p>
            We created the order and are tracking payment status through the provider callback.
          </p>
        </section>
        <section className="order-grid">
          <div className="order-panel">
            <h2>Items</h2>
            <div className="order-lines">
              {order.items.map((item) => (
                <article className="order-line" key={item.id}>
                  <div>
                    <strong>{item.productName}</strong>
                    <p>Size {item.size} / Qty {item.quantity}</p>
                  </div>
                  <span>{formatVnd(item.unitPriceVnd * item.quantity)}</span>
                </article>
              ))}
            </div>
          </div>
          <aside className="order-panel order-status-panel">
            <h2>Status</h2>
            <div className="status-row">
              <span>Order</span>
              <strong>{order.status.replaceAll("_", " ")}</strong>
            </div>
            <div className="status-row">
              <span>Payment</span>
              <strong>{payment?.status ?? "PENDING"}</strong>
            </div>
            <div className="status-row total">
              <span>Total</span>
              <strong>{formatVnd(order.totalVnd)}</strong>
            </div>
          </aside>
          <aside className="order-panel">
            <h2>Shipping</h2>
            <p>{order.customerName}</p>
            <p>{order.addressLine1}</p>
            <p>
              {order.city}, {order.country}
            </p>
          </aside>
        </section>
      </main>
    </>
  );
}
