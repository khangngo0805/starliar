export const shopCategories = [
  "T-Shirt",
  "Shirt",
  "Shorts",
  "Accessories"
];

export function categoryToParam(category: string) {
  if (category === "Accessories") return "bags";
  return category.toLowerCase().replaceAll(" ", "-");
}

export function paramToCategory(param?: string | null) {
  if (!param) return null;
  if (param === "bags" || param === "accessories") return "Accessories";
  return shopCategories.find((category) => categoryToParam(category) === param) ?? null;
}

export function categoryLabel(category: string) {
  return category === "Accessories" ? "Bags" : category;
}

export function normalizeStorefrontCategory(category: string) {
  const normalized = category.trim().toLowerCase();
  if (normalized === "bags" || normalized === "accessories") return "Accessories";
  return shopCategories.find((item) => item.toLowerCase() === normalized) ?? null;
}

export function isStorefrontCategory(category: string) {
  return normalizeStorefrontCategory(category) !== null;
}
