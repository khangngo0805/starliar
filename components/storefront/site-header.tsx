"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchDialog } from "./search-dialog";
import { CartLink } from "./cart-link";
import { categoryLabel, categoryToParam, shopCategories } from "@/lib/commerce/categories";
import { categoryTranslationKey, useLanguage } from "./language-provider";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [heroScrolled, setHeroScrolled] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

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
      <nav className="site-header-nav" aria-label={t("primaryNavigation")}>
        <div className="nav-dropdown">
          <Link href="/shop">{t("shop")}</Link>
          <div className="nav-dropdown-panel">
            <Link href="/shop">{t("shopAll")}</Link>
            {shopCategories.map((category) => (
              <Link href={`/shop?category=${categoryToParam(category)}`} key={category}>
                {categoryTranslationKey(category)
                  ? t(categoryTranslationKey(category)!)
                  : categoryLabel(category)}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#campaign">{t("campaign")}</Link>
      </nav>
      <Link className="site-logo" href="/">
        STARLIER
      </Link>
      <div className="site-header-actions">
        <button
          aria-label={language === "en" ? t("switchToVietnamese") : t("switchToEnglish")}
          className={`language-switcher language-switcher-${language}`}
          onClick={toggleLanguage}
          type="button"
        >
          <span className={language === "en" ? "language-option active" : "language-option"}>EN</span>
          <span className={language === "vi" ? "language-option active" : "language-option"}>VI</span>
        </button>
        <SearchDialog />
        <Link aria-label={t("account")} className="icon-link" href="/account">
          <UserRound size={21} />
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
