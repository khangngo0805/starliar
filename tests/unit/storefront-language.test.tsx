import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/components/storefront/language-provider";
import { SiteHeader } from "@/components/storefront/site-header";
import { StorefrontFooter, StorefrontFooterGate } from "@/components/storefront/storefront-footer";

const pathnameMock = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock()
}));

function renderWithLanguage(ui: React.ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("storefront language controls", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    pathnameMock.mockReturnValue("/");
  });

  it("switches the navbar copy between English and Vietnamese and remembers the choice", () => {
    renderWithLanguage(<SiteHeader />);

    expect(screen.getByRole("link", { name: "All products" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tiếng Việt" }));

    expect(screen.getByRole("link", { name: "All products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chiến dịch" })).toBeInTheDocument();
    expect(window.localStorage.getItem("starliar-language")).toBe("vi");
  });

  it("renders footer sample content using the selected language", () => {
    renderWithLanguage(
      <>
        <SiteHeader />
        <StorefrontFooter />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Tiếng Việt" }));

    expect(screen.getByRole("contentinfo")).toHaveTextContent("Chăm sóc khách hàng");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Đổi trả");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Thanh toán an toàn");
  });

  it("does not render the storefront footer inside admin routes", () => {
    pathnameMock.mockReturnValue("/admin/orders");

    renderWithLanguage(<StorefrontFooterGate />);

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
