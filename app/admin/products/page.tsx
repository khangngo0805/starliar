import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { variants: true, images: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <main className="admin-shell">
      <AdminNav />
      <div className="admin-heading">
        <h1>Products</h1>
        <Link className="primary-link" href="/admin/products/new">
          New product
        </Link>
      </div>
      <AdminProductsList products={products} />
    </main>
  );
}
