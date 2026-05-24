import { z } from "zod";

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
