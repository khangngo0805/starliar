import { AdminNav } from "@/components/admin/admin-nav";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminOrders } from "@/lib/commerce/admin-orders";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <main className="admin-shell">
      <AdminNav />
      <h1>Orders</h1>
      <AdminOrdersList orders={orders} />
    </main>
  );
}
