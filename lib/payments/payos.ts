import { PayOS } from "@payos/node";
import type { PaymentProvider } from "./types";

function hasPayOSCredentials() {
  return Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY);
}

function getPayOS() {
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
  });
}

export function mapPayOSStatus(status: string) {
  if (status === "PAID" || status === "00") return "PAID";
  if (status === "CANCELLED" || status === "CANCELED") return "CANCELED";
  if (status === "FAILED" || status === "EXPIRED") return "FAILED";
  return "PENDING";
}

export async function verifyPayOSWebhook(body: unknown) {
  if (!hasPayOSCredentials()) {
    return null;
  }

  try {
    return await getPayOS().webhooks.verify(body as Parameters<PayOS["webhooks"]["verify"]>[0]);
  } catch {
    return null;
  }
}

export const payOSProvider: PaymentProvider = {
  async createCheckout(input) {
    if (!hasPayOSCredentials()) {
      return {
        providerRef: `dev-${input.orderNumber}`,
        checkoutUrl: `/order/${input.orderNumber}`,
        qrCode: undefined
      };
    }

    const orderCode = Number(input.orderId.replace(/\D/g, "").slice(-10)) || Date.now();
    const paymentLink = await getPayOS().paymentRequests.create({
      orderCode,
      amount: input.amountVnd,
      description: input.orderNumber.slice(0, 25),
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerPhone: input.buyerPhone,
      buyerAddress: input.buyerAddress,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/result?order=${input.orderNumber}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/result?order=${input.orderNumber}&canceled=1`
    });

    return {
      providerRef: String(paymentLink.orderCode),
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    };
  }
};
