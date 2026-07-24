import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" }
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3
    },
    {
      url: `${siteUrl}/orders`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3
    },
    {
      url: `${siteUrl}/account`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2
    }
  ];

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
