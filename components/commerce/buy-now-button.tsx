"use client";

import { useRouter } from "next/navigation";
import { BUY_NOW_STORAGE_KEY } from "@/lib/commerce/cart";

export function BuyNowButton({
  product,
  variant
}: {
  product: { id: string; name: string; slug: string; category?: string; media?: string[]; priceVnd: number };
  variant: { id: string; size: string; stock: number };
}) {
  const router = useRouter();

  function buyNow() {
    window.localStorage.setItem(
      BUY_NOW_STORAGE_KEY,
      JSON.stringify([
        {
          variantId: variant.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          media: product.media?.[0],
          size: variant.size,
          priceVnd: product.priceVnd,
          quantity: 1
        }
      ])
    );
    router.push("/checkout?mode=buy-now");
  }

  return (
    <div className="buy-now-control">
      <button className="buy-now-button" disabled={variant.stock < 1} onClick={buyNow} type="button">
        Buy now
      </button>
    </div>
  );
}
