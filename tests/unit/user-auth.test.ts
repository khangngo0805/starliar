import { describe, expect, it } from "vitest";
import { isUserEmail, normalizeCustomerRedirect } from "@/lib/auth/user";

describe("user auth helpers", () => {
  it("accepts normal email addresses for customer sessions", () => {
    expect(isUserEmail("customer@starliar.local")).toBe(true);
    expect(isUserEmail("not-an-email")).toBe(false);
    expect(isUserEmail(null)).toBe(false);
  });

  it("keeps post-login redirects inside the site", () => {
    expect(normalizeCustomerRedirect("/shop/trace-cap")).toBe("/shop/trace-cap");
    expect(normalizeCustomerRedirect("//evil.test")).toBe("/account");
    expect(normalizeCustomerRedirect("https://evil.test")).toBe("/account");
  });
});
