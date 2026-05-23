import Link from "next/link";
import { SiteHeader } from "@/components/storefront/site-header";

export default function CheckoutResultPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <h1>Payment status</h1>
        <p>Your payment is being confirmed. Starliar updates the order from the payment provider callback.</p>
        <Link className="text-link" href="/shop">
          Return to shop
        </Link>
      </main>
    </>
  );
}
