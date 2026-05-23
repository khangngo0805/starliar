import { prisma } from "@/lib/prisma";

export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { published: true },
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
