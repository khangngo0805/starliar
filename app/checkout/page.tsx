import { SiteHeader } from "@/components/storefront/site-header";
import { CheckoutForm } from "@/components/commerce/checkout-form";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "buy-now" ? "buy-now" : "cart";

  return (
    <>
      <SiteHeader />
      <main className="page-shell checkout-shell">
        <div className="page-heading">
          <h1>{mode === "buy-now" ? "Buy now" : "Checkout"}</h1>
          <p>Enter delivery details, drop a location pin, then generate your SePay QR.</p>
        </div>
        <CheckoutForm mode={mode} />
      </main>
    </>
  );
}
