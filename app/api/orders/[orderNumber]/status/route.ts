import { NextResponse } from "next/server";
import { createOrderStatusPayload } from "@/lib/commerce/order-status";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(
    createOrderStatusPayload({
      orderStatus: order.status,
      paymentStatus: order.payments[0]?.status
    })
  );
}
