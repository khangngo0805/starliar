import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  googleAuthErrorCode,
  googleAuthNextCookieName,
  googleAuthStateCookieName,
  googleRedirectUri,
  normalizeGoogleProfile,
  normalizeGoogleRedirect,
  requireGoogleClientConfig
} from "@/lib/auth/google";
import { setUserSession } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

async function exchangeCodeForAccessToken({
  code,
  clientId,
  clientSecret,
  redirectUri
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  const payload = (await response.json()) as { access_token?: unknown };
  if (typeof payload.access_token !== "string") {
    throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  }

  return payload.access_token;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("GOOGLE_PROFILE_FAILED");
  }

  return normalizeGoogleProfile(await response.json());
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  try {
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const jar = await cookies();
    const storedState = jar.get(googleAuthStateCookieName)?.value;
    const next = normalizeGoogleRedirect(jar.get(googleAuthNextCookieName)?.value);

    jar.delete(googleAuthStateCookieName);
    jar.delete(googleAuthNextCookieName);

    if (!code || !state || state !== storedState) {
      throw new Error("GOOGLE_STATE_MISMATCH");
    }

    const { clientId, clientSecret } = requireGoogleClientConfig();
    const accessToken = await exchangeCodeForAccessToken({
      code,
      clientId,
      clientSecret,
      redirectUri: googleRedirectUri(request.url)
    });
    const profile = await fetchGoogleProfile(accessToken);
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { name: profile.name ?? undefined },
      create: {
        email: profile.email,
        name: profile.name,
        passwordHash: await bcrypt.hash(randomUUID(), 12)
      }
    });

    await setUserSession(user.email);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    const errorCode = googleAuthErrorCode(error);
    console.error("Google auth callback failed", { errorCode });
    return NextResponse.redirect(new URL(`/account/login?googleError=${errorCode}`, request.url));
  }
}
