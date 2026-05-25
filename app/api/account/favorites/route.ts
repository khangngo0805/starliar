import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { favoriteProductIds } from "@/lib/commerce/favorites";
import { prisma } from "@/lib/prisma";

const favoriteRequestSchema = z.object({
  productId: z.string().min(1)
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, favorites: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    authenticated: true,
    favorites: favoriteProductIds(favorites)
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
  }

  const parsed = favoriteRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_FAVORITE_REQUEST" }, { status: 400 });
  }

  const { productId } = parsed.data;
  const product = await prisma.product.findFirst({ where: { id: productId, published: true }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: {
      userId: user.id,
      productId
    }
  });

  return NextResponse.json({ favorited: true });
}
