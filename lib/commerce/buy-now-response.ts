import type { PaymentCheckout } from "@/lib/payments/types";

export function createBuyNowResponse(
  order: { id: string; orderNumber: string },
  checkout: PaymentCheckout
) {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderUrl: `/order/${order.orderNumber}`,
    checkoutUrl: checkout.checkoutUrl,
    qrCode: checkout.qrCode
  };
}
