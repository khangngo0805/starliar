export type OrderStatusPayload = {
  orderStatus: string;
  paymentStatus: string;
  confirmed: boolean;
};

export function createOrderStatusPayload({
  orderStatus,
  paymentStatus
}: {
  orderStatus: string;
  paymentStatus?: string | null;
}): OrderStatusPayload {
  const resolvedPaymentStatus = paymentStatus ?? "PENDING";

  return {
    orderStatus,
    paymentStatus: resolvedPaymentStatus,
    confirmed: orderStatus === "PAID" && resolvedPaymentStatus === "PAID"
  };
}
