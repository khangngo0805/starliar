"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchDialog } from "./search-dialog";
import { CartLink } from "./cart-link";
import { categoryToParam, shopCategories } from "@/lib/commerce/categories";
import { useLanguage, type StorefrontLanguage } from "./language-provider";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [heroScrolled, setHeroScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const updateScrolled = () => {
      const lowerHeroThreshold = Math.max(320, window.innerHeight * 0.86);
      setHeroScrolled(window.scrollY >= lowerHeroThreshold);
    };
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, [overlay]);

  const scrolled = overlay ? heroScrolled : true;
  const className = ["site-header", overlay ? "site-header-overlay" : "", scrolled ? "site-header-scrolled" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={className}>
      <nav className="site-header-nav" aria-label="Primary navigation">
        <div className="nav-dropdown">
          <Link href="/shop">{t("shop")}</Link>
          <div className="nav-dropdown-panel">
            <Link href="/shop">{t("shopAll")}</Link>
            {shopCategories.map((category) => (
              <Link href={`/shop?category=${categoryToParam(category)}`} key={category}>
                {category}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#campaign">{t("campaign")}</Link>
      </nav>
      <Link className="site-logo" href="/">
        STARLIAR
      </Link>
      <div className="site-header-actions">
        <div className="language-switcher" aria-label="Language">
          {(["en", "vi"] as StorefrontLanguage[]).map((option) => (
            <button
              aria-label={option === "en" ? t("languageEnglish") : t("languageVietnamese")}
              aria-pressed={language === option}
              className={language === option ? "language-option active" : "language-option"}
              key={option}
              onClick={() => setLanguage(option)}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <SearchDialog />
        <Link aria-label="Account" className="icon-link" href="/account">
          <UserRound size={21} />
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
