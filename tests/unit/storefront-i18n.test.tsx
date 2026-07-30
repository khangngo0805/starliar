import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "@/components/storefront/language-provider";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { LocalizedProductCollectionText } from "@/components/storefront/localized-text";
import { LocalizedStatus } from "@/components/storefront/localized-status";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

const product = {
  id: "shirt-1",
  slug: "axis-shirt",
  name: "Axis Shirt",
  category: "Shirt",
  priceVnd: 1290000,
  variants: [{ id: "variant-1", size: "M", stock: 2 }]
};

function StorefrontLabelProbe() {
  const { t } = useLanguage();

  return (
    <>
      <span>{t("latestRelease")}</span>
      <span>{t("cartWithCount", { count: 2 })}</span>
      <span>{t("addFavorite", { product: product.name })}</span>
      <span>{t("removeFavorite", { product: product.name })}</span>
      <span>{t("lowStock", { count: 2 })}</span>
      <span>{t("pieceAvailable")}</span>
      <span>{t("soldOut")}</span>
      <span><LocalizedProductCollectionText category="Shirt" collection="First Signal" /></span>
      <span><LocalizedStatus status="UNKNOWN_PROVIDER_STATE" /></span>
    </>
  );
}

describe("storefront product translations", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("localizes size and purchase actions without changing product data", () => {
    window.localStorage.setItem("starliar-language", "vi");
    render(
      <LanguageProvider>
        <VariantPicker product={product} />
      </LanguageProvider>
    );

    expect(screen.getByText("Kích cỡ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mua ngay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm vào giỏ" })).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("localizes storefront labels used by the home grid and header", () => {
    window.localStorage.setItem("starliar-language", "vi");
    render(
      <LanguageProvider>
        <StorefrontLabelProbe />
      </LanguageProvider>
    );

    expect(screen.getByText("Phát hành mới nhất")).toBeInTheDocument();
    expect(screen.getByText("Giỏ hàng, 2 sản phẩm")).toBeInTheDocument();
    expect(screen.getByText("Thêm Axis Shirt vào mục yêu thích")).toBeInTheDocument();
    expect(screen.getByText("Xóa Axis Shirt khỏi mục yêu thích")).toBeInTheDocument();
    expect(screen.getByText("Sắp hết hàng: còn 2")).toBeInTheDocument();
    expect(screen.getByText("Còn 1 sản phẩm")).toBeInTheDocument();
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(screen.getByText("Sơ mi thuộc First Signal, hoàn thiện gọn gàng cho trang phục hằng ngày.")).toBeInTheDocument();
    expect(screen.getByText("Chưa có trạng thái")).toBeInTheDocument();
  });
});
