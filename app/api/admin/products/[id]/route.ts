import { NextResponse } from "next/server";
import { requireAdminSessionEmail } from "@/lib/auth/admin";
import { adminProductErrorMessage, adminProductSchema } from "@/lib/commerce/admin-products";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const data = adminProductSchema.parse(await request.json());
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        category: data.category,
        description: data.description,
        priceVnd: data.priceVnd,
        published: data.published,
        images: { create: data.media.map((src, position) => ({ src, alt: data.name, position })) },
        variants: { create: data.variants }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: adminProductErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  return NextResponse.json(await prisma.product.update({ where: { id }, data: { published: false } }));
}
