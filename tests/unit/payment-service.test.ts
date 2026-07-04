import { describe, expect, it } from "vitest";
import { mapPayOSStatus } from "@/lib/payments/payos";
import {
  buildSePayQrUrl,
  extractSePayOrderNumber,
  isValidSePayIncomingPayment,
  verifySePayHmacSignature
} from "@/lib/payments/sepay";

describe("mapPayOSStatus", () => {
  it("maps paid and canceled provider states", () => {
    expect(mapPayOSStatus("PAID")).toBe("PAID");
    expect(mapPayOSStatus("00")).toBe("PAID");
    expect(mapPayOSStatus("CANCELLED")).toBe("CANCELED");
  });
});

describe("SePay helpers", () => {
  it("builds a VietQR URL with order-specific transfer details", () => {
    const url = buildSePayQrUrl({
      accountNumber: "23965057",
      bankName: "ACB",
      accountHolder: "NGO QUY KHANG",
      amountVnd: 720000,
      description: "STL-123"
    });

    expect(url).toContain("acc=23965057");
    expect(url).toContain("bank=ACB");
    expect(url).toContain("amount=720000");
    expect(url).toContain("des=STL-123");
    expect(url).toContain("holder=NGO+QUY+KHANG");
  });

  it("matches SePay webhooks to paid orders only when amount and account are valid", () => {
    const payload = {
      id: 92704,
      accountNumber: "23965057",
      code: "STL-123",
      content: "STL-123 chuyen tien",
      transferType: "in",
      transferAmount: 720000
    };

    expect(extractSePayOrderNumber(payload)).toBe("STL-123");
    expect(
      isValidSePayIncomingPayment(payload, {
        expectedAccountNumber: "23965057",
        expectedAmountVnd: 720000
      })
    ).toBe(true);
    expect(
      isValidSePayIncomingPayment({ ...payload, transferAmount: 1000 }, {
        expectedAccountNumber: "23965057",
        expectedAmountVnd: 720000
      })
    ).toBe(false);
  });

  it("accepts common SePay payload formatting variations", () => {
    expect(
      isValidSePayIncomingPayment(
        {
          accountNumber: " 23965057 ",
          code: "STL1783164076238",
          transferType: "IN",
          transferAmount: "50000" as unknown as number
        },
        {
          expectedAccountNumber: "23965057",
          expectedAmountVnd: 50000
        }
      )
    ).toBe(true);
  });

  it("normalizes bank transfer codes when the hyphen is removed", () => {
    expect(
      extractSePayOrderNumber({
        code: "STL1783164076238",
        content: "STL1783164076238 thanh toan"
      })
    ).toBe("STL-1783164076238");
  });

  it("verifies SePay HMAC signatures from the raw request body", () => {
    const body = JSON.stringify({ id: 92704, code: "STL-123" });
    const timestamp = "1800000000";
    const secret = "test-secret";

    expect(
      verifySePayHmacSignature({
        body,
        timestamp,
        secret,
        signature: "sha256=adcec7f843dbafa668752126d831f600a58201d403a07e4cec721130b7dc365b",
        nowSeconds: 1800000010
      })
    ).toBe(true);
    expect(
      verifySePayHmacSignature({
        body,
        timestamp,
        secret,
        signature: "sha256=bad",
        nowSeconds: 1800000010
      })
    ).toBe(false);
  });
});
