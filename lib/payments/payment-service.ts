import { prisma } from "@/lib/prisma";
import { payOSProvider } from "./payos";
import { sePayProvider } from "./sepay";

export async function startPayOSPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const checkout = await payOSProvider.createCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountVnd: order.totalVnd,
    buyerName: order.customerName,
    buyerEmail: order.email,
    buyerPhone: order.phone,
    buyerAddress: `${order.addressLine1}, ${order.city}, ${order.country}`
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amountVnd: order.totalVnd,
      provider: "payos",
      providerRef: checkout.providerRef,
      checkoutUrl: checkout.checkoutUrl,
      status: "PENDING"
    }
  });

  return checkout;
}

export async function startSePayPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const checkout = await sePayProvider.createCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountVnd: order.totalVnd,
    buyerName: order.customerName,
    buyerEmail: order.email,
    buyerPhone: order.phone,
    buyerAddress: `${order.addressLine1}, ${order.city}, ${order.country}`
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amountVnd: order.totalVnd,
      provider: "sepay",
      providerRef: checkout.providerRef,
      checkoutUrl: checkout.checkoutUrl,
      status: "PENDING"
    }
  });

  return checkout;
}
