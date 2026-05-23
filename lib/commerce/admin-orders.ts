import { prisma } from "@/lib/prisma";

export function formatOrderTotal(totalVnd: number) {
  return `${totalVnd.toLocaleString("vi-VN")} VND`;
}

export function getAdminOrders() {
  return prisma.order.findMany({
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" }
  });
}
