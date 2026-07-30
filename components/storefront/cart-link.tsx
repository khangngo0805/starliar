"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/storefront/language-provider";
import type { CartItem } from "@/lib/commerce/cart";

function getCartCount() {
  if (typeof window === "undefined") return 0;
  const items = JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]") as CartItem[];
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function CartLink() {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const syncCount = () => setCount(getCartCount());
    syncCount();
    window.addEventListener("storage", syncCount);
    window.addEventListener("starliar-cart-updated", syncCount);
    return () => {
      window.removeEventListener("storage", syncCount);
      window.removeEventListener("starliar-cart-updated", syncCount);
    };
  }, []);

  return (
    <Link
      aria-label={count ? t("cartWithCount", { count }) : t("cart")}
      className="cart-icon-link"
      href="/cart"
    >
      {count > 0 ? <span className="cart-badge">{count > 9 ? "9+" : count}</span> : null}
      <ShoppingBag size={21} />
    </Link>
  );
}
