"use client";

import { useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";
import { BuyNowButton } from "./buy-now-button";

type VariantProduct = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  media?: string[];
  priceVnd: number;
  variants: { id: string; size: string; stock: number }[];
};

export function VariantPicker({ product }: { product: VariantProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const selected = product.variants.find((variant) => variant.id === variantId);

  return (
    <div className="variant-picker">
      <fieldset>
        <legend>Size</legend>
        <div className="size-options">
          {product.variants.map((variant) => (
            <button
              className={variant.id === variantId ? "selected" : ""}
              disabled={variant.stock < 1}
              key={variant.id}
              onClick={() => setVariantId(variant.id)}
              type="button"
            >
              {variant.size}
            </button>
          ))}
        </div>
      </fieldset>
      {selected ? (
        <div className="product-actions">
          <BuyNowButton variant={selected} />
          <AddToCartButton product={product} variant={selected} />
        </div>
      ) : null}
    </div>
  );
}
