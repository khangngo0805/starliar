import { normalizeCustomerRedirect } from "./user";

export const googleAuthStateCookieName = "starliar-google-state";
export const googleAuthNextCookieName = "starliar-google-next";

export type GoogleProfile = {
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
};

export function normalizeGoogleRedirect(value: string | null | undefined) {
  return normalizeCustomerRedirect(value);
}

export function googleRedirectUri(requestUrl: string) {
  const configuredUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configuredUri) return configuredUri;

  return new URL("/api/auth/google/callback", requestUrl).toString();
}

export function buildGoogleAuthUrl({
  clientId,
  redirectUri,
  state
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

export function normalizeGoogleProfile(profile: GoogleProfile) {
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (!email || profile.email_verified !== true) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }

  return {
    email,
    name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : null
  };
}

export function requireGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_AUTH_NOT_CONFIGURED");
  }

  return { clientId, clientSecret };
}
