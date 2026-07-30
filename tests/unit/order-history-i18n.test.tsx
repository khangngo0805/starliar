import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GuestOrderLookup } from "@/components/commerce/guest-order-lookup";
import { LanguageProvider } from "@/components/storefront/language-provider";

describe("order history translations", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("localizes guest order lookup in Vietnamese", () => {
    window.localStorage.setItem("starliar-language", "vi");

    render(
      <LanguageProvider>
        <GuestOrderLookup />
      </LanguageProvider>
    );

    expect(screen.getByRole("heading", { name: "Tìm lịch sử đơn hàng" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email dùng khi thanh toán")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Số điện thoại dùng khi thanh toán")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tìm đơn hàng" })).toBeInTheDocument();
  });
});
