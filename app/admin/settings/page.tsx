import { AdminNav } from "@/components/admin/admin-nav";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { requireAdmin } from "@/lib/auth/admin";
import { getShippingFeeVnd } from "@/lib/commerce/store-settings";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const shippingFeeVnd = await getShippingFeeVnd();

  return (
    <main className="admin-shell">
      <AdminNav />
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Store settings</p>
          <h1>Shipping</h1>
        </div>
      </div>
      <section className="admin-section">
        <ShippingSettingsForm shippingFeeVnd={shippingFeeVnd} />
      </section>
    </main>
  );
}
