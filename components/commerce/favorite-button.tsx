"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { favoritesStorageKey, isFavorite, readFavoriteIds, toggleFavoriteId } from "@/lib/commerce/favorites";

export function FavoriteButton({
  productId,
  productName,
  compact = false
}: {
  productId: string;
  productName: string;
  compact?: boolean;
}) {
  const [favorites, setFavorites] = useState<string[]>(readFavoriteIds);
  const active = isFavorite(productId, favorites);

  return (
    <button
      aria-label={active ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`}
      aria-pressed={active}
      className={compact ? "favorite-button favorite-button-compact" : "favorite-button"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = toggleFavoriteId(productId, favorites);
        setFavorites(next);
        window.localStorage.setItem(favoritesStorageKey, JSON.stringify(next));
      }}
      type="button"
    >
      <Heart fill={active ? "currentColor" : "none"} size={compact ? 17 : 19} />
    </button>
  );
}
