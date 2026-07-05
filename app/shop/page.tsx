import { SiteHeader } from "@/components/storefront/site-header";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts, paramToCategory } from "@/lib/commerce/catalog";

export const revalidate = 300;

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const activeCategory = paramToCategory(categoryParam);
  const products = await getShopProducts();

  return (
    <>
      <SiteHeader />
      <main className="shop-shell">
        <ShopCatalog initialCategory={activeCategory} products={products} />
      </main>
    </>
  );
}
