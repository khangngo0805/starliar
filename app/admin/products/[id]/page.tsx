import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { ProductVisibilityActions } from "@/components/admin/product-visibility-actions";
import { requireAdmin } from "@/lib/auth/admin";
import { buildProductFormInitialValue } from "@/lib/commerce/admin-products";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true, images: true } });
  if (!product) notFound();

  return (
    <main className="admin-shell">
      <AdminNav />
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{product.published ? "Published" : "Hidden"}</p>
          <h1>{product.name}</h1>
        </div>
        <ProductVisibilityActions productId={product.id} productSlug={product.slug} published={product.published} />
      </div>
      <ProductForm
        action={`/api/admin/products/${product.id}`}
        initialProduct={buildProductFormInitialValue(product)}
        method="PATCH"
      />
    </main>
  );
}
