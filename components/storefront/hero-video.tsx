import Link from "next/link";
import { SiteHeader } from "./site-header";

export function HeroVideo({ src }: { src: string }) {
  return (
    <section className="hero-video">
      <video className="hero-video-media" autoPlay muted loop playsInline src={src} />
      <div className="hero-video-scrim" />
      <SiteHeader overlay />
      <div className="hero-video-content">
        <p className="hero-kicker">First Signal</p>
        <div className="hero-actions">
          <Link className="pill-button" href="/shop">
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
