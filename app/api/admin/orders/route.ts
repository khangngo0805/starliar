import { NextResponse } from "next/server";
import { requireAdminSessionEmail } from "@/lib/auth/admin";
import { deleteAdminOrders } from "@/lib/commerce/admin-orders";

export async function DELETE(request: Request) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const result = await deleteAdminOrders(await request.json());
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INVALID_ORDER_DELETE_REQUEST" }, { status: 400 });
  }
}
