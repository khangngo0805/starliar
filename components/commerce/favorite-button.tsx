"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

export function FavoriteButton({
  productId,
  productName,
  compact = false
}: {
  productId: string;
  productName: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFavoriteState() {
      const response = await fetch("/api/account/favorites", { signal: controller.signal });
      if (!response.ok) return;
      const data = (await response.json()) as { authenticated: boolean; favorites: string[] };
      setAuthenticated(data.authenticated);
      setActive(data.favorites.includes(productId));
    }

    loadFavoriteState().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
    });

    return () => controller.abort();
  }, [productId]);

  async function toggleFavorite(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (authenticated === false) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setBusy(true);
    let response: Response;
    try {
      response = await fetch("/api/account/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId })
      });
    } catch {
      setBusy(false);
      return;
    }
    setBusy(false);

    if (response.status === 401) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!response.ok) return;
    const data = (await response.json()) as { favorited: boolean };
    setAuthenticated(true);
    setActive(data.favorited);
  }

  return (
    <button
      aria-label={active ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`}
      aria-pressed={active}
      className={compact ? "favorite-button favorite-button-compact" : "favorite-button"}
      disabled={busy}
      onClick={toggleFavorite}
      type="button"
    >
      <Heart fill={active ? "currentColor" : "none"} size={compact ? 17 : 19} />
    </button>
  );
}
