import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  googleAuthNextCookieName,
  googleAuthStateCookieName,
  googleRedirectUri,
  normalizeGoogleRedirect,
  requireGoogleClientConfig
} from "@/lib/auth/google";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const { clientId } = requireGoogleClientConfig();
    const state = randomUUID();
    const next = normalizeGoogleRedirect(requestUrl.searchParams.get("next"));
    const jar = await cookies();
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 10
    };

    jar.set(googleAuthStateCookieName, state, cookieOptions);
    jar.set(googleAuthNextCookieName, next, cookieOptions);

    return NextResponse.redirect(
      buildGoogleAuthUrl({
        clientId,
        redirectUri: googleRedirectUri(request.url),
        state
      })
    );
  } catch {
    return NextResponse.redirect(new URL("/account/login?googleError=1", request.url));
  }
}
