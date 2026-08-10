"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ name, media }: { name: string; media: string[] }) {
  const gallery = media.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="product-gallery" aria-label={`${name} imagery`}>
      <div className="product-hero-media">
        {gallery[activeIndex] ? (
          <Image alt={`${name} view ${activeIndex + 1}`} src={gallery[activeIndex]} fill priority sizes="(max-width: 820px) 100vw, 52vw" />
        ) : null}
      </div>
      {gallery.length > 1 ? (
        <div className="product-gallery-thumbs">
          {gallery.slice(0, 5).map((src, index) => (
            <button
              aria-label={`Show ${name} view ${index + 1}`}
              className={index === activeIndex ? "product-gallery-thumb active" : "product-gallery-thumb"}
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
            >
              <Image alt={`${name} thumbnail ${index + 1}`} src={src} fill sizes="(max-width: 820px) 50vw, 24vw" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
