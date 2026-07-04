import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractSePayOrderNumber,
  getSePayConfig,
  isAuthorizedSePayRequest,
  isValidSePayIncomingPayment,
  type SePayWebhookPayload
} from "@/lib/payments/sepay";

function success() {
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const body = await request.text();
  const authorized = isAuthorizedSePayRequest({
    body,
    authorization: request.headers.get("authorization"),
    signature: request.headers.get("x-sepay-signature"),
    timestamp: request.headers.get("x-sepay-timestamp")
  });

  if (!authorized) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let payload: SePayWebhookPayload;
  try {
    payload = JSON.parse(body) as SePayWebhookPayload;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const config = getSePayConfig();
  const orderNumber = extractSePayOrderNumber(payload);
  if (!config || !orderNumber) return success();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { where: { provider: "sepay" }, orderBy: { createdAt: "desc" }, take: 1 } }
  });

  if (!order) return success();
  const payment = order.payments[0];
  if (!payment || payment.status === "PAID") return success();

  const isPaid = isValidSePayIncomingPayment(payload, {
    expectedAccountNumber: config.accountNumber,
    expectedAmountVnd: order.totalVnd
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { rawPayload: body }
  });

  if (!isPaid) return success();

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        rawPayload: body,
        providerRef: payload.referenceCode ? `${order.orderNumber}:${payload.referenceCode}` : order.orderNumber
      }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    })
  ]);

  return success();
}
