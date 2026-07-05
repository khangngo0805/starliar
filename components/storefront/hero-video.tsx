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
        <h1 className="hero-kicker">FIRST SIGNAL</h1>
        <div className="hero-actions">
          <Link className="pill-button pill-button-filled" href="/shop">
            Shop Now
          </Link>
          <Link className="pill-button" href="#campaign">
            View Campaign
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
