import { prisma } from "@/lib/prisma";

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

export async function getFeaturedProducts(category?: string | null) {
  const products = await prisma.product.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    include: { images: { orderBy: { position: "asc" } }, variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return products.map((product) => ({
    ...product,
    media: product.images.map((image) => image.src)
  }));
}

export async function getPublishedProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { position: "asc" } }, variants: true, collection: true }
  });

  if (!product) return null;
  return {
    ...product,
    media: product.images.map((image) => image.src)
  };
}

export async function searchProducts(query: string) {
  const normalized = query.trim();
  if (normalized.length < 2) return [];

  const products = await prisma.product.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: normalized } },
        { description: { contains: normalized } },
        { slug: { contains: normalized } },
        { category: { contains: normalized } }
      ]
    },
    include: { images: { orderBy: { position: "asc" } }, collection: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    priceVnd: product.priceVnd,
    collection: product.collection?.name ?? "Starliar",
    media: product.images.map((image) => image.src)
  }));
}
