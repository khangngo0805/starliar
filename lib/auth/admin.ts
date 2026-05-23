import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const adminCookieName = "starliar-admin";

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && email.includes("@"));
}

export async function getAdminSessionEmail() {
  const jar = await cookies();
  return jar.get(adminCookieName)?.value ?? null;
}

export async function requireAdmin() {
  const email = await getAdminSessionEmail();
  if (!isAdminEmail(email)) {
    redirect("/admin/login");
  }
  return email;
}
