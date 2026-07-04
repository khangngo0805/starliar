export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  category?: string;
  media?: string;
  size: string;
  priceVnd: number;
  quantity: number;
};

export const CART_STORAGE_KEY = "starliar-cart";
export const BUY_NOW_STORAGE_KEY = "starliar-buy-now";

export function addCartItem(items: CartItem[], next: CartItem) {
  const existing = items.find((item) => item.variantId === next.variantId);
  if (!existing) return [...items, next];

  return items.map((item) =>
    item.variantId === next.variantId
      ? { ...item, quantity: item.quantity + next.quantity }
      : item
  );
}

export function updateCartQuantity(items: CartItem[], variantId: string, quantity: number) {
  if (quantity < 1) return items.filter((item) => item.variantId !== variantId);
  return items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item));
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.priceVnd * item.quantity, 0);
}

export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}
