import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/auth/admin";
import { adminProductSchema } from "@/lib/commerce/admin-products";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await getAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const data = adminProductSchema.parse(await request.json());
  const product = await prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      priceVnd: data.priceVnd,
      published: data.published,
      images: { create: data.media.map((src, position) => ({ src, alt: data.name, position })) },
      variants: { create: data.variants }
    }
  });

  return NextResponse.json(product, { status: 201 });
}
