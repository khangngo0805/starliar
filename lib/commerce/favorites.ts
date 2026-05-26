export function favoriteProductIds(favorites: Array<{ productId: string }>) {
  return favorites.map((favorite) => favorite.productId);
}

export function favoritePreviewImage(favorite: { product: { images: Array<{ src: string }> } }) {
  return favorite.product.images[0]?.src ?? null;
}

export function isFavorite(productId: string, favorites: string[]) {
  return favorites.includes(productId);
}
