import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    redirect("/admin/login?error=1");
  }

  const jar = await cookies();
  jar.set(adminCookieName, admin.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  redirect("/admin/products");
}

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <form action={login} className="admin-card">
        <h1>Starlier Admin</h1>
        <input name="email" placeholder="Email" required type="email" />
        <input name="password" placeholder="Password" required type="password" />
        <button className="primary-button" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
