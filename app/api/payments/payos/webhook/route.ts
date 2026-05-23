import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapPayOSStatus, verifyPayOSWebhook } from "@/lib/payments/payos";

export async function POST(request: Request) {
  const body = await request.json();
  const verified = await verifyPayOSWebhook(body);

  if (!verified) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  const providerRef = String(verified.orderCode);
  const status = mapPayOSStatus(verified.code);
  const payment = await prisma.payment.findUnique({ where: { providerRef } });

  if (!payment || payment.status === "PAID") {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status, rawPayload: JSON.stringify(body) }
    }),
    ...(status === "PAID"
      ? [prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } })]
      : [])
  ]);

  return NextResponse.json({ ok: true });
}
