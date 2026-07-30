import { SiteHeader } from "@/components/storefront/site-header";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { LocalizedText } from "@/components/storefront/localized-text";
import { getShippingFeeVnd } from "@/lib/commerce/store-settings";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "buy-now" ? "buy-now" : "cart";
  const shippingFeeVnd = await getShippingFeeVnd();

  return (
    <>
      <SiteHeader />
      <main className="page-shell checkout-shell">
        <div className="page-heading">
          <h1>
            <LocalizedText textKey={mode === "buy-now" ? "buyNow" : "checkout"} />
          </h1>
          <p><LocalizedText textKey="checkoutDescription" /></p>
        </div>
        <CheckoutForm mode={mode} shippingFeeVnd={shippingFeeVnd} />
      </main>
    </>
  );
}
