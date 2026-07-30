"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { formatVnd } from "@/lib/commerce/cart";
import { useLanguage } from "./language-provider";

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  priceVnd: number;
  collection: string;
  media: string[];
};

type SearchPreviewProduct = Omit<SearchProduct, "id"> & { id?: string };

const searchTrendProducts: SearchPreviewProduct[] = [
  {
    slug: "trace-cap",
    name: "Trace Cap",
    priceVnd: 690000,
    collection: "First Signal",
    media: ["/media/placeholders/static-crossbody.svg"]
  },
  {
    slug: "orbital-shell-jacket",
    name: "Orbital Shell",
    priceVnd: 2890000,
    collection: "First Signal",
    media: ["/media/placeholders/orbital-shell.svg"]
  },
  {
    slug: "lowlight-cargo-trouser",
    name: "Lowlight Cargo",
    priceVnd: 2190000,
    collection: "First Signal",
    media: ["/media/placeholders/signal-trouser.svg"]
  },
  {
    slug: "nocturne-layer-shirt",
    name: "Nocturne Layer",
    priceVnd: 1590000,
    collection: "First Signal",
    media: ["/media/placeholders/nocturne-shirt.svg"]
  },
  {
    slug: "cold-cut-short",
    name: "Cold Cut Short",
    priceVnd: 1490000,
    collection: "First Signal",
    media: ["/media/placeholders/signal-trouser.svg"]
  }
];

const recentlyViewedProducts: SearchPreviewProduct[] = [
  {
    slug: "cold-cut-short",
    name: "Cold Cut Short",
    priceVnd: 1490000,
    collection: "First Signal",
    media: ["/media/placeholders/signal-trouser.svg"]
  }
];

function safelyAbort(controller: AbortController) {
  try {
    controller.abort();
  } catch (error) {
    if (isAbortCleanupError(error)) return;
    throw error;
  }
}

function isAbortCleanupError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error) {
    return error.name === "AbortError" || error.message.toLowerCase().includes("signal is aborted");
  }
  return false;
}

function SearchProductTile({
  product,
  compact = false,
  onNavigate
}: {
  product: SearchPreviewProduct;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      className={compact ? "search-product-tile search-product-tile-compact" : "search-product-tile"}
      href={`/shop/${product.slug}`}
      onClick={onNavigate}
    >
      <span className="search-product-media" aria-hidden="true">
        {product.media[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={product.media[0]} />
        ) : null}
      </span>
      <span className="search-product-copy">
        <strong>{product.name}</strong>
        {compact ? <small>{formatVnd(product.priceVnd)}</small> : null}
      </span>
    </Link>
  );
}

export function SearchDialog() {
  const { t } = useLanguage();
  const searchInputId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmedQuery = query.trim();
  const hasSearchQuery = trimmedQuery.length >= 2;

  function closeSearch() {
    setOpen(false);
    setProducts([]);
    setQuery("");
    setLoading(false);
  }

  useEffect(() => {
    if (!open || !hasSearchQuery) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = (await response.json()) as { products: SearchProduct[] };
          setProducts(data.products);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      safelyAbort(controller);
    };
  }, [hasSearchQuery, open, trimmedQuery]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        aria-label={t("search")}
        className="icon-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search size={21} />
      </button>
      {open ? (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t("searchDialog")}>
          <div className="search-overlay-header">
            <nav>
              <Link href="/shop" onClick={closeSearch}>{t("shop")}</Link>
              <Link href="/#campaign" onClick={closeSearch}>{t("campaign")}</Link>
              <Link href="/shop?category=shirt" onClick={closeSearch}>{t("shirts")}</Link>
              <Link href="/shop?category=bags" onClick={closeSearch}>{t("bags")}</Link>
            </nav>
            <Link className="search-overlay-logo" href="/" onClick={closeSearch}>STARLIER</Link>
            <div>
              <Link href="/shop/cold-cut-short" onClick={closeSearch}>Cold Cut Short</Link>
              <Search size={21} />
            </div>
          </div>
          <button
            aria-label={t("closeSearch")}
            className="search-close-button"
            onClick={closeSearch}
            type="button"
          >
            <X size={26} />
          </button>
          <div className="search-panel">
            <div className="search-input-row">
              <Search size={22} />
              <label className="sr-only" htmlFor={searchInputId}>{t("searchDialog")}</label>
              <input
                autoFocus
                id={searchInputId}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (event.target.value.trim().length < 2) {
                    setProducts([]);
                    setLoading(false);
                  }
                }}
                placeholder={t("searchPlaceholder")}
                value={query}
              />
            </div>
            {hasSearchQuery ? (
              <section className="search-section">
                <div className="search-section-heading">
                  <h2>{t("searchResults")}</h2>
                  <p aria-live="polite">
                    {loading ? t("searching") : t("resultCount", { count: products.length })}
                  </p>
                </div>
                {loading ? (
                  <div className="search-loading" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : products.length ? (
                  <div className="search-product-grid">
                    {products.map((product) => (
                      <SearchProductTile product={product} key={product.id} compact onNavigate={closeSearch} />
                    ))}
                  </div>
                ) : (
                  <p className="search-empty">{t("searchEmpty")}</p>
                )}
              </section>
            ) : (
              <>
                <section className="search-section">
                  <div className="search-section-heading">
                    <h2>{t("searchTrends")}</h2>
                  </div>
                  <div className="search-product-grid search-trends-grid">
                    {searchTrendProducts.map((product) => (
                      <SearchProductTile product={product} key={product.slug} onNavigate={closeSearch} />
                    ))}
                  </div>
                </section>
                <section className="search-section search-recent-section">
                  <div className="search-section-heading">
                    <h2>{t("recentlyViewed")}</h2>
                    <button aria-label={t("removeRecentlyViewed")} className="text-button" type="button">
                      {t("remove")}
                    </button>
                  </div>
                  <div className="search-product-grid search-recent-grid">
                    {recentlyViewedProducts.map((product) => (
                      <SearchProductTile product={product} key={product.slug} compact onNavigate={closeSearch} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
