import { describe, expect, it } from "vitest";
import { buildGoogleAuthUrl, googleAuthErrorCode, normalizeGoogleProfile, normalizeGoogleRedirect } from "@/lib/auth/google";

describe("google auth helpers", () => {
  it("builds the Google OAuth URL with safe scopes and state", () => {
    const url = new URL(
      buildGoogleAuthUrl({
        clientId: "client-123",
        redirectUri: "https://wwwstarlier.com/api/auth/google/callback",
        state: "state-123"
      })
    );

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.pathname).toBe("/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("client-123");
    expect(url.searchParams.get("redirect_uri")).toBe("https://wwwstarlier.com/api/auth/google/callback");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
  });

  it("normalizes verified Google profile data", () => {
    expect(
      normalizeGoogleProfile({
        email: " Customer@Example.COM ",
        email_verified: true,
        name: "Customer Name"
      })
    ).toEqual({
      email: "customer@example.com",
      name: "Customer Name"
    });
  });

  it("rejects unverified or missing Google email values", () => {
    expect(() => normalizeGoogleProfile({ email: "customer@example.com", email_verified: false })).toThrow(
      "GOOGLE_EMAIL_NOT_VERIFIED"
    );
    expect(() => normalizeGoogleProfile({ email_verified: true })).toThrow("GOOGLE_EMAIL_NOT_VERIFIED");
  });

  it("keeps Google login redirects on local account paths", () => {
    expect(normalizeGoogleRedirect("/orders")).toBe("/orders");
    expect(normalizeGoogleRedirect("https://evil.test")).toBe("/account");
    expect(normalizeGoogleRedirect("//evil.test/path")).toBe("/account");
  });

  it("maps known Google auth failures to safe URL codes", () => {
    expect(googleAuthErrorCode(new Error("GOOGLE_AUTH_NOT_CONFIGURED"))).toBe("not_configured");
    expect(googleAuthErrorCode(new Error("GOOGLE_TOKEN_EXCHANGE_FAILED"))).toBe("token_exchange");
    expect(googleAuthErrorCode(new Error("GOOGLE_STATE_MISMATCH"))).toBe("state");
    expect(googleAuthErrorCode(new Error("SOMETHING_ELSE"))).toBe("unknown");
  });
});
