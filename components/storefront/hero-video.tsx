import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./site-header";

export function HeroVideo({ src }: { src: string }) {
  return (
    <section className="hero-video">
      <Image
        className="hero-video-media"
        alt=""
        src={src}
        fill
        priority
        sizes="100vw"
      />
      <div className="hero-video-scrim" />
      <SiteHeader overlay />
      <div className="hero-video-content">
        <p className="hero-eyebrow">Starliar / 2026 Collection</p>
        <h1 className="hero-kicker">First Signal</h1>
        <p className="hero-summary">
          Quiet luxury structure cut with dark streetwear attitude.
        </p>
        <div className="hero-actions">
          <Link className="pill-button pill-button-filled" href="/shop">
            Shop the drop
          </Link>
          <Link className="pill-button" href="#campaign">
            View campaign
          </Link>
        </div>
      </div>
      <div className="hero-progress" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
