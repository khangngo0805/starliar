import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { createCheckoutOrder } from "@/lib/commerce/orders";
import { startSePayPayment } from "@/lib/payments/payment-service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const order = await createCheckoutOrder(await request.json(), user?.id);
    const checkout = await startSePayPayment(order.id);
    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: checkout.checkoutUrl,
        qrCode: checkout.qrCode
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CHECKOUT_FAILED" },
      { status: 400 }
    );
  }
}
