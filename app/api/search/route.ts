import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/commerce/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const products = await searchProducts(query);

  return NextResponse.json({ products });
}
