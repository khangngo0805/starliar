"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  categoryLabel,
  categoryToParam,
  isStorefrontCategory,
  normalizeStorefrontCategory,
  shopCategories
} from "@/lib/commerce/categories";
import { categoryTranslationKey, useLanguage } from "./language-provider";

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
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const visibleProducts = useMemo(() => {
    const storefrontProducts = products.flatMap((product) => {
      if (!isStorefrontCategory(product.category)) return [];
      return [{ ...product, category: normalizeStorefrontCategory(product.category)! }];
    });
    if (!activeCategory) return storefrontProducts;
    return storefrontProducts.filter((product) => product.category === activeCategory);
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

  function localizedCategory(category: string) {
    const key = categoryTranslationKey(category);
    return key ? t(key) : categoryLabel(category);
  }

  const categoryToolbar = (
    <div className="shop-toolbar" aria-label={t("productCategories")}>
      <button
        className={!activeCategory ? "category-chip active" : "category-chip"}
        onClick={() => selectCategory(null)}
        type="button"
      >
        {t("all")}
      </button>
      {shopCategories.map((category) => (
        <button
          className={activeCategory === category ? "category-chip active" : "category-chip"}
          key={category}
          onClick={() => selectCategory(category)}
          type="button"
        >
          {localizedCategory(category)}
        </button>
      ))}
    </div>
  );

  const isShirtCategory = activeCategory === "Shirt";

  return (
    <>
      {isShirtCategory ? (
        <>
          {categoryToolbar}
          <section className="shop-category-hero shop-category-hero-shirt">
            <Image
              alt=""
              fill
              priority
              sizes="100vw"
              src="/media/shirt-category-hero.png"
            />
            <div className="shop-category-hero-scrim" />
            <div className="shop-category-hero-copy">
              <nav aria-label={t("shopBreadcrumb")} className="shop-breadcrumb">
                <span>{t("firstSignal")}</span>
                <span aria-hidden="true">/</span>
                <span>{localizedCategory(activeCategory)}</span>
              </nav>
              <h1>{localizedCategory(activeCategory)}</h1>
              <p className="shop-description">{t("shopDescription")}</p>
              <p className="shop-stock-summary">
                {t("shopStockSummary", { count: visibleProducts.length })}
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="shop-hero">
            <nav aria-label={t("shopBreadcrumb")} className="shop-breadcrumb">
              <span>{t("firstSignal")}</span>
              <span aria-hidden="true">/</span>
              <span>{activeCategory ? localizedCategory(activeCategory) : t("shop")}</span>
            </nav>
            <h1>{activeCategory ? localizedCategory(activeCategory) : t("shop")}</h1>
            <p className="shop-description">{t("shopDescription")}</p>
            <p className="shop-stock-summary">{t("shopStockSummary", { count: visibleProducts.length })}</p>
          </div>
          {categoryToolbar}
        </>
      )}
      <div data-testid="shop-product-grid">
        <ProductGrid products={visibleProducts} />
      </div>
    </>
  );
}
