import { NextResponse } from "next/server";
import { normalizeGuestOrderLookup, normalizeOrderPhone } from "@/lib/commerce/order-history";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const lookup = normalizeGuestOrderLookup(await request.json());
    const orders = await prisma.order.findMany({
      where: { email: lookup.email },
      include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({
      orders: orders
        .filter((order) => normalizeOrderPhone(order.phone) === lookup.phone)
        .slice(0, 10)
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalVnd: order.totalVnd,
          createdAt: order.createdAt.toISOString(),
          paymentStatus: order.payments[0]?.status ?? "PENDING",
          items: order.items.map((item) => ({
            productName: item.productName,
            size: item.size,
            quantity: item.quantity
          }))
        }))
    });
  } catch {
    return NextResponse.json({ error: "INVALID_ORDER_LOOKUP" }, { status: 400 });
  }
}
