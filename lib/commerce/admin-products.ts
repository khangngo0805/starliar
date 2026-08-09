import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const adminProductSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(10),
  priceVnd: z.number().int().positive(),
  published: z.boolean(),
  media: z.array(z.string().min(1)).min(1),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        sku: z.string().min(3),
        stock: z.number().int().nonnegative()
      })
    )
    .min(1)
});

export const adminProductVisibilitySchema = z.object({
  published: z.boolean()
});

export function normalizeAdminProductIds(input: unknown) {
  if (!input || typeof input !== "object" || !("ids" in input)) {
    throw new Error("Select at least one product to delete.");
  }

  const ids = (input as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) {
    throw new Error("Select at least one product to delete.");
  }

  const normalizedIds = Array.from(
    new Set(ids.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean))
  );

  if (normalizedIds.length === 0) {
    throw new Error("Select at least one product to delete.");
  }

  return normalizedIds;
}

export async function deleteAdminProducts(input: unknown) {
  const ids = normalizeAdminProductIds(input);

  return prisma.$transaction(async (transaction) => {
    const referencedOrderItems = await transaction.orderItem.count({ where: { productId: { in: ids } } });
    if (referencedOrderItems > 0) {
      throw new Error("Some selected products are part of an order and cannot be deleted.");
    }

    const result = await transaction.product.deleteMany({ where: { id: { in: ids } } });
    return { deletedCount: result.count };
  });
}

export type ProductFormInitialValue = z.infer<typeof adminProductSchema>;

export function buildProductFormInitialValue(product: {
  slug: string;
  name: string;
  category: string;
  description: string;
  priceVnd: number;
  published: boolean;
  images: Array<{ src: string; position: number }>;
  variants: Array<{ size: string; sku: string; stock: number }>;
}): ProductFormInitialValue {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    priceVnd: product.priceVnd,
    published: product.published,
    media: product.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((image) => image.src),
    variants: product.variants.map((variant) => ({
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock
    }))
  };
}

export function adminProductErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    const path = issue?.path.join(".");

    if (path?.startsWith("variants.") && path.endsWith(".sku")) {
      return "Add a SKU with at least 3 characters for every size.";
    }

    if (path === "slug") {
      return "Use a slug with lowercase letters, numbers, and hyphens only.";
    }

    if (path === "description") {
      return "Add a description with at least 10 characters.";
    }

    if (path === "media") {
      return "Add at least one product image.";
    }

    return "Check the product details and try again.";
  }

  if (error instanceof Error && error.message.includes("Unique constraint")) {
    return "Use a unique slug and SKU. One of them already exists.";
  }

  return "Could not save product.";
}
