import Link from "next/link";
import { HeroVideo } from "@/components/storefront/hero-video";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <HeroVideo src="/media/starliar-hero.mp4" />
      <section className="home-section">
        <div>
          <h2>Latest: Starliar New Arrival</h2>
          <Link className="text-link" href="/shop">
            More
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
      <section className="campaign-section" id="campaign">
        <p>Cold silhouettes for a first signal after dark.</p>
        <span>2026 Collection</span>
      </section>
    </main>
  );
}
