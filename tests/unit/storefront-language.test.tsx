import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "@/components/storefront/language-provider";
import { SiteHeader } from "@/components/storefront/site-header";
import { StorefrontFooter, StorefrontFooterGate } from "@/components/storefront/storefront-footer";

const pathnameMock = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock()
}));

function renderWithLanguage(ui: React.ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

function TranslationProbe() {
  const { t } = useLanguage();
  return <p>{t("itemCount", { count: 3 })}</p>;
}

describe("storefront language controls", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    pathnameMock.mockReturnValue("/");
  });

  it("uses one full language button and remembers the toggled choice", () => {
    renderWithLanguage(<SiteHeader />);

    expect(screen.getByRole("link", { name: "All products" })).toBeInTheDocument();

    const languageButton = screen.getByRole("button", { name: "Switch to Tiếng Việt" });
    expect(languageButton).toHaveTextContent("EN");
    expect(languageButton).toHaveTextContent("VI");
    expect(screen.getAllByRole("button", { name: /Switch to/ })).toHaveLength(1);

    fireEvent.click(languageButton);

    expect(screen.getByRole("link", { name: "Tất cả sản phẩm" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chiến dịch" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tài khoản" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to English" })).toBeInTheDocument();
    expect(window.localStorage.getItem("starliar-language")).toBe("vi");
    expect(document.documentElement.lang).toBe("vi");
  });

  it("interpolates dynamic translation values", () => {
    renderWithLanguage(
      <>
        <SiteHeader />
        <TranslationProbe />
      </>
    );

    expect(screen.getByText("3 items")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to Tiếng Việt" }));

    expect(screen.getByText("3 sản phẩm")).toBeInTheDocument();
  });

  it("renders footer sample content using the selected language", () => {
    renderWithLanguage(
      <>
        <SiteHeader />
        <StorefrontFooter />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to Tiếng Việt" }));

    expect(screen.getByRole("contentinfo")).toHaveTextContent("Chăm sóc khách hàng");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Đổi trả");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Thanh toán an toàn");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Hà Nội, Việt Nam");
  });

  it("does not render the storefront footer inside admin routes", () => {
    pathnameMock.mockReturnValue("/admin/orders");

    renderWithLanguage(<StorefrontFooterGate />);

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
