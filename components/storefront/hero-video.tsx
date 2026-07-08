"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { SiteHeader } from "./site-header";

type HeroVideoProps = {
  src?: string;
  slides?: string[];
  intervalMs?: number;
};

export function HeroVideo({ src, slides, intervalMs = 5500 }: HeroVideoProps) {
  const resolvedSlides = slides?.length ? slides : src ? [src] : [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isResettingTrack, setIsResettingTrack] = useState(false);
  const activeSlideIndex = resolvedSlides.length ? activeSlide % resolvedSlides.length : 0;
  const renderedSlides = resolvedSlides.length > 1 ? [...resolvedSlides, resolvedSlides[0]] : resolvedSlides;
  const trackStyle = { "--hero-slide-index": activeSlide } as CSSProperties;
  const progressStyle = { "--hero-slide-count": resolvedSlides.length } as CSSProperties;

  useEffect(() => {
    if (resolvedSlides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, resolvedSlides.length]);

  const handleTrackTransitionEnd = () => {
    if (activeSlide < resolvedSlides.length) {
      return;
    }

    setIsResettingTrack(true);
    setActiveSlide(0);
  };

  useEffect(() => {
    if (!isResettingTrack) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsResettingTrack(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isResettingTrack]);

  return (
    <section className="hero-video">
      <div
        className={["hero-track", isResettingTrack ? "hero-track-resetting" : ""].filter(Boolean).join(" ")}
        onTransitionEnd={handleTrackTransitionEnd}
        style={trackStyle}
        data-testid="hero-track"
      >
        {renderedSlides.map((slide, index) => (
          <div
            aria-hidden={index % resolvedSlides.length !== activeSlideIndex}
            className={["hero-slide", index % resolvedSlides.length === activeSlideIndex ? "hero-slide-active" : ""].filter(Boolean).join(" ")}
            data-testid="hero-slide"
            key={`${slide}-${index}`}
          >
            <Image
              className="hero-video-media"
              alt=""
              src={slide}
              fill
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
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
      <div className="hero-progress" style={progressStyle} aria-hidden="true">
        {resolvedSlides.map((slide, index) => (
          <span className={index === activeSlideIndex ? "hero-progress-active" : ""} key={slide} />
        ))}
      </div>
    </section>
  );
}
