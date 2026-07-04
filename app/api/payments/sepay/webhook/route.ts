import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractSePayOrderNumber,
  getSePayConfig,
  isAuthorizedSePayRequest,
  isValidSePayIncomingPayment,
  type SePayWebhookPayload
} from "@/lib/payments/sepay";

function success(details: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, ...details });
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
  if (!config) return success({ ignored: "MISSING_SEPAY_CONFIG" });
  if (!orderNumber) return success({ ignored: "ORDER_CODE_NOT_FOUND" });

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { where: { provider: "sepay" }, orderBy: { createdAt: "desc" }, take: 1 } }
  });

  if (!order) return success({ ignored: "ORDER_NOT_FOUND", orderNumber });
  const payment = order.payments[0];
  if (payment?.status === "PAID") return success({ status: "ALREADY_PAID", orderNumber });

  const isPaid = isValidSePayIncomingPayment(payload, {
    expectedAccountNumber: config.accountNumber,
    expectedAmountVnd: order.totalVnd
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { rawPayload: body }
    });
  }

  if (!isPaid) return success({ ignored: "PAYMENT_NOT_MATCHED", orderNumber });

  const providerRef = payload.referenceCode ? `${order.orderNumber}:${payload.referenceCode}` : order.orderNumber;

  await prisma.$transaction([
    payment
      ? prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            rawPayload: body,
            providerRef
          }
        })
      : prisma.payment.create({
          data: {
            orderId: order.id,
            amountVnd: order.totalVnd,
            provider: "sepay",
            providerRef,
            checkoutUrl: `/order/${order.orderNumber}`,
            status: "PAID",
            rawPayload: body
          }
        }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    })
  ]);

  return success({ status: "PAID", orderNumber });
}
