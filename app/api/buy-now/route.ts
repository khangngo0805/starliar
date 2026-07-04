import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { createBuyNowResponse } from "@/lib/commerce/buy-now-response";
import { createCheckoutOrder } from "@/lib/commerce/orders";
import { startSePayPayment } from "@/lib/payments/payment-service";

const buyNowSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10).default(1)
});

export async function POST(request: Request) {
  try {
    const data = buyNowSchema.parse(await request.json());
    const user = await getCurrentUser();
    const order = await createCheckoutOrder({
      email: user?.email ?? "guest@starliar.local",
      customerName: user?.name ?? "Starliar Guest",
      phone: "0900000000",
      country: "VN",
      addressLine1: "Quick buy order",
      city: "Ho Chi Minh",
      items: [{ variantId: data.variantId, quantity: data.quantity }]
    }, user?.id);

    const checkout = await startSePayPayment(order.id);

    return NextResponse.json(createBuyNowResponse(order, checkout), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "BUY_NOW_FAILED" },
      { status: 400 }
    );
  }
}
