import { notFound } from "next/navigation";
import Image from "next/image";
import { SiteHeader } from "@/components/storefront/site-header";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { formatVnd } from "@/lib/commerce/cart";
import { getPublishedProduct } from "@/lib/commerce/catalog";
import { getProductAvailability } from "@/lib/commerce/product-presentation";
import {
  LocalizedProductCollectionText,
  LocalizedText
} from "@/components/storefront/localized-text";

export const revalidate = 300;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();
  const availability = getProductAvailability(product.variants);
  const availabilityTextKey =
    availability.tone === "sold-out"
      ? "soldOut"
      : availability.tone === "low-stock"
        ? "lowStock"
        : availability.totalStock === 1
          ? "pieceAvailable"
          : "piecesAvailable";
  const gallery = product.media.length ? product.media : [""];

  return (
    <>
      <SiteHeader />
      <main className="product-detail">
        <section className="product-gallery" aria-label={`${product.name} imagery`}>
          <div className="product-hero-media">
            {gallery[0] ? (
              <Image alt={product.name} src={gallery[0]} fill priority sizes="(max-width: 820px) 100vw, 52vw" />
            ) : null}
          </div>
          {gallery.length > 1 ? (
            <div className="product-gallery-thumbs">
              {gallery.slice(1, 5).map((src, index) => (
                <div className="product-gallery-thumb" key={src}>
                  <Image alt={`${product.name} view ${index + 2}`} src={src} fill sizes="(max-width: 820px) 50vw, 24vw" />
                </div>
              ))}
            </div>
          ) : null}
        </section>
        <section className="product-detail-copy">
          <div className="product-copy-topline">
            <p className="eyebrow">{product.collection?.name}</p>
            <span className={`availability-pill ${availability.tone}`}>
              <LocalizedText textKey={availabilityTextKey} values={{ count: availability.totalStock }} />
            </span>
          </div>
          <h1>{product.name}</h1>
          <div className="product-detail-price-row">
            <p className="price">{formatVnd(product.priceVnd)}</p>
            <FavoriteButton productId={product.id} productName={product.name} />
          </div>
          <p>{product.description}</p>
          <VariantPicker product={product} />
          <div className="product-service-notes">
            <article>
              <span><LocalizedText textKey="fit" /></span>
              <strong><LocalizedText textKey="fitStructured" /></strong>
            </article>
            <article>
              <span><LocalizedText textKey="shipping" /></span>
              <strong><LocalizedText textKey="shippingAtCheckout" /></strong>
            </article>
          </div>
          <div className="product-info-panels">
            <details open>
              <summary><LocalizedText textKey="details" /></summary>
              <p>
                <LocalizedProductCollectionText
                  category={product.category}
                  collection={product.collection?.name ?? "Starlier"}
                />
              </p>
            </details>
            <details>
              <summary><LocalizedText textKey="sizeFit" /></summary>
              <p><LocalizedText textKey="sizeFitDescription" /></p>
            </details>
            <details>
              <summary><LocalizedText textKey="shippingReturns" /></summary>
              <p><LocalizedText textKey="shippingReturnsDescription" /></p>
            </details>
            <details>
              <summary><LocalizedText textKey="care" /></summary>
              <p><LocalizedText textKey="careDescription" /></p>
            </details>
          </div>
        </section>
      </main>
    </>
  );
}
