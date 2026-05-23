import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true, images: true } });
  if (!product) notFound();

  return (
    <main className="admin-shell">
      <AdminNav />
      <h1>{product.name}</h1>
      <ProductForm action={`/api/admin/products/${product.id}`} method="PATCH" />
    </main>
  );
}
