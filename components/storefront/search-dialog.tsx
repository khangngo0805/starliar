"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatVnd } from "@/lib/commerce/cart";

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
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
}

function SearchProductTile({ product, compact = false }: { product: SearchPreviewProduct; compact?: boolean }) {
  return (
    <Link
      className={compact ? "search-product-tile search-product-tile-compact" : "search-product-tile"}
      href={`/shop/${product.slug}`}
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const trimmedQuery = query.trim();
  const hasSearchQuery = trimmedQuery.length >= 2;

  function closeSearch() {
    setOpen(false);
    setProducts([]);
    setQuery("");
  }

  useEffect(() => {
    if (!open || !hasSearchQuery) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal
      });
      if (response.ok) {
        const data = (await response.json()) as { products: SearchProduct[] };
        setProducts(data.products);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      safelyAbort(controller);
    };
  }, [hasSearchQuery, open, trimmedQuery]);

  return (
    <>
      <button
        aria-label="Search"
        className="icon-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search size={21} />
      </button>
      {open ? (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="search-overlay-header" aria-hidden="true">
            <nav>
              <span>Shop</span>
              <span>Campaign</span>
              <span>Collections</span>
              <span>Explore</span>
            </nav>
            <span>STARLIAR</span>
            <div>
              <span>Cold Cut Short</span>
              <Search size={21} />
            </div>
          </div>
          <button
            aria-label="Close search"
            className="search-close-button"
            onClick={closeSearch}
            type="button"
          >
            <X size={26} />
          </button>
          <div className="search-panel">
            <div className="search-input-row">
              <Search size={22} />
              <input
                autoFocus
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (event.target.value.trim().length < 2) {
                    setProducts([]);
                  }
                }}
                placeholder="Please enter the search term(s)"
                value={query}
              />
            </div>
            {hasSearchQuery ? (
              <section className="search-section">
                <div className="search-section-heading">
                  <h2>SEARCH RESULTS</h2>
                </div>
                {products.length ? (
                  <div className="search-product-grid">
                    {products.map((product) => (
                      <SearchProductTile product={product} key={product.id} compact />
                    ))}
                  </div>
                ) : (
                  <p className="search-empty">No matching products yet.</p>
                )}
              </section>
            ) : (
              <>
                <section className="search-section">
                  <div className="search-section-heading">
                    <h2>SEARCH TRENDS</h2>
                  </div>
                  <div className="search-product-grid search-trends-grid">
                    {searchTrendProducts.map((product) => (
                      <SearchProductTile product={product} key={product.slug} />
                    ))}
                  </div>
                </section>
                <section className="search-section search-recent-section">
                  <div className="search-section-heading">
                    <h2>RECENTLY VIEWED</h2>
                    <button aria-label="Remove recently viewed products" className="text-button" type="button">
                      REMOVE
                    </button>
                  </div>
                  <div className="search-product-grid search-recent-grid">
                    {recentlyViewedProducts.map((product) => (
                      <SearchProductTile product={product} key={product.slug} compact />
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
