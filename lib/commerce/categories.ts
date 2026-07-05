export const shopCategories = [
  "T-Shirt",
  "Shirt",
  "Long Sleeve",
  "Hoodie",
  "Jacket",
  "Trousers",
  "Shorts",
  "Accessories"
];

export function categoryToParam(category: string) {
  return category.toLowerCase().replaceAll(" ", "-");
}

export function paramToCategory(param?: string | null) {
  if (!param) return null;
  return shopCategories.find((category) => categoryToParam(category) === param) ?? null;
}
