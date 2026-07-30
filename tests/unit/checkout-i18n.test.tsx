import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { SePayQrPanel } from "@/components/commerce/sepay-qr-panel";
import { LanguageProvider } from "@/components/storefront/language-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe("checkout translations", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("localizes checkout fields and summary in Vietnamese", () => {
    window.localStorage.setItem("starliar-language", "vi");

    render(
      <LanguageProvider>
        <CheckoutForm shippingFeeVnd={40000} />
      </LanguageProvider>
    );

    expect(screen.getByRole("heading", { name: "Liên hệ" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Họ và tên" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Địa chỉ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Địa chỉ giao hàng" })).toBeInTheDocument();
    expect(screen.getByText("Ghim vị trí giao hàng")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tóm tắt đơn hàng" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thanh toán bằng QR" })).toBeDisabled();
  });

  it("localizes QR instructions without changing payment data", () => {
    window.localStorage.setItem("starliar-language", "vi");

    render(
      <LanguageProvider>
        <SePayQrPanel
          accountHolder="NGO QUY KHANG"
          accountNumber="23965057"
          bankName="ACB"
          issuedAtMs={Date.now()}
          orderNumber="STL-123"
          qrUrl="https://example.com/qr.png"
        />
      </LanguageProvider>
    );

    expect(screen.getByRole("heading", { name: "Quét mã để thanh toán" })).toBeInTheDocument();
    expect(screen.getByText("Ngân hàng")).toBeInTheDocument();
    expect(screen.getByText("ACB")).toBeInTheDocument();
    expect(screen.getByText("STL-123")).toBeInTheDocument();
  });
});
