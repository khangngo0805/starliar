export const favoritesStorageKey = "starliar-favorites";

export function readFavoriteIds() {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(favoritesStorageKey) ?? "[]") as string[];
}

export function isFavorite(productId: string, favorites: string[]) {
  return favorites.includes(productId);
}

export function toggleFavoriteId(productId: string, favorites: string[]) {
  return isFavorite(productId, favorites)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
}
