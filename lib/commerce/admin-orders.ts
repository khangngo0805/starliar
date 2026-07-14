import { prisma } from "@/lib/prisma";
export { formatOrderTotal } from "./money";

export function normalizeAdminOrderIds(input: unknown) {
  if (!input || typeof input !== "object" || !("ids" in input)) {
    throw new Error("Select at least one order to delete.");
  }

  const ids = (input as { ids?: unknown }).ids;
  if (!Array.isArray(ids)) {
    throw new Error("Select at least one order to delete.");
  }

  const normalizedIds = Array.from(
    new Set(ids.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean))
  );

  if (normalizedIds.length === 0) {
    throw new Error("Select at least one order to delete.");
  }

  return normalizedIds;
}

export async function deleteAdminOrders(input: unknown) {
  const ids = normalizeAdminOrderIds(input);
  const result = await prisma.order.deleteMany({ where: { id: { in: ids } } });
  return { deletedCount: result.count };
}

export function getAdminOrders() {
  return prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      totalVnd: true,
      status: true
    },
    orderBy: { createdAt: "desc" }
  });
}
