import { prisma } from "@/lib/prisma";

type CustomerActivityInput = {
  orders: Array<{ status: string; totalVnd: number }>;
  favorites: Array<unknown>;
};

const paidOrderStatuses = new Set(["PAID", "COMPLETED", "FULFILLED"]);

export function summarizeCustomerActivity(activity: CustomerActivityInput) {
  return {
    orderCount: activity.orders.length,
    favoriteCount: activity.favorites.length,
    paidSpendVnd: activity.orders.reduce((total, order) => {
      if (!paidOrderStatuses.has(order.status)) return total;
      return total + order.totalVnd;
    }, 0)
  };
}

export async function getAdminCustomers() {
  const customers = await prisma.user.findMany({
    include: {
      orders: { select: { status: true, totalVnd: true, createdAt: true } },
      favorites: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return customers.map((customer) => {
    const summary = summarizeCustomerActivity(customer);
    const lastOrderAt = customer.orders.reduce<Date | null>((latest, order) => {
      if (!latest || order.createdAt > latest) return order.createdAt;
      return latest;
    }, null);

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      createdAt: customer.createdAt,
      lastOrderAt,
      ...summary
    };
  });
}

export function getAdminCustomer(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" }
      },
      favorites: {
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 } }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}
