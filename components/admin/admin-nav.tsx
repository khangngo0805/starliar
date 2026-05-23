import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="admin-nav">
      <Link href="/admin/products">Products</Link>
      <Link href="/admin/orders">Orders</Link>
      <Link href="/admin/campaign">Campaign</Link>
      <Link href="/">Storefront</Link>
    </nav>
  );
}
