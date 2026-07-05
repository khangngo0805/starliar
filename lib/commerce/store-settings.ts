import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SHIPPING_FEE_VND = 40000;
export const SHIPPING_FEE_SETTING_KEY = "shippingFeeVnd";

export const shippingFeeSchema = z.object({
  shippingFeeVnd: z.coerce.number().int().min(0).max(10000000)
});

export type MapProvider = "google" | "openstreetmap";

export function parseShippingFeeInput(input: unknown) {
  const parsed = shippingFeeSchema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_SHIPPING_FEE");
  return parsed.data;
}

export function resolveOrderTotals({
  subtotalVnd,
  shippingFeeVnd
}: {
  subtotalVnd: number;
  shippingFeeVnd: number;
}) {
  const shippingVnd = Math.max(0, Math.trunc(shippingFeeVnd));
  return {
    subtotalVnd,
    shippingVnd,
    totalVnd: subtotalVnd + shippingVnd
  };
}

export function resolveMapProvider(apiKey: string | undefined): MapProvider {
  return apiKey?.trim() ? "google" : "openstreetmap";
}

export function geolocationErrorMessage(code?: number) {
  if (code === 1) return "Location permission was blocked by the browser.";
  if (code === 2) return "Your location is not available right now.";
  if (code === 3) return "Location lookup timed out.";
  return "Could not access your location.";
}

export async function getShippingFeeVnd() {
  const setting = await prisma.storeSetting.findUnique({ where: { key: SHIPPING_FEE_SETTING_KEY } });
  const value = Number(setting?.value);

  return Number.isInteger(value) && value >= 0 ? value : DEFAULT_SHIPPING_FEE_VND;
}

export async function updateShippingFeeVnd(shippingFeeVnd: number) {
  const parsed = parseShippingFeeInput({ shippingFeeVnd });

  return prisma.storeSetting.upsert({
    where: { key: SHIPPING_FEE_SETTING_KEY },
    update: { value: String(parsed.shippingFeeVnd) },
    create: { key: SHIPPING_FEE_SETTING_KEY, value: String(parsed.shippingFeeVnd) }
  });
}
