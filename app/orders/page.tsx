import Link from "next/link";
import { GuestOrderLookup } from "@/components/commerce/guest-order-lookup";
import { LocalizedText } from "@/components/storefront/localized-text";
import { LocalizedStatus } from "@/components/storefront/localized-status";
import { SiteHeader } from "@/components/storefront/site-header";
import { getCurrentUser } from "@/lib/auth/user";
import { formatVnd } from "@/lib/commerce/cart";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <>
      <SiteHeader />
      <main className="account-shell">
        <section className="account-hero">
          <div>
            <p className="eyebrow"><LocalizedText textKey="orders" /></p>
            <h1><LocalizedText textKey={user ? "yourOrderHistory" : "orderHistory"} /></h1>
            <p>{user ? user.email : <LocalizedText textKey="guestOrderHistoryDescription" />}</p>
          </div>
          {!user ? (
            <div className="account-actions">
              <Link className="text-link" href="/account/login?next=/orders">
                <LocalizedText textKey="signIn" />
              </Link>
            </div>
          ) : null}
        </section>

        {user ? (
          <section className="account-panel">
            <div className="account-order-list">
              {orders.length ? (
                orders.map((order) => (
                  <Link className="account-order-row" href={`/order/${order.orderNumber}`} key={order.id}>
                    <span>
                      {order.orderNumber}
                      <small>
                        <LocalizedText
                          textKey={order.items.length === 1 ? "cartItemCount" : "cartItemCountPlural"}
                          values={{ count: order.items.length }}
                        />
                      </small>
                    </span>
                    <small>
                      <LocalizedStatus status={order.status} /> /{" "}
                      <LocalizedStatus status={order.payments[0]?.status ?? "PENDING"} />
                    </small>
                    <strong>{formatVnd(order.totalVnd)}</strong>
                  </Link>
                ))
              ) : (
                <p className="muted"><LocalizedText textKey="signedInOrdersEmpty" /></p>
              )}
            </div>
          </section>
        ) : (
          <GuestOrderLookup />
        )}
      </main>
    </>
  );
}
