import { z } from "zod";

export const checkoutInputSchema = z.object({
  email: z.string().email(),
  customerName: z.string().min(2),
  phone: z.string().min(8),
  country: z.string().min(2),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive().max(10)
      })
    )
    .min(1)
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
