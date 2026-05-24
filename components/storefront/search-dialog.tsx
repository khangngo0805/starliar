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

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal
      });
      if (response.ok) {
        const data = (await response.json()) as { products: SearchProduct[] };
        setProducts(data.products);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [open, query]);

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
                placeholder="Search Starliar"
                value={query}
              />
              <button
                aria-label="Close search"
                className="icon-button"
                onClick={() => {
                  setOpen(false);
                  setProducts([]);
                  setQuery("");
                }}
                type="button"
              >
                <X size={22} />
              </button>
            </div>
            <div className="search-results">
              {query.trim().length < 2 ? <p>Type at least 2 characters.</p> : null}
              {query.trim().length >= 2 && !products.length ? <p>No matching products yet.</p> : null}
              {products.map((product) => (
                <Link
                  className="search-result"
                  href={`/shop/${product.slug}`}
                  key={product.id}
                  onClick={() => setOpen(false)}
                >
                  <div className="search-result-media">
                    {product.media[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={product.name} src={product.media[0]} />
                    ) : null}
                  </div>
                  <div>
                    <span>{product.collection}</span>
                    <strong>{product.name}</strong>
                    <small>{formatVnd(product.priceVnd)}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
