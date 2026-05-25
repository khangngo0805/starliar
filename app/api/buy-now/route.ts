import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutOrder } from "@/lib/commerce/orders";

const buyNowSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10).default(1)
});

export async function POST(request: Request) {
  try {
    const data = buyNowSchema.parse(await request.json());
    const order = await createCheckoutOrder({
      email: "guest@starliar.local",
      customerName: "Starliar Guest",
      phone: "0900000000",
      country: "VN",
      addressLine1: "Quick buy order",
      city: "Ho Chi Minh",
      items: [{ variantId: data.variantId, quantity: data.quantity }]
    });

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderUrl: `/order/${order.orderNumber}`
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "BUY_NOW_FAILED" },
      { status: 400 }
    );
  }
}
