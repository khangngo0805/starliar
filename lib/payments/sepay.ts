import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentProvider } from "./types";

export type SePayConfig = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type SePayWebhookPayload = {
  id?: number;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  description?: string;
  transferType?: string;
  transferAmount?: number;
  referenceCode?: string;
};

export function getSePayConfig(): SePayConfig | null {
  const bankName = process.env.SEPAY_BANK_NAME;
  const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER;
  const accountHolder = process.env.SEPAY_ACCOUNT_HOLDER;

  if (!bankName || !accountNumber || !accountHolder) return null;
  return { bankName, accountNumber, accountHolder };
}

export function buildSePayQrUrl({
  accountNumber,
  bankName,
  accountHolder,
  amountVnd,
  description
}: SePayConfig & { amountVnd: number; description: string }) {
  const params = new URLSearchParams({
    acc: accountNumber,
    bank: bankName,
    amount: String(amountVnd),
    des: description,
    template: "compact",
    showinfo: "true",
    holder: accountHolder
  });

  return `https://vietqr.app/img?${params.toString()}`;
}

export function extractSePayOrderNumber(payload: SePayWebhookPayload) {
  const candidates = [payload.code, payload.content, payload.description].filter(Boolean);
  for (const candidate of candidates) {
    const match = String(candidate).match(/\bSTL-?\d+\b/i);
    if (match) {
      const digits = match[0].replace(/\D/g, "");
      return `STL-${digits}`;
    }
  }
  return null;
}

export function isValidSePayIncomingPayment(
  payload: SePayWebhookPayload,
  {
    expectedAccountNumber,
    expectedAmountVnd
  }: {
    expectedAccountNumber: string;
    expectedAmountVnd: number;
  }
) {
  return (
    payload.transferType === "in" &&
    payload.accountNumber === expectedAccountNumber &&
    typeof payload.transferAmount === "number" &&
    payload.transferAmount >= expectedAmountVnd
  );
}

export function verifySePayHmacSignature({
  body,
  timestamp,
  secret,
  signature,
  nowSeconds = Math.floor(Date.now() / 1000)
}: {
  body: string;
  timestamp: string | null;
  secret: string;
  signature: string | null;
  nowSeconds?: number;
}) {
  if (!timestamp || !signature) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > 300) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function isAuthorizedSePayRequest({
  body,
  authorization,
  signature,
  timestamp
}: {
  body: string;
  authorization: string | null;
  signature: string | null;
  timestamp: string | null;
}) {
  if (process.env.SEPAY_WEBHOOK_SECRET) {
    return verifySePayHmacSignature({
      body,
      timestamp,
      signature,
      secret: process.env.SEPAY_WEBHOOK_SECRET
    });
  }

  if (process.env.SEPAY_API_KEY) {
    return authorization === `Apikey ${process.env.SEPAY_API_KEY}`;
  }

  return process.env.NODE_ENV !== "production";
}

export const sePayProvider: PaymentProvider = {
  async createCheckout(input) {
    const config = getSePayConfig();

    return {
      providerRef: input.orderNumber,
      checkoutUrl: `/order/${input.orderNumber}`,
      qrCode: config
        ? buildSePayQrUrl({
            ...config,
            amountVnd: input.amountVnd,
            description: input.orderNumber
          })
        : undefined
    };
  }
};
