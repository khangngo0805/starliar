import Link from "next/link";
import { HeroVideo } from "@/components/storefront/hero-video";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export const revalidate = 300;

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <HeroVideo
        mediaSlides={[
          { src: "/media/starliar-visible-pixel-hero.mp4", type: "video" },
          { src: "/media/horsonic-hero.webp", type: "image" }
        ]}
      />
      <section className="home-section featured-section">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">New arrival</p>
            <h2 className="release-heading">Latest release</h2>
          </div>
          <Link className="text-link" href="/shop">
            View all
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
      <section className="campaign-section" id="campaign">
        <div className="campaign-copy">
          <p className="section-kicker">Campaign 2026</p>
          <h2>After dark uniform</h2>
          <p>Monochrome layers, quiet hardware, and silhouettes made for low light.</p>
        </div>
        <div className="campaign-details" aria-label="Campaign details">
          <span>Night release</span>
          <span>Structured cotton</span>
          <span>Limited run</span>
        </div>
        <Link className="campaign-link" href="/shop">
          Enter the drop
        </Link>
      </section>
      <section className="material-notes" aria-label="Collection notes">
        <article>
          <span>Material</span>
          <p>Poplin, mesh, and compact fleece balanced for sharp everyday wear.</p>
        </article>
        <article>
          <span>Palette</span>
          <p>Paper, ink, frost gray, and small cold-blue signals.</p>
        </article>
        <article>
          <span>Fit</span>
          <p>Relaxed volume with clean shoulders, cropped layers, and utility lines.</p>
        </article>
      </section>
    </main>
  );
}
