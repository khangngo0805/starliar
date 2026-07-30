import bcrypt from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleAuthButton } from "@/components/storefront/google-auth-button";
import { GoogleAuthError } from "@/components/storefront/google-auth-error";
import { LocalizedInput } from "@/components/storefront/localized-input";
import { LocalizedText } from "@/components/storefront/localized-text";
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
  searchParams: Promise<{ error?: string; next?: string; exists?: string; googleError?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeCustomerRedirect(params.next);

  return (
    <>
      <SiteHeader />
      <main className="account-auth-shell">
        <form action={login} className="account-card">
          <p className="eyebrow"><LocalizedText textKey="starlierAccount" /></p>
          <h1><LocalizedText textKey="signIn" /></h1>
          {params.error ? <p className="form-error"><LocalizedText textKey="incorrectCredentials" /></p> : null}
          <GoogleAuthError code={params.googleError} />
          {params.exists ? <p className="muted"><LocalizedText textKey="accountExists" /></p> : null}
          <GoogleAuthButton href={`/api/auth/google?next=${encodeURIComponent(next)}`} />
          <LocalizedInput name="email" placeholderKey="email" required type="email" />
          <LocalizedInput name="password" placeholderKey="password" required type="password" />
          <input name="next" type="hidden" value={next} />
          <button className="primary-button" type="submit">
            <LocalizedText textKey="signIn" />
          </button>
          <Link className="text-link" href={`/account/signup?next=${encodeURIComponent(next)}`}>
            <LocalizedText textKey="createAccount" />
          </Link>
        </form>
      </main>
    </>
  );
}
