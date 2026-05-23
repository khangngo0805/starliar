import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header ${overlay ? "site-header-overlay" : ""}`}>
      <nav className="site-header-nav" aria-label="Primary navigation">
        <Link href="/shop">Shop</Link>
        <Link href="/#campaign">Campaign</Link>
        <Link href="/admin/products">Admin</Link>
      </nav>
      <Link className="site-logo" href="/">
        STARLIAR
      </Link>
      <div className="site-header-actions">
        <Search aria-label="Search" size={21} />
        <UserRound aria-label="Account" size={21} />
        <Link aria-label="Cart" href="/cart">
          <ShoppingBag size={21} />
        </Link>
      </div>
    </header>
  );
}
