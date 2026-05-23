export type PaymentCheckout = {
  providerRef: string;
  checkoutUrl: string;
  qrCode?: string;
};

export interface PaymentProvider {
  createCheckout(input: {
    orderId: string;
    orderNumber: string;
    amountVnd: number;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
  }): Promise<PaymentCheckout>;
}
