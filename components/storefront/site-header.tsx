"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchDialog } from "./search-dialog";
import { CartLink } from "./cart-link";
import { categoryToParam, shopCategories } from "@/lib/commerce/categories";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(!overlay);

  useEffect(() => {
    if (!overlay) {
      setScrolled(true);
      return;
    }

    const updateScrolled = () => {
      const lowerHeroThreshold = Math.max(320, window.innerHeight * 0.86);
      setScrolled(window.scrollY >= lowerHeroThreshold);
    };
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, [overlay]);

  const className = ["site-header", overlay ? "site-header-overlay" : "", scrolled ? "site-header-scrolled" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={className}>
      <nav className="site-header-nav" aria-label="Primary navigation">
        <div className="nav-dropdown">
          <Link href="/shop">Shop</Link>
          <div className="nav-dropdown-panel">
            <Link href="/shop">View all</Link>
            {shopCategories.map((category) => (
              <Link href={`/shop?category=${categoryToParam(category)}`} key={category}>
                {category}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#campaign">Campaign</Link>
      </nav>
      <Link className="site-logo" href="/">
        STARLIAR
      </Link>
      <div className="site-header-actions">
        <SearchDialog />
        <Link aria-label="Account" className="icon-link" href="/account">
          <UserRound size={21} />
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
