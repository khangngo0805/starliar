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

async function findSePayOrder(orderNumber: string) {
  const include = { payments: { where: { provider: "sepay" }, orderBy: { createdAt: "desc" as const }, take: 1 } };
  const exactOrder = await prisma.order.findUnique({
    where: { orderNumber },
    include
  });

  if (exactOrder) {
    return { order: exactOrder, matchedBy: "exact" };
  }

  const digits = orderNumber.replace(/\D/g, "");
  if (digits.length < 10) {
    return { order: null, matchedBy: "none" };
  }

  const candidates = await prisma.order.findMany({
    where: {
      orderNumber: { startsWith: orderNumber },
      status: "PENDING_PAYMENT"
    },
    include,
    orderBy: { createdAt: "desc" },
    take: 2
  });

  if (candidates.length === 1) {
    return { order: candidates[0], matchedBy: "prefix" };
  }

  return { order: null, matchedBy: candidates.length > 1 ? "ambiguous-prefix" : "none" };
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

  const { order, matchedBy } = await findSePayOrder(orderNumber);

  if (!order) return success({ ignored: "ORDER_NOT_FOUND", orderNumber, matchedBy });
  const payment = order.payments[0];
  if (payment?.status === "PAID") return success({ status: "ALREADY_PAID", orderNumber: order.orderNumber, matchedBy });

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

  if (!isPaid) return success({ ignored: "PAYMENT_NOT_MATCHED", orderNumber: order.orderNumber, matchedBy });

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

  return success({ status: "PAID", orderNumber: order.orderNumber, matchedBy });
}
