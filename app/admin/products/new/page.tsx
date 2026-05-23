import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <main className="admin-shell">
      <AdminNav />
      <h1>New product</h1>
      <ProductForm action="/api/admin/products" />
    </main>
  );
}
