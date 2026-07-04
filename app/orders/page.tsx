import Link from "next/link";
import { GuestOrderLookup } from "@/components/commerce/guest-order-lookup";
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
            <p className="eyebrow">Orders</p>
            <h1>{user ? "Your order history" : "Order history"}</h1>
            <p>{user ? user.email : "Search guest orders using the same email and phone from checkout."}</p>
          </div>
          {!user ? (
            <div className="account-actions">
              <Link className="text-link" href="/account/login?next=/orders">
                Sign in
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
                      <small>{order.items.length} item{order.items.length === 1 ? "" : "s"}</small>
                    </span>
                    <small>
                      {order.status.replaceAll("_", " ")} / {order.payments[0]?.status ?? "PENDING"}
                    </small>
                    <strong>{formatVnd(order.totalVnd)}</strong>
                  </Link>
                ))
              ) : (
                <p className="muted">Orders placed while signed in will appear here.</p>
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
