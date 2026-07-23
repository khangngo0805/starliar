import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { shopCategories, categoryToParam, paramToCategory } from "@/lib/commerce/categories";

export { shopCategories, categoryToParam, paramToCategory };

const PRODUCT_CACHE_SECONDS = 300;

type SearchableProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  priceVnd: number;
  collection?: { name: string } | null;
  images: { src: string }[];
};

export async function getFeaturedProducts(category?: string | null) {
  const products = await prisma.product.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    include: { images: { orderBy: { position: "asc" } }, variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return products.map(({ images, ...product }) => ({
    ...product,
    media: images.map((image) => image.src)
  }));
}

const getCachedShopProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        priceVnd: true,
        images: { orderBy: { position: "asc" }, select: { src: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 80
    });

    return products.map(({ images, ...product }) => ({
      ...product,
      media: images.map((image) => image.src)
    }));
  },
  ["shop-products"],
  { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products"] }
);

export async function getShopProducts() {
  return getCachedShopProducts();
}

const getCachedPublishedProduct = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findFirst({
      where: { slug, published: true },
      include: { images: { orderBy: { position: "asc" } }, variants: true, collection: true }
    });

    if (!product) return null;
    return {
      ...product,
      media: product.images.map((image) => image.src)
    };
  },
  ["published-product"],
  { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products"] }
);

export async function getPublishedProduct(slug: string) {
  return getCachedPublishedProduct(slug);
}

export async function searchProducts(query: string) {
  const normalized = normalizeSearchText(query);
  if (normalized.length < 2) return [];

  const products = await prisma.product.findMany({
    where: { published: true },
    include: { images: { orderBy: { position: "asc" } }, collection: true },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return filterAndRankProductsForSearch(products, normalized).slice(0, 8).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    priceVnd: product.priceVnd,
    collection: product.collection?.name ?? "Starlier",
    media: product.images.map((image) => image.src)
  }));
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function filterAndRankProductsForSearch<TProduct extends SearchableProduct>(
  products: TProduct[],
  query: string
) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (!queryTokens.length) return [];

  return products
    .map((product, index) => ({
      product,
      index,
      score: scoreSearchProduct(product, normalizedQuery, queryTokens)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.product);
}

function scoreSearchProduct(product: SearchableProduct, normalizedQuery: string, queryTokens: string[]) {
  const name = normalizeSearchText(product.name);
  const slug = normalizeSearchText(product.slug);
  const category = normalizeSearchText(product.category);
  const description = normalizeSearchText(product.description ?? "");
  const collection = normalizeSearchText(product.collection?.name ?? "");
  const haystack = [name, slug, category, description, collection].join(" ");

  if (!queryTokens.every((token) => haystack.includes(token))) return 0;

  let score = 1;
  if (name === normalizedQuery) score += 120;
  if (name.startsWith(normalizedQuery)) score += 80;
  if (name.includes(normalizedQuery)) score += 55;
  if (slug.includes(normalizedQuery)) score += 42;
  if (category === normalizedQuery) score += 35;
  if (category.includes(normalizedQuery)) score += 24;
  if (collection.includes(normalizedQuery)) score += 18;
  if (description.includes(normalizedQuery)) score += 10;

  for (const token of queryTokens) {
    if (name.split(" ").some((word) => word.startsWith(token))) score += 16;
    if (slug.split(" ").some((word) => word.startsWith(token))) score += 8;
    if (category.split(" ").some((word) => word.startsWith(token))) score += 8;
  }

  return score;
}
