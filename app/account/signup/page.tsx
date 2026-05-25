import bcrypt from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";
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
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeCustomerRedirect(params.next);

  return (
    <main className="account-auth-shell">
      <form action={signup} className="account-card">
        <p className="eyebrow">Starliar account</p>
        <h1>Create account</h1>
        {params.error ? <p className="form-error">Use a valid email and a password of at least 6 characters.</p> : null}
        <input name="name" placeholder="Name" />
        <input name="email" placeholder="Email" required type="email" />
        <input name="password" placeholder="Password" required type="password" />
        <input name="next" type="hidden" value={next} />
        <button className="primary-button" type="submit">
          Create account
        </button>
        <Link className="text-link" href={`/account/login?next=${encodeURIComponent(next)}`}>
          Already have an account
        </Link>
      </form>
    </main>
  );
}
