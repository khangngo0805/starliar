import { NextResponse } from "next/server";
import { requireAdminSessionEmail } from "@/lib/auth/admin";
import { parseShippingFeeInput, updateShippingFeeVnd } from "@/lib/commerce/store-settings";

export async function PATCH(request: Request) {
  if (!(await requireAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const data = parseShippingFeeInput(await request.json());
    await updateShippingFeeVnd(data.shippingFeeVnd);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "INVALID_SHIPPING_FEE" }, { status: 400 });
  }
}
