import { notFound } from "next/navigation";
import Image from "next/image";
import { SiteHeader } from "@/components/storefront/site-header";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { formatVnd } from "@/lib/commerce/cart";
import { getPublishedProduct } from "@/lib/commerce/catalog";
import { getProductAvailability } from "@/lib/commerce/product-presentation";

export const revalidate = 300;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();
  const availability = getProductAvailability(product.variants);
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
            <span className={`availability-pill ${availability.tone}`}>{availability.label}</span>
          </div>
          <h1>{product.name}</h1>
          <div className="product-detail-price-row">
            <p className="price">{formatVnd(product.priceVnd)}</p>
            <FavoriteButton productId={product.id} productName={product.name} />
          </div>
          <p>{product.description}</p>
          <VariantPicker product={product} />
          <div className="product-service-notes" aria-label="Product service details">
            <article>
              <span>Fit</span>
              <strong>Structured unisex silhouette</strong>
            </article>
            <article>
              <span>Shipping</span>
              <strong>Vietnam delivery prepared at checkout</strong>
            </article>
          </div>
          <div className="product-info-panels">
            <details open>
              <summary>Details</summary>
              <p>{product.category} from {product.collection?.name ?? "Starlier"} with a clean everyday finish.</p>
            </details>
            <details>
              <summary>Size & fit</summary>
              <p>Select your usual size for a regular fit, or size up for a more relaxed campaign silhouette.</p>
            </details>
            <details>
              <summary>Shipping & returns</summary>
              <p>Orders are prepared after payment confirmation. Return support is available for unworn items.</p>
            </details>
            <details>
              <summary>Care</summary>
              <p>Cold gentle wash, dry flat, and avoid direct heat to preserve the garment surface.</p>
            </details>
          </div>
        </section>
      </main>
    </>
  );
}
