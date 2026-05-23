import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/storefront/site-header";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { formatVnd } from "@/lib/commerce/cart";
import { getPublishedProduct } from "@/lib/commerce/catalog";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="product-detail">
        <div className="product-hero-media">
          {product.media[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={product.name} src={product.media[0]} />
          ) : null}
        </div>
        <section className="product-detail-copy">
          <p className="eyebrow">{product.collection?.name}</p>
          <h1>{product.name}</h1>
          <p className="price">{formatVnd(product.priceVnd)}</p>
          <p>{product.description}</p>
          <VariantPicker product={product} />
        </section>
      </main>
    </>
  );
}
