import { SiteHeader } from "@/components/storefront/site-header";
import { ProductGrid } from "@/components/storefront/product-grid";
import { categoryToParam, getFeaturedProducts, paramToCategory, shopCategories } from "@/lib/commerce/catalog";
import Link from "next/link";

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const activeCategory = paramToCategory(categoryParam);
  const products = await getFeaturedProducts(activeCategory);

  return (
    <>
      <SiteHeader />
      <main className="shop-shell">
        <div className="shop-hero">
          <p className="eyebrow">First Signal</p>
          <h1>{activeCategory ?? "Shop"}</h1>
          <p>
            Unisex clothing and accessories for testing the full Starliar buying flow.
          </p>
        </div>
        <div className="shop-toolbar">
          <Link className={!activeCategory ? "category-chip active" : "category-chip"} href="/shop">
            All
          </Link>
          {shopCategories.map((category) => (
            <Link
              className={activeCategory === category ? "category-chip active" : "category-chip"}
              href={`/shop?category=${categoryToParam(category)}`}
              key={category}
            >
              {category}
            </Link>
          ))}
        </div>
        <ProductGrid products={products} />
      </main>
    </>
  );
}
