"use client";

import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/commerce/favorite-button";
import { formatVnd } from "@/lib/commerce/cart";
import { categoryLabel } from "@/lib/commerce/categories";
import { categoryTranslationKey, useLanguage } from "./language-provider";

type GridProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceVnd: number;
  media: string[];
};

export function ProductGrid({ products }: { products: GridProduct[] }) {
  const { t } = useLanguage();

  if (!products.length) {
    return <p className="muted">{t("emptyProducts")}</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <FavoriteButton compact productId={product.id} productName={product.name} />
          <Link className="product-card-link" href={`/shop/${product.slug}`}>
            <div className="product-card-media">
              {product.media[0] ? (
                <>
                  <Image alt={product.name} className="product-card-image product-card-image-primary" src={product.media[0]} fill sizes="(max-width: 820px) 100vw, 25vw" />
                  {product.media[1] ? (
                    <Image alt={`${product.name} alternate view`} className="product-card-image product-card-image-secondary" src={product.media[1]} fill sizes="(max-width: 820px) 100vw, 25vw" />
                  ) : null}
                </>
              ) : (
                <div className="media-fallback">{product.name}</div>
              )}
            </div>
            <div className="product-card-meta">
              <div>
                <small>
                  {categoryTranslationKey(product.category)
                    ? t(categoryTranslationKey(product.category)!)
                    : categoryLabel(product.category)}
                </small>
                <span className="product-card-name">{product.name}</span>
                <span className="product-card-stock">{t("inStock")}</span>
              </div>
              <span className="product-card-price">{formatVnd(product.priceVnd)}</span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
