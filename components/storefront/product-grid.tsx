import Link from "next/link";
import { formatVnd } from "@/lib/commerce/cart";

type GridProduct = {
  id: string;
  slug: string;
  name: string;
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
        <Link className="product-card" href={`/shop/${product.slug}`} key={product.id}>
          <div className="product-card-media">
            {product.media[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={product.name} src={product.media[0]} />
            ) : (
              <div className="media-fallback">{product.name}</div>
            )}
          </div>
          <div className="product-card-meta">
            <span>{product.name}</span>
            <span>{formatVnd(product.priceVnd)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
