import { NextResponse } from "next/server";
import { getShopProducts, searchProducts } from "@/lib/commerce/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const products = query.trim().length >= 2 ? await searchProducts(query) : await getShopProducts();

  return NextResponse.json({ products });
}
