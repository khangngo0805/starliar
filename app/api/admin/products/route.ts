import { NextResponse } from "next/server";
import { requireAdminSessionEmail } from "@/lib/auth/admin";
import { adminProductErrorMessage, adminProductSchema, deleteAdminProducts } from "@/lib/commerce/admin-products";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const data = adminProductSchema.parse(await request.json());
    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: adminProductErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const result = await deleteAdminProducts(await request.json());
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INVALID_PRODUCT_DELETE_REQUEST" }, { status: 400 });
  }
}
