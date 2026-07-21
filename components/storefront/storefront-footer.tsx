"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-provider";

export function StorefrontFooterGate() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <StorefrontFooter />;
}

export function StorefrontFooter() {
  const { t } = useLanguage();

  return (
    <footer className="storefront-footer">
      <div className="storefront-footer-brand">
        <Link className="site-logo footer-logo" href="/">
          STARLIAR
        </Link>
        <p>{t("footerTagline")}</p>
      </div>
      <nav className="footer-column" aria-label={t("customerCare")}>
        <h2>{t("customerCare")}</h2>
        <Link href="/orders">{t("delivery")}</Link>
        <Link href="/orders">{t("exchangeReturns")}</Link>
        <Link href="/shop">{t("sizeGuide")}</Link>
        <Link href="/checkout">{t("paymentSecurity")}</Link>
      </nav>
      <nav className="footer-column" aria-label={t("footerPolicies")}>
        <h2>{t("footerPolicies")}</h2>
        <Link href="/shop">{t("shipping")}</Link>
        <Link href="/orders">{t("returns")}</Link>
        <Link href="/account">{t("privacy")}</Link>
        <Link href="/account">{t("terms")}</Link>
      </nav>
      <div className="footer-column">
        <h2>{t("footerContact")}</h2>
        <a href={`mailto:${t("footerEmail")}`}>{t("footerEmail")}</a>
        <span>{t("footerHours")}</span>
        <span>Ho Chi Minh City, VN</span>
      </div>
      <div className="footer-column footer-newsletter">
        <h2>{t("newsletter")}</h2>
        <p>{t("newsletterCopy")}</p>
        <form className="footer-newsletter-form" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="footer-email">
            Email
          </label>
          <input id="footer-email" name="email" placeholder="Email" type="email" />
          <button type="submit">OK</button>
        </form>
      </div>
      <div className="storefront-footer-bottom">
        <p>{t("footerNote")}</p>
        <div aria-label={t("footerSocial")}>
          <a href="https://instagram.com" rel="noreferrer" target="_blank">
            Instagram
          </a>
          <a href="https://tiktok.com" rel="noreferrer" target="_blank">
            TikTok
          </a>
        </div>
        <span>© 2026 STARLIAR</span>
      </div>
    </footer>
  );
}
