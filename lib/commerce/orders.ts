import { prisma } from "@/lib/prisma";
import { checkoutInputSchema } from "./checkout-schema";
import { normalizeOrderPhone } from "./order-history";
import { getShippingFeeVnd, resolveOrderTotals } from "./store-settings";

export async function createCheckoutOrder(input: unknown, userId?: string) {
  const data = checkoutInputSchema.parse(input);
  const variantIds = data.items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true }
  });

  const items = data.items.map((item) => {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || variant.stock < item.quantity || !variant.product.published) {
      throw new Error("UNAVAILABLE_VARIANT");
    }
    return { item, variant };
  });

  const subtotalVnd = items.reduce(
    (total, { item, variant }) => total + item.quantity * variant.product.priceVnd,
    0
  );
  const { shippingVnd, totalVnd } = resolveOrderTotals({
    subtotalVnd,
    shippingFeeVnd: await getShippingFeeVnd()
  });

  return prisma.order.create({
    data: {
      orderNumber: `STL-${Date.now()}`,
      userId,
      email: data.email.trim().toLowerCase(),
      customerName: data.customerName,
      phone: normalizeOrderPhone(data.phone),
      country: data.country.toUpperCase(),
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      deliveryLatitude: data.deliveryLatitude,
      deliveryLongitude: data.deliveryLongitude,
      deliveryNote: data.deliveryNote,
      subtotalVnd,
      shippingVnd,
      totalVnd,
      status: "PENDING_PAYMENT",
      items: {
        create: items.map(({ item, variant }) => ({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          size: variant.size,
          unitPriceVnd: variant.product.priceVnd,
          quantity: item.quantity
        }))
      }
    }
  });
}
