import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/auth/admin";
import { campaignMediaSchema } from "@/lib/commerce/admin-campaign";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await getAdminSessionEmail())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const data = campaignMediaSchema.parse(await request.json());
  return NextResponse.json(await prisma.campaignMedia.create({ data }), { status: 201 });
}
