import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalizedText } from "@/components/storefront/localized-text";
import { LocalizedStatus } from "@/components/storefront/localized-status";
import { SiteHeader } from "@/components/storefront/site-header";
import { clearUserSession, getCurrentUser } from "@/lib/auth/user";
import { formatVnd } from "@/lib/commerce/cart";
import { favoritePreviewImage } from "@/lib/commerce/favorites";
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
          <p className="eyebrow"><LocalizedText textKey="starlierAccount" /></p>
          <h1><LocalizedText textKey="accountPrompt" /></h1>
          <div className="account-actions">
            <Link className="primary-link" href="/account/login">
              <LocalizedText textKey="signIn" />
            </Link>
            <Link className="text-link" href="/account/signup">
              <LocalizedText textKey="createAccount" />
            </Link>
            <Link className="text-link" href="/orders">
              <LocalizedText textKey="findGuestOrders" />
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
      include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <>
      <SiteHeader />
      <main className="account-shell">
        <section className="account-hero">
          <div>
            <p className="eyebrow"><LocalizedText textKey="account" /></p>
            <h1>{user.name ?? user.email}</h1>
            <p>{user.email}</p>
          </div>
          <form action={logout}>
            <button className="text-button" type="submit">
              <LocalizedText textKey="signOut" />
            </button>
          </form>
        </section>

        <section className="account-grid">
          <div className="account-panel">
            <div className="account-panel-heading">
              <h2><LocalizedText textKey="favorites" /></h2>
              <Link className="text-link" href="/shop">
                <LocalizedText textKey="shop" />
              </Link>
            </div>
            <div className="account-product-list">
              {favorites.length ? (
                favorites.map((favorite) => {
                  const previewImage = favoritePreviewImage(favorite);

                  return (
                    <Link className="account-product-row" href={`/shop/${favorite.product.slug}`} key={favorite.id}>
                      <span className="account-product-copy">
                        <span>{favorite.product.name}</span>
                        <small>{formatVnd(favorite.product.priceVnd)}</small>
                      </span>
                      <span className="account-product-thumb" aria-hidden="true">
                        {previewImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" src={previewImage} />
                        ) : null}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="muted"><LocalizedText textKey="noFavorites" /></p>
              )}
            </div>
          </div>

          <div className="account-panel">
            <div className="account-panel-heading">
              <h2><LocalizedText textKey="orders" /></h2>
              <Link className="text-link" href="/orders">
                <LocalizedText textKey="viewAll" />
              </Link>
            </div>
            <div className="account-order-list">
              {orders.length ? (
                orders.map((order) => (
                  <Link className="account-order-row" href={`/order/${order.orderNumber}`} key={order.id}>
                    <span>{order.orderNumber}</span>
                    <small><LocalizedStatus status={order.status} /></small>
                    <strong>{formatVnd(order.totalVnd)}</strong>
                  </Link>
                ))
              ) : (
                <p className="muted"><LocalizedText textKey="signedInOrdersEmpty" /></p>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
