import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/storefront/site-header";
import { clearUserSession, getCurrentUser } from "@/lib/auth/user";
import { formatVnd } from "@/lib/commerce/cart";
import { prisma } from "@/lib/prisma";

async function logout() {
  "use server";
  await clearUserSession();
  redirect("/");
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="account-shell account-guest">
          <p className="eyebrow">Starliar account</p>
          <h1>Sign in to save favorites and see your orders.</h1>
          <div className="account-actions">
            <Link className="primary-link" href="/account/login">
              Sign in
            </Link>
            <Link className="text-link" href="/account/signup">
              Create account
            </Link>
          </div>
        </main>
      </>
    );
  }

  const [orders, favorites] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <>
      <SiteHeader />
      <main className="account-shell">
        <section className="account-hero">
          <div>
            <p className="eyebrow">Account</p>
            <h1>{user.name ?? user.email}</h1>
            <p>{user.email}</p>
          </div>
          <form action={logout}>
            <button className="text-button" type="submit">
              Sign out
            </button>
          </form>
        </section>

        <section className="account-grid">
          <div className="account-panel">
            <div className="account-panel-heading">
              <h2>Favorites</h2>
              <Link className="text-link" href="/shop">
                Shop
              </Link>
            </div>
            <div className="account-product-list">
              {favorites.length ? (
                favorites.map((favorite) => (
                  <Link className="account-product-row" href={`/shop/${favorite.product.slug}`} key={favorite.id}>
                    <span>{favorite.product.name}</span>
                    <small>{formatVnd(favorite.product.priceVnd)}</small>
                  </Link>
                ))
              ) : (
                <p className="muted">No favorites yet.</p>
              )}
            </div>
          </div>

          <div className="account-panel">
            <div className="account-panel-heading">
              <h2>Orders</h2>
              <Link className="text-link" href="/cart">
                Cart
              </Link>
            </div>
            <div className="account-order-list">
              {orders.length ? (
                orders.map((order) => (
                  <Link className="account-order-row" href={`/order/${order.orderNumber}`} key={order.id}>
                    <span>{order.orderNumber}</span>
                    <small>{order.status.replaceAll("_", " ")}</small>
                    <strong>{formatVnd(order.totalVnd)}</strong>
                  </Link>
                ))
              ) : (
                <p className="muted">Orders placed while signed in will appear here.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
