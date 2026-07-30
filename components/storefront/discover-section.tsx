"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "./language-provider";

const discoveries = [
  {
    altKey: "discoverBagsAlt" as TranslationKey,
    categoryKey: "categoryBags" as TranslationKey,
    href: "/shop?category=bags",
    image: "/media/discover-bags.png"
  },
  {
    altKey: "discoverShirtsAlt" as TranslationKey,
    categoryKey: "shirts" as TranslationKey,
    href: "/shop?category=shirt",
    image: "/media/discover-shirts.png"
  }
];

export function DiscoverSection() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="discover-heading" className="discover-section" id="campaign">
      <h2 id="discover-heading">{t("discover")}</h2>
      <div className="discover-grid">
        {discoveries.map((discovery) => (
          <Link className="discover-card" href={discovery.href} key={discovery.href}>
            <Image alt={t(discovery.altKey)} fill sizes="(max-width: 820px) 100vw, 50vw" src={discovery.image} />
            <span className="discover-card-scrim" />
            <span className="discover-card-content">
              <span className="discover-card-title">{t(discovery.categoryKey)}</span>
              <span className="discover-card-link">
                {t("exploreCategory", { category: t(discovery.categoryKey) })}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
