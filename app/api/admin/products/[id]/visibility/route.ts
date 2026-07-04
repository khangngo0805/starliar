import { NextResponse } from "next/server";
import { requireAdminSessionEmail } from "@/lib/auth/admin";
import { adminProductVisibilitySchema } from "@/lib/commerce/admin-products";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const data = adminProductVisibilitySchema.parse(await request.json());
  const product = await prisma.product.update({
    where: { id },
    data: { published: data.published }
  });

  return NextResponse.json(product);
}
