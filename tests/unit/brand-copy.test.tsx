import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";
import { LanguageProvider } from "@/components/storefront/language-provider";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";

describe("Starlier brand copy", () => {
  it("uses Starlier in site metadata", () => {
    expect(metadata.title).toBe("Starlier");
    expect(metadata.description).toContain("Starlier");
  });

  it("uses the corrected Starlier logo in the storefront footer", () => {
    render(
      <LanguageProvider>
        <StorefrontFooter />
      </LanguageProvider>
    );

    expect(screen.getByRole("contentinfo")).toHaveTextContent("STARLIER");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 STARLIER");
  });
});
