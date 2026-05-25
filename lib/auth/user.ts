import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const userCookieName = "starliar-user";

export function isUserEmail(email: string | null | undefined): email is string {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export function normalizeCustomerRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function getUserSessionEmail() {
  const jar = await cookies();
  return jar.get(userCookieName)?.value ?? null;
}

export async function getCurrentUser() {
  const email = await getUserSessionEmail();
  if (!isUserEmail(email)) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function setUserSession(email: string) {
  const jar = await cookies();
  jar.set(userCookieName, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(userCookieName);
}
