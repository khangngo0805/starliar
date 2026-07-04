import { z } from "zod";

export const guestOrderLookupSchema = z.object({
  email: z.preprocess((value) => String(value ?? "").trim().toLowerCase(), z.string().email()),
  phone: z.preprocess((value) => String(value ?? "").trim(), z.string().min(8))
});

export function normalizeOrderPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function normalizeGuestOrderLookup(input: unknown) {
  const parsed = guestOrderLookupSchema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_ORDER_LOOKUP");

  return {
    email: parsed.data.email,
    phone: normalizeOrderPhone(parsed.data.phone)
  };
}
