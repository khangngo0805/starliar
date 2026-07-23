"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type StorefrontLanguage = "en" | "vi";

type LanguageContextValue = {
  language: StorefrontLanguage;
  setLanguage: (language: StorefrontLanguage) => void;
  t: (key: TranslationKey) => string;
};

const STORAGE_KEY = "starliar-language";

export const translations = {
  en: {
    account: "Account",
    all: "All",
    campaign: "Campaign",
    campaignTitle: "After dark uniform",
    customerCare: "Customer care",
    delivery: "Delivery",
    exchangeReturns: "Exchange and returns",
    firstSignal: "First Signal",
    footerContact: "Contact",
    footerEmail: "care@starlier.com",
    footerHours: "Mon-Sat, 10:00-19:00",
    footerNote: "Quiet streetwear silhouettes, prepared for the first signal after midnight.",
    footerPolicies: "Policies",
    footerSocial: "Social",
    footerTagline: "Cinematic unisex fashion from Ho Chi Minh City.",
    languageEnglish: "English",
    languageVietnamese: "Tiếng Việt",
    latestRelease: "Latest release",
    newsletter: "Newsletter",
    newsletterCopy: "Receive drops, restocks, and private campaign notes.",
    paymentSecurity: "Secure payment",
    privacy: "Privacy",
    returns: "Returns",
    search: "Search",
    shipping: "Shipping",
    shop: "All products",
    shopAll: "View all",
    shopDescription: "Unisex clothing and accessories for testing the full Starlier buying flow.",
    shopNow: "Shop Now",
    sizeGuide: "Size guide",
    terms: "Terms",
    viewCampaign: "View Campaign"
  },
  vi: {
    account: "Tài khoản",
    all: "Tất cả",
    campaign: "Chiến dịch",
    campaignTitle: "Đồng phục sau nửa đêm",
    customerCare: "Chăm sóc khách hàng",
    delivery: "Giao hàng",
    exchangeReturns: "Đổi trả",
    firstSignal: "First Signal",
    footerContact: "Liên hệ",
    footerEmail: "care@starlier.com",
    footerHours: "Thứ 2-Thứ 7, 10:00-19:00",
    footerNote: "Những phom dáng streetwear lặng và sắc, dành cho tín hiệu đầu tiên sau nửa đêm.",
    footerPolicies: "Chính sách",
    footerSocial: "Mạng xã hội",
    footerTagline: "Thời trang unisex điện ảnh từ Thành phố Hồ Chí Minh.",
    languageEnglish: "English",
    languageVietnamese: "Tiếng Việt",
    latestRelease: "Latest release",
    newsletter: "Bản tin",
    newsletterCopy: "Nhận thông tin drop mới, restock và campaign riêng.",
    paymentSecurity: "Thanh toán an toàn",
    privacy: "Bảo mật",
    returns: "Đổi trả",
    search: "Tìm kiếm",
    shipping: "Phí ship",
    shop: "All products",
    shopAll: "Xem tất cả",
    shopDescription: "Quần áo và phụ kiện unisex cho trải nghiệm mua hàng Starlier.",
    shopNow: "Mua ngay",
    sizeGuide: "Bảng size",
    terms: "Điều khoản",
    viewCampaign: "Xem chiến dịch"
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isStorefrontLanguage(value: string | null): value is StorefrontLanguage {
  return value === "en" || value === "vi";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<StorefrontLanguage>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return isStorefrontLanguage(storedLanguage) ? storedLanguage : "en";
  });

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (nextLanguage: StorefrontLanguage) => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage;
    };

    return {
      language,
      setLanguage,
      t: (key) => translations[language][key]
    };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
