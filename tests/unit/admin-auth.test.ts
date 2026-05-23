import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/auth/admin";

describe("admin auth helpers", () => {
  it("requires an admin identity", () => {
    expect(isAdminEmail("admin@starliar.local")).toBe(true);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
