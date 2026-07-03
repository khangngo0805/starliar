import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const adminCookieName = "starliar-admin";

export function isAdminEmail(email: string | null | undefined): email is string {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export async function getAdminSessionEmail() {
  const jar = await cookies();
  return jar.get(adminCookieName)?.value ?? null;
}

export async function getCurrentAdmin() {
  const email = await getAdminSessionEmail();
  if (!isAdminEmail(email)) return null;
  return prisma.adminUser.findUnique({ where: { email } });
}

export async function requireAdminSessionEmail() {
  const admin = await getCurrentAdmin();
  return admin?.email ?? null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
