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
      <main className="page-shell">
        <h1>Order {order.orderNumber}</h1>
        <p>Order status: {order.status}</p>
        <p>Payment status: {payment?.status ?? "PENDING"}</p>
        <p>Total: {formatVnd(order.totalVnd)}</p>
        <div className="cart-lines">
          {order.items.map((item) => (
            <article className="cart-line" key={item.id}>
              <span>
                {item.productName} / {item.size}
              </span>
              <span>x {item.quantity}</span>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
