import Link from "next/link";
import { UserRound } from "lucide-react";
import { SearchDialog } from "./search-dialog";
import { CartLink } from "./cart-link";
import { categoryToParam, shopCategories } from "@/lib/commerce/categories";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header ${overlay ? "site-header-overlay" : ""}`}>
      <nav className="site-header-nav" aria-label="Primary navigation">
        <div className="nav-dropdown">
          <Link href="/shop">Shop</Link>
          <div className="nav-dropdown-panel">
            <Link href="/shop">View all</Link>
            {shopCategories.map((category) => (
              <Link href={`/shop?category=${categoryToParam(category)}`} key={category}>
                {category}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#campaign">Campaign</Link>
      </nav>
      <Link className="site-logo" href="/">
        STARLIAR
      </Link>
      <div className="site-header-actions">
        <SearchDialog />
        <Link aria-label="Account" className="icon-link" href="/account">
          <UserRound size={21} />
        </Link>
        <CartLink />
      </div>
    </header>
  );
}
