"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { SiteHeader } from "./site-header";
import { useLanguage } from "./language-provider";

type HeroVideoProps = {
  mediaSlides?: Array<{
    src: string;
    type: "image" | "video";
  }>;
  src?: string;
  slides?: string[];
  videoSrc?: string;
  intervalMs?: number;
};

export function HeroVideo({ mediaSlides, src, slides, videoSrc, intervalMs = 5500 }: HeroVideoProps) {
  const { t } = useLanguage();
  const resolvedMediaSlides =
    mediaSlides?.length
      ? mediaSlides
      : slides?.length
        ? slides.map((slide) => ({ src: slide, type: "image" as const }))
        : src
          ? [{ src, type: "image" as const }]
          : [];
  const shouldRenderSingleVideo = Boolean(videoSrc && !mediaSlides?.length);
  const resolvedSlides = resolvedMediaSlides.map((slide) => slide.src);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isResettingTrack, setIsResettingTrack] = useState(false);
  const activeSlideIndex = resolvedMediaSlides.length ? activeSlide % resolvedMediaSlides.length : 0;
  const renderedSlides = resolvedMediaSlides.length > 1 ? [...resolvedMediaSlides, resolvedMediaSlides[0]] : resolvedMediaSlides;
  const trackStyle = { "--hero-slide-index": activeSlide } as CSSProperties;
  const progressStyle = { "--hero-slide-count": resolvedMediaSlides.length } as CSSProperties;

  useEffect(() => {
    if (resolvedMediaSlides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, resolvedMediaSlides.length]);

  const handleTrackTransitionEnd = () => {
    if (activeSlide < resolvedMediaSlides.length) {
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
      {shouldRenderSingleVideo ? (
        <video
          aria-hidden="true"
          autoPlay
          className="hero-video-media"
          data-testid="hero-video-media"
          loop
          muted
          playsInline
          preload="auto"
          src={videoSrc}
        />
      ) : (
        <div
          className={["hero-track", isResettingTrack ? "hero-track-resetting" : ""].filter(Boolean).join(" ")}
          onTransitionEnd={handleTrackTransitionEnd}
          style={trackStyle}
          data-testid="hero-track"
        >
          {renderedSlides.map((slide, index) => (
            <div
              aria-hidden={index % resolvedMediaSlides.length !== activeSlideIndex}
              className={["hero-slide", index % resolvedMediaSlides.length === activeSlideIndex ? "hero-slide-active" : ""].filter(Boolean).join(" ")}
              data-testid="hero-slide"
              key={`${slide.src}-${index}`}
            >
              {slide.type === "video" ? (
                <video
                  aria-hidden="true"
                  autoPlay
                  className="hero-video-media"
                  data-testid="hero-video-slide"
                  loop
                  muted
                  playsInline
                  preload="auto"
                  src={slide.src}
                />
              ) : (
                <Image
                  className="hero-video-media"
                  alt=""
                  src={slide.src}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="hero-video-scrim" />
      <SiteHeader overlay />
      <div className="hero-video-content">
        <h1 className="hero-kicker">{t("firstSignal").toUpperCase()}</h1>
        <div className="hero-actions">
          <Link className="pill-button pill-button-filled" href="/shop">
            {t("shopNow")}
          </Link>
          <Link className="pill-button" href="#campaign">
            {t("viewCampaign")}
          </Link>
        </div>
      </div>
      {shouldRenderSingleVideo ? null : (
        <div className="hero-progress" style={progressStyle} aria-hidden="true">
          {resolvedSlides.map((slide, index) => (
            <span className={index === activeSlideIndex ? "hero-progress-active" : ""} key={slide} />
          ))}
        </div>
      )}
    </section>
  );
}
