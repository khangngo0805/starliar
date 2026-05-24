export const orderStatusValues = [
  "PENDING_PAYMENT",
  "PAID",
  "FULFILLING",
  "FULFILLED",
  "CANCELED"
] as const;

export const paymentStatusValues = [
  "CREATED",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELED"
] as const;

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceVnd: number;
  media: string[];
};
