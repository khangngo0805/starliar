import Link from "next/link";
import { DiscoverSection } from "@/components/storefront/discover-section";
import { HeroVideo } from "@/components/storefront/hero-video";
import { LocalizedText } from "@/components/storefront/localized-text";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export const revalidate = 300;

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <HeroVideo
        mediaSlides={[
          { src: "/media/starliar-hero-2026-08-24.mov", type: "video" },
          { src: "/media/horsonic-hero.webp", type: "image" }
        ]}
      />
      <section className="home-section featured-section">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker"><LocalizedText textKey="newArrival" /></p>
            <h2 className="release-heading">
              <LocalizedText textKey="latestRelease" />
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            <LocalizedText textKey="shopAll" />
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
      <DiscoverSection />
    </main>
  );
}
