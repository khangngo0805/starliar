import { SiteHeader } from "@/components/storefront/site-header";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export default async function ShopPage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <div className="page-heading">
          <h1>Shop</h1>
          <p>First Signal unisex clothing and accessories.</p>
        </div>
        <ProductGrid products={products} />
      </main>
    </>
  );
}
