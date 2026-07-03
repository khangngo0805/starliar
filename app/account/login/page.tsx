import bcrypt from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/storefront/site-header";
import { isUserEmail, normalizeCustomerRedirect, setUserSession } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = normalizeCustomerRedirect(String(formData.get("next") ?? "/account"));
  const user = isUserEmail(email) ? await prisma.user.findUnique({ where: { email } }) : null;

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect(`/account/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setUserSession(user.email);
  redirect(next);
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string; exists?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeCustomerRedirect(params.next);

  return (
    <>
      <SiteHeader />
      <main className="account-auth-shell">
        <form action={login} className="account-card">
          <p className="eyebrow">Starliar account</p>
          <h1>Sign in</h1>
          {params.error ? <p className="form-error">Email or password is incorrect.</p> : null}
          {params.exists ? <p className="muted">This email already has an account. Sign in instead.</p> : null}
          <input name="email" placeholder="Email" required type="email" />
          <input name="password" placeholder="Password" required type="password" />
          <input name="next" type="hidden" value={next} />
          <button className="primary-button" type="submit">
            Sign in
          </button>
          <Link className="text-link" href={`/account/signup?next=${encodeURIComponent(next)}`}>
            Create account
          </Link>
        </form>
      </main>
    </>
  );
}
