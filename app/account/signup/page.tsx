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

async function signup(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = normalizeCustomerRedirect(String(formData.get("next") ?? "/account"));

  if (!isUserEmail(email) || password.length < 6) {
    redirect(`/account/signup?error=1&next=${encodeURIComponent(next)}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/account/login?exists=1&next=${encodeURIComponent(next)}`);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  await setUserSession(user.email);
  redirect(next);
}

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string; googleError?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeCustomerRedirect(params.next);

  return (
    <>
      <SiteHeader />
      <main className="account-auth-shell">
        <form action={signup} className="account-card">
          <p className="eyebrow"><LocalizedText textKey="starlierAccount" /></p>
          <h1><LocalizedText textKey="createAccount" /></h1>
          {params.error ? <p className="form-error"><LocalizedText textKey="invalidSignup" /></p> : null}
          <GoogleAuthError code={params.googleError} />
          <GoogleAuthButton href={`/api/auth/google?next=${encodeURIComponent(next)}`} />
          <LocalizedInput name="name" placeholderKey="fullName" />
          <LocalizedInput name="email" placeholderKey="email" required type="email" />
          <LocalizedInput name="password" placeholderKey="password" required type="password" />
          <input name="next" type="hidden" value={next} />
          <button className="primary-button" type="submit">
            <LocalizedText textKey="createAccount" />
          </button>
          <Link className="text-link" href={`/account/login?next=${encodeURIComponent(next)}`}>
            <LocalizedText textKey="alreadyHaveAccount" />
          </Link>
        </form>
      </main>
    </>
  );
}
