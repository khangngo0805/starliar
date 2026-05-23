import { SiteHeader } from "@/components/storefront/site-header";
import { CheckoutForm } from "@/components/commerce/checkout-form";

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell checkout-shell">
        <div className="page-heading">
          <h1>Checkout</h1>
          <p>QR payment is prepared for Vietnamese checkout first.</p>
        </div>
        <CheckoutForm />
      </main>
    </>
  );
}
