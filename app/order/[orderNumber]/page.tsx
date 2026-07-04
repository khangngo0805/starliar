import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderStatusPanel } from "@/components/commerce/order-status-panel";
import { SePayQrPanel } from "@/components/commerce/sepay-qr-panel";
import { SiteHeader } from "@/components/storefront/site-header";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/commerce/cart";
import { createOrderStatusPayload } from "@/lib/commerce/order-status";
import { buildSePayQrUrl, getSePayConfig } from "@/lib/payments/sepay";

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, items: true }
  });
  if (!order) notFound();
  const payment = order.payments[0];
  const sePayConfig = getSePayConfig();
  const sePayQrUrl =
    payment?.provider === "sepay" && sePayConfig
      ? buildSePayQrUrl({
          ...sePayConfig,
          amountVnd: order.totalVnd,
          description: order.orderNumber
        })
      : null;

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
          <div className="order-hero-actions">
            <Link className="primary-link" href="/shop">
              Continue shopping
            </Link>
          </div>
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
          <OrderStatusPanel
            orderNumber={order.orderNumber}
            initialStatus={createOrderStatusPayload({
              orderStatus: order.status,
              paymentStatus: payment?.status
            })}
            qrIssuedAtMs={sePayQrUrl && payment ? payment.createdAt.getTime() : undefined}
            totalVnd={order.totalVnd}
          />
          {sePayQrUrl && sePayConfig && payment ? (
            <SePayQrPanel
              accountHolder={sePayConfig.accountHolder}
              accountNumber={sePayConfig.accountNumber}
              bankName={sePayConfig.bankName}
              issuedAtMs={payment.createdAt.getTime()}
              orderNumber={order.orderNumber}
              qrUrl={sePayQrUrl}
            />
          ) : null}
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
