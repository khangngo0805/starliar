import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { formatVnd } from "@/lib/commerce/cart";

type GridProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceVnd: number;
  media: string[];
};

export function ProductGrid({ products }: { products: GridProduct[] }) {
  if (!products.length) {
    return <p className="muted">No products are visible yet.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <FavoriteButton compact productId={product.id} productName={product.name} />
          <Link className="product-card-link" href={`/shop/${product.slug}`}>
            <div className="product-card-media">
              {product.media[0] ? (
                <Image
                  alt={product.name}
                  src={product.media[0]}
                  fill
                  sizes="(max-width: 820px) 100vw, 25vw"
                />
              ) : (
                <div className="media-fallback">{product.name}</div>
              )}
            </div>
            <div className="product-card-meta">
              <div>
                <small>{product.category}</small>
                <span className="product-card-name">{product.name}</span>
              </div>
              <span className="product-card-price">{formatVnd(product.priceVnd)}</span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
