export function favoriteProductIds(favorites: Array<{ productId: string }>) {
  return favorites.map((favorite) => favorite.productId);
}

export function isFavorite(productId: string, favorites: string[]) {
  return favorites.includes(productId);
}
