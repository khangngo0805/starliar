"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import { categoryToParam, paramToCategory, shopCategories } from "@/lib/commerce/categories";

type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceVnd: number;
  media: string[];
};

export function ShopCatalog({
  products,
  initialCategory
}: {
  products: ShopProduct[];
  initialCategory: string | null;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    const syncCategoryFromUrl = () => {
      setActiveCategory(paramToCategory(new URLSearchParams(window.location.search).get("category")));
    };

    syncCategoryFromUrl();
    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => window.removeEventListener("popstate", syncCategoryFromUrl);
  }, []);

  const visibleProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  useEffect(() => {
    const hrefs = visibleProducts.slice(0, 8).map((product) => `/shop/${product.slug}`);
    const prefetch = () => hrefs.forEach((href) => router.prefetch(href));

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetch, 450);
    return () => clearTimeout(id);
  }, [router, visibleProducts]);

  function selectCategory(category: string | null) {
    setActiveCategory(category);
    const nextUrl = category ? `/shop?category=${categoryToParam(category)}` : "/shop";
    window.history.pushState({}, "", nextUrl);
  }

  return (
    <>
      <div className="shop-hero">
        <p className="eyebrow">First Signal</p>
        <h1>{activeCategory ?? "Shop"}</h1>
        <p>Unisex clothing and accessories for testing the full Starliar buying flow.</p>
      </div>
      <div className="shop-toolbar" aria-label="Product categories">
        <button
          className={!activeCategory ? "category-chip active" : "category-chip"}
          onClick={() => selectCategory(null)}
          type="button"
        >
          All
        </button>
        {shopCategories.map((category) => (
          <button
            className={activeCategory === category ? "category-chip active" : "category-chip"}
            key={category}
            onClick={() => selectCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
      <div data-testid="shop-product-grid">
        <ProductGrid products={visibleProducts} />
      </div>
    </>
  );
}
