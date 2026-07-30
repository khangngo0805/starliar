import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GoogleAuthButton } from "@/components/storefront/google-auth-button";
import { LanguageProvider } from "@/components/storefront/language-provider";

describe("account translations", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("localizes the Google sign-in action in Vietnamese", () => {
    window.localStorage.setItem("starliar-language", "vi");

    render(
      <LanguageProvider>
        <GoogleAuthButton href="/api/auth/google" />
      </LanguageProvider>
    );

    expect(screen.getByRole("link", { name: "Tiếp tục với Google" })).toHaveAttribute(
      "href",
      "/api/auth/google"
    );
  });
});
