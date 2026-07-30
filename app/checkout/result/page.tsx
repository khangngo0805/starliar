import Link from "next/link";
import { SiteHeader } from "@/components/storefront/site-header";
import { LocalizedText } from "@/components/storefront/localized-text";

export default function CheckoutResultPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <h1><LocalizedText textKey="paymentStatus" /></h1>
        <p><LocalizedText textKey="paymentResultDescription" /></p>
        <Link className="text-link" href="/shop">
          <LocalizedText textKey="returnToShop" />
        </Link>
      </main>
    </>
  );
}
