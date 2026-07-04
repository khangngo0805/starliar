import { describe, expect, it } from "vitest";
import { createBuyNowResponse } from "@/lib/commerce/buy-now-response";

describe("buy now contract", () => {
  it("creates an order URL from an order number", () => {
    const orderNumber = "STL-123";
    expect(`/order/${orderNumber}`).toBe("/order/STL-123");
  });

  it("returns the payment checkout URL and QR for immediate payment", () => {
    expect(
      createBuyNowResponse(
        { id: "order-1", orderNumber: "STL-123" },
        {
          checkoutUrl: "/order/STL-123",
          providerRef: "STL-123",
          qrCode: "https://vietqr.app/img?acc=23965057"
        }
      )
    ).toEqual({
      orderId: "order-1",
      orderNumber: "STL-123",
      orderUrl: "/order/STL-123",
      checkoutUrl: "/order/STL-123",
      qrCode: "https://vietqr.app/img?acc=23965057"
    });
  });
});
