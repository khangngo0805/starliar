import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/commerce/cart";

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
      <div className="admin-list">
        {products.map((product) => (
          <Link className="admin-row" href={`/admin/products/${product.id}`} key={product.id}>
            <span>{product.name}</span>
            <span>{formatVnd(product.priceVnd)}</span>
            <span>{product.published ? "Published" : "Hidden"}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
