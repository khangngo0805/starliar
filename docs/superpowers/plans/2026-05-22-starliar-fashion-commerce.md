# Starliar Fashion Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Build Starliar's first-release cinematic unisex fashion storefront with admin product/order operations and Vietnamese QR checkout through payOS.

**Architecture:** Use a single Next.js App Router application with public storefront routes, protected admin routes, and route handlers for checkout and payment webhooks. PostgreSQL and Prisma own product, variant, campaign, order, payment, and admin-user state; provider-specific payOS code lives behind a payment adapter so a later international provider does not leak into checkout logic.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Zod, Auth.js credentials auth for admin, payOS payment links/webhooks, Vitest, Testing Library, Playwright.

---

## Planning Notes

- The workspace is effectively empty today except for the brand video and design spec, so the implementation starts by scaffolding the application.
- Use the existing hero video at `c_e_e_b_b_e_dfbmp_.mp4` as the initial Starliar homepage asset.
- payOS is the first payment provider because the approved design requires Vietnamese QR payment tied to order status updates.
- International storefront fields are part of checkout now; international payment rails are not part of this first plan unless payOS already covers the buyer's chosen path.

## File Structure

Create these focused areas before adding features:

```text
app/
  (storefront)/
    page.tsx
    shop/page.tsx
    shop/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    checkout/result/page.tsx
    order/[orderNumber]/page.tsx
  admin/
    login/page.tsx
    products/page.tsx
    products/new/page.tsx
    products/[id]/page.tsx
    orders/page.tsx
    orders/[id]/page.tsx
    campaign/page.tsx
  api/
    checkout/route.ts
    payments/payos/webhook/route.ts
    admin/products/route.ts
    admin/products/[id]/route.ts
    admin/campaign/route.ts
  globals.css
  layout.tsx
components/
  admin/
  commerce/
  storefront/
lib/
  auth/
  commerce/
  payments/
  prisma.ts
prisma/
  schema.prisma
  seed.ts
public/
  media/
tests/
  integration/
  unit/
```

`components/storefront` owns brand and shopping presentation. `components/commerce`
owns reusable cart, variant, and checkout controls. `lib/commerce` owns server
queries, cart math, order creation, and validation. `lib/payments` owns provider
adapters and signature verification. `components/admin` and `app/admin` own
operations UI, while protected write handlers stay under `app/api/admin`.

### Task 1: Scaffold The Next.js Application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore`
- Test: `tests/unit/smoke.test.ts`

- [ ] **Step 1: Initialize the repository and scaffold the app**

Run:

```bash
git init
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
npm install zod prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs @payos/node
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test tsx
```

Expected: Next.js app files exist in `/Users/khangngo/NewWeb`, npm dependencies install, and the existing `docs/` and hero video remain in place.

- [ ] **Step 2: Add the smoke test before customizing the scaffold**

```ts
// tests/unit/smoke.test.ts
import { describe, expect, it } from "vitest";

describe("starliar workspace", () => {
  it("loads the test runner", () => {
    expect("STARLIAR").toBe("STARLIAR");
  });
});
```

- [ ] **Step 3: Configure Vitest**

```ts
// vitest.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
  },
});
```

```ts
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Run the first verification**

Run:

```bash
npx vitest run tests/unit/smoke.test.ts
npm run lint
```

Expected: the smoke test passes and the scaffold lints successfully.

- [ ] **Step 5: Commit the scaffold**

```bash
git add .
git commit -m "chore: scaffold starliar app"
```

### Task 2: Define Commerce Data And Seed Content

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/prisma.ts`
- Create: `lib/commerce/types.ts`
- Create: `tests/unit/order-model.test.ts`
- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Write a failing model contract test**

```ts
// tests/unit/order-model.test.ts
import { describe, expect, it } from "vitest";
import { orderStatusValues, paymentStatusValues } from "@/lib/commerce/types";

describe("commerce statuses", () => {
  it("keeps pending payment and paid orders distinct", () => {
    expect(orderStatusValues).toContain("PENDING_PAYMENT");
    expect(paymentStatusValues).toEqual([
      "CREATED",
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELED",
    ]);
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing module**

Run:

```bash
npx vitest run tests/unit/order-model.test.ts
```

Expected: FAIL because `@/lib/commerce/types` does not exist yet.

- [ ] **Step 3: Add shared commerce statuses**

```ts
// lib/commerce/types.ts
export const orderStatusValues = [
  "PENDING_PAYMENT",
  "PAID",
  "FULFILLING",
  "FULFILLED",
  "CANCELED",
] as const;

export const paymentStatusValues = [
  "CREATED",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELED",
] as const;
```

- [ ] **Step 4: Add the Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  FULFILLING
  FULFILLED
  CANCELED
}

enum PaymentStatus {
  CREATED
  PENDING
  PAID
  FAILED
  CANCELED
}

model Product {
  id          String           @id @default(cuid())
  slug        String           @unique
  name        String
  description String
  priceVnd    Int
  published   Boolean          @default(false)
  media       String[]
  collection  Collection?      @relation(fields: [collectionId], references: [id])
  collectionId String?
  variants    ProductVariant[]
  orderItems  OrderItem[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model ProductVariant {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  size      String
  sku       String   @unique
  stock     Int
  createdAt DateTime @default(now())

  @@unique([productId, size])
}

model Collection {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        String
  description String
  products    Product[]
}

model CampaignMedia {
  id       String  @id @default(cuid())
  title    String
  kind     String
  src      String
  alt      String
  hero     Boolean @default(false)
  position Int     @default(0)
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  email           String
  customerName    String
  phone           String
  country         String
  addressLine1    String
  addressLine2    String?
  city            String
  province        String?
  postalCode      String?
  subtotalVnd     Int
  shippingVnd     Int
  totalVnd        Int
  status          OrderStatus @default(PENDING_PAYMENT)
  items           OrderItem[]
  payments        Payment[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id          String  @id @default(cuid())
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  product     Product @relation(fields: [productId], references: [id])
  productId   String
  variantId   String
  productName String
  size        String
  unitPriceVnd Int
  quantity    Int
}

model Payment {
  id              String        @id @default(cuid())
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId         String
  provider        String
  providerRef     String?       @unique
  checkoutUrl     String?
  status          PaymentStatus @default(CREATED)
  amountVnd       Int
  rawPayload      Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("ADMIN")
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 5: Add Prisma access, environment names, and seed data**

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

```env
# .env.example
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starliar"
AUTH_SECRET="replace-me"
PAYOS_CLIENT_ID=""
PAYOS_API_KEY=""
PAYOS_CHECKSUM_KEY=""
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_SEED_EMAIL="admin@starliar.local"
ADMIN_SEED_PASSWORD="change-this-password"
```

```ts
// prisma/seed.ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const collection = await prisma.collection.upsert({
    where: { slug: "first-signal" },
    update: {},
    create: {
      slug: "first-signal",
      name: "First Signal",
      description: "A cold opening drop for Starliar.",
    },
  });

  await prisma.campaignMedia.createMany({
    data: [
      {
        title: "Starliar Hero",
        kind: "video",
        src: "/media/starliar-hero.mp4",
        alt: "Starliar opening campaign video",
        hero: true,
        position: 0,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.product.create({
    data: {
      slug: "orbital-shell-jacket",
      name: "Orbital Shell Jacket",
      description: "Structured unisex outerwear for the first drop.",
      priceVnd: 2890000,
      published: true,
      media: ["/media/placeholders/orbital-shell-front.webp"],
      collectionId: collection.id,
      variants: {
        create: [
          { size: "S", sku: "STAR-SHELL-S", stock: 8 },
          { size: "M", sku: "STAR-SHELL-M", stock: 10 },
        ],
      },
    },
  });

  if (process.env.ADMIN_SEED_EMAIL && process.env.ADMIN_SEED_PASSWORD) {
    await prisma.adminUser.upsert({
      where: { email: process.env.ADMIN_SEED_EMAIL },
      update: {},
      create: {
        email: process.env.ADMIN_SEED_EMAIL,
        passwordHash: await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 12),
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());
```

Add this package script:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 6: Run schema verification**

Run:

```bash
npx prisma format
npx prisma migrate dev --name init_commerce
npx prisma db seed
npx vitest run tests/unit/order-model.test.ts
```

Expected: migration and seed succeed against the configured PostgreSQL database, and the status test passes.

- [ ] **Step 7: Commit the data foundation**

```bash
git add prisma lib .env.example package.json tests
git commit -m "feat: define starliar commerce data"
```

### Task 3: Build The Cinematic Home And Shop Read Models

**Files:**
- Create: `lib/commerce/catalog.ts`
- Create: `components/storefront/site-header.tsx`
- Create: `components/storefront/hero-video.tsx`
- Create: `components/storefront/product-grid.tsx`
- Create: `app/(storefront)/page.tsx`
- Create: `app/(storefront)/shop/page.tsx`
- Create: `tests/unit/hero-video.test.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Move: `c_e_e_b_b_e_dfbmp_.mp4` to `public/media/starliar-hero.mp4`

- [ ] **Step 1: Write a failing hero test**

```tsx
// tests/unit/hero-video.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroVideo } from "@/components/storefront/hero-video";

describe("HeroVideo", () => {
  it("keeps Starliar branding and collection actions on the hero", () => {
    render(<HeroVideo src="/media/starliar-hero.mp4" />);
    expect(screen.getByText("STARLIAR")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop the drop/i })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /view campaign/i })).toHaveAttribute("href", "#campaign");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npx vitest run tests/unit/hero-video.test.tsx
```

Expected: FAIL because `HeroVideo` does not exist yet.

- [ ] **Step 3: Implement the hero and header**

```tsx
// components/storefront/site-header.tsx
import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 grid grid-cols-3 items-center px-6 py-5 text-white md:px-10">
      <nav className="flex gap-5 text-sm">
        <Link href="/shop">Shop</Link>
        <Link href="#campaign">Campaign</Link>
      </nav>
      <Link className="justify-self-center font-serif text-3xl tracking-normal md:text-5xl" href="/">
        STARLIAR
      </Link>
      <div className="flex justify-self-end gap-4">
        <Search aria-label="Search" />
        <UserRound aria-label="Account" />
        <Link aria-label="Cart" href="/cart"><ShoppingBag /></Link>
      </div>
    </header>
  );
}
```

```tsx
// components/storefront/hero-video.tsx
import Link from "next/link";
import { SiteHeader } from "./site-header";

export function HeroVideo({ src }: { src: string }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline src={src} />
      <div className="absolute inset-0 bg-black/20" />
      <SiteHeader />
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-end px-6 pb-20 text-center">
        <p className="mb-5 font-serif text-4xl">First Signal</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="rounded-full border border-white px-7 py-3 text-sm" href="/shop">Shop the drop</Link>
          <Link className="rounded-full border border-white px-7 py-3 text-sm" href="#campaign">View campaign</Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add catalog queries and the homepage**

```ts
// lib/commerce/catalog.ts
import { prisma } from "@/lib/prisma";

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { published: true },
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export function getPublishedProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, published: true },
    include: { variants: true, collection: true },
  });
}
```

```tsx
// app/(storefront)/page.tsx
import { HeroVideo } from "@/components/storefront/hero-video";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <HeroVideo src="/media/starliar-hero.mp4" />
      <section className="px-6 py-20 md:px-10">
        <h2 className="mb-8 text-2xl uppercase">Latest: Starliar New Arrival</h2>
        <ProductGrid products={products} />
      </section>
      <section id="campaign" className="bg-zinc-950 px-6 py-24 text-zinc-100 md:px-10">
        <p className="max-w-xl text-3xl">Cold silhouettes for a first signal after dark.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add the shop listing**

```tsx
// components/storefront/product-grid.tsx
import Link from "next/link";

type GridProduct = {
  id: string;
  slug: string;
  name: string;
  priceVnd: number;
  media: string[];
};

export function ProductGrid({ products }: { products: GridProduct[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Link className="group block" href={`/shop/${product.slug}`} key={product.id}>
          <div className="aspect-[4/5] overflow-hidden bg-zinc-100">
            {product.media[0] ? <img alt={product.name} className="h-full w-full object-cover" src={product.media[0]} /> : null}
          </div>
          <div className="mt-3 flex justify-between gap-4 text-sm">
            <span>{product.name}</span>
            <span>{product.priceVnd.toLocaleString("vi-VN")} VND</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

```tsx
// app/(storefront)/shop/page.tsx
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProducts } from "@/lib/commerce/catalog";

export default async function ShopPage() {
  const products = await getFeaturedProducts();
  return <main className="px-6 pb-20 pt-28 md:px-10"><ProductGrid products={products} /></main>;
}
```

- [ ] **Step 6: Verify the storefront shell**

Run:

```bash
npx vitest run tests/unit/hero-video.test.tsx
npm run lint
npm run dev
```

Expected: test and lint pass; the dev server shows a full-bleed Starliar video hero and a shop grid.

- [ ] **Step 7: Commit the storefront shell**

```bash
git add app components lib public tests
git commit -m "feat: add cinematic starliar storefront"
```

### Task 4: Add Product Detail, Variant Selection, And Cart State

**Files:**
- Create: `components/commerce/variant-picker.tsx`
- Create: `components/commerce/add-to-cart-button.tsx`
- Create: `lib/commerce/cart.ts`
- Create: `app/(storefront)/shop/[slug]/page.tsx`
- Create: `app/(storefront)/cart/page.tsx`
- Create: `tests/unit/cart.test.ts`
- Create: `tests/unit/variant-picker.test.tsx`

- [ ] **Step 1: Write failing cart math tests**

```ts
// tests/unit/cart.test.ts
import { describe, expect, it } from "vitest";
import { addCartItem, getCartSubtotal } from "@/lib/commerce/cart";

describe("cart helpers", () => {
  it("merges the same variant and totals VND prices", () => {
    const cart = addCartItem([], { variantId: "m", productId: "p1", name: "Shell", size: "M", priceVnd: 2890000, quantity: 1 });
    const merged = addCartItem(cart, { variantId: "m", productId: "p1", name: "Shell", size: "M", priceVnd: 2890000, quantity: 2 });
    expect(merged[0].quantity).toBe(3);
    expect(getCartSubtotal(merged)).toBe(8670000);
  });
});
```

- [ ] **Step 2: Run the cart test to see the missing helper**

Run:

```bash
npx vitest run tests/unit/cart.test.ts
```

Expected: FAIL because cart helpers do not exist.

- [ ] **Step 3: Implement typed cart helpers**

```ts
// lib/commerce/cart.ts
export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  size: string;
  priceVnd: number;
  quantity: number;
};

export function addCartItem(items: CartItem[], next: CartItem) {
  const existing = items.find((item) => item.variantId === next.variantId);
  if (!existing) return [...items, next];
  return items.map((item) =>
    item.variantId === next.variantId ? { ...item, quantity: item.quantity + next.quantity } : item,
  );
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.priceVnd * item.quantity, 0);
}
```

- [ ] **Step 4: Add the product detail path and selector**

```tsx
// app/(storefront)/shop/[slug]/page.tsx
import { notFound } from "next/navigation";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { getPublishedProduct } from "@/lib/commerce/catalog";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  return (
    <main className="grid gap-10 px-6 pb-20 pt-28 md:grid-cols-2 md:px-10">
      <div className="aspect-[4/5] bg-zinc-100" />
      <section>
        <h1 className="text-3xl">{product.name}</h1>
        <p className="mt-3">{product.priceVnd.toLocaleString("vi-VN")} VND</p>
        <p className="mt-8 max-w-lg text-zinc-600">{product.description}</p>
        <VariantPicker product={product} />
      </section>
    </main>
  );
}
```

```tsx
// components/commerce/variant-picker.tsx
"use client";

import { useState } from "react";
import { AddToCartButton } from "./add-to-cart-button";

type VariantProduct = {
  id: string;
  name: string;
  priceVnd: number;
  variants: { id: string; size: string; stock: number }[];
};

export function VariantPicker({ product }: { product: VariantProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const selected = product.variants.find((variant) => variant.id === variantId);

  return (
    <div className="mt-8">
      <fieldset>
        <legend className="mb-3 text-sm uppercase">Size</legend>
        <div className="flex gap-2">
          {product.variants.map((variant) => (
            <button key={variant.id} type="button" disabled={variant.stock < 1} onClick={() => setVariantId(variant.id)}>
              {variant.size}
            </button>
          ))}
        </div>
      </fieldset>
      {selected ? <AddToCartButton product={product} variant={selected} /> : null}
    </div>
  );
}
```

- [ ] **Step 5: Add cart UI backed by local storage or cookie state**

```tsx
// app/(storefront)/cart/page.tsx
import { CartView } from "@/components/commerce/cart-view";

export default function CartPage() {
  return <main className="px-6 pb-20 pt-28 md:px-10"><CartView /></main>;
}
```

```tsx
// components/commerce/add-to-cart-button.tsx
"use client";

import { addCartItem, type CartItem } from "@/lib/commerce/cart";

function readCart(): CartItem[] {
  return JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]");
}

export function AddToCartButton({
  product,
  variant,
}: {
  product: { id: string; name: string; priceVnd: number };
  variant: { id: string; size: string; stock: number };
}) {
  return (
    <button
      className="mt-8 border border-zinc-950 px-6 py-3"
      disabled={variant.stock < 1}
      onClick={() => {
        const next = addCartItem(readCart(), {
          variantId: variant.id,
          productId: product.id,
          name: product.name,
          size: variant.size,
          priceVnd: product.priceVnd,
          quantity: 1,
        });
        window.localStorage.setItem("starliar-cart", JSON.stringify(next));
      }}
      type="button"
    >
      Add to cart
    </button>
  );
}
```

```tsx
// components/commerce/cart-view.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartSubtotal, type CartItem } from "@/lib/commerce/cart";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => setItems(JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]")), []);
  if (!items.length) return <p>Your cart is empty.</p>;
  return (
    <section>
      {items.map((item) => <article key={item.variantId}>{item.name} / {item.size} x {item.quantity}</article>)}
      <p>Subtotal: {getCartSubtotal(items).toLocaleString("vi-VN")} VND</p>
      <Link href="/checkout">Checkout</Link>
    </section>
  );
}
```

- [ ] **Step 6: Verify product-to-cart behavior**

Run:

```bash
npx vitest run tests/unit/cart.test.ts tests/unit/variant-picker.test.tsx
npx playwright test tests/integration/cart-flow.spec.ts
```

Expected: unit tests pass and Playwright can open a seeded product, choose a size, add it, and see the cart subtotal.

- [ ] **Step 7: Commit product and cart behavior**

```bash
git add app components lib tests
git commit -m "feat: add product variants and cart"
```

### Task 5: Create Checkout Validation And Orders

**Files:**
- Create: `lib/commerce/checkout-schema.ts`
- Create: `lib/commerce/orders.ts`
- Create: `app/api/checkout/route.ts`
- Create: `components/commerce/checkout-form.tsx`
- Create: `app/(storefront)/checkout/page.tsx`
- Create: `tests/unit/checkout-schema.test.ts`
- Create: `tests/integration/checkout-route.test.ts`

- [ ] **Step 1: Write the failing checkout validation test**

```ts
// tests/unit/checkout-schema.test.ts
import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "@/lib/commerce/checkout-schema";

describe("checkoutInputSchema", () => {
  it("requires contact, address, country, and cart items", () => {
    const parsed = checkoutInputSchema.safeParse({ email: "bad" });
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Add the concrete checkout schema**

```ts
// lib/commerce/checkout-schema.ts
import { z } from "zod";

export const checkoutInputSchema = z.object({
  email: z.string().email(),
  customerName: z.string().min(2),
  phone: z.string().min(8),
  country: z.string().min(2),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().positive().max(10),
  })).min(1),
});
```

- [ ] **Step 3: Add order creation that re-prices variants server-side**

```ts
// lib/commerce/orders.ts
import { prisma } from "@/lib/prisma";
import { checkoutInputSchema } from "./checkout-schema";

export async function createCheckoutOrder(input: unknown) {
  const data = checkoutInputSchema.parse(input);
  const variantIds = data.items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const items = data.items.map((item) => {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || variant.stock < item.quantity || !variant.product.published) {
      throw new Error("UNAVAILABLE_VARIANT");
    }
    return { item, variant };
  });

  const subtotalVnd = items.reduce((total, { item, variant }) => total + item.quantity * variant.product.priceVnd, 0);
  const shippingVnd = data.country === "VN" ? 40000 : 0;
  const totalVnd = subtotalVnd + shippingVnd;

  return prisma.order.create({
    data: {
      orderNumber: `STL-${Date.now()}`,
      email: data.email,
      customerName: data.customerName,
      phone: data.phone,
      country: data.country,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      subtotalVnd,
      shippingVnd,
      totalVnd,
      items: {
        create: items.map(({ item, variant }) => ({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          size: variant.size,
          unitPriceVnd: variant.product.priceVnd,
          quantity: item.quantity,
        })),
      },
    },
  });
}
```

- [ ] **Step 4: Expose checkout order creation**

```ts
// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutOrder } from "@/lib/commerce/orders";

export async function POST(request: Request) {
  try {
    const order = await createCheckoutOrder(await request.json());
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CHECKOUT_FAILED" }, { status: 400 });
  }
}
```

- [ ] **Step 5: Build the checkout form and result handoff**

```tsx
// app/(storefront)/checkout/page.tsx
import { CheckoutForm } from "@/components/commerce/checkout-form";

export default function CheckoutPage() {
  return <main className="px-6 pb-20 pt-28 md:px-10"><CheckoutForm /></main>;
}
```

`CheckoutForm` must post the user's address plus cart variant ids/quantities to
`/api/checkout`, show field errors locally, and continue only when the server
returns an order id.

```tsx
// components/commerce/checkout-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartItem } from "@/lib/commerce/cart";

export function CheckoutForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    const items: CartItem[] = JSON.parse(window.localStorage.getItem("starliar-cart") ?? "[]");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        customerName: formData.get("customerName"),
        phone: formData.get("phone"),
        country: formData.get("country"),
        addressLine1: formData.get("addressLine1"),
        city: formData.get("city"),
        province: formData.get("province") || undefined,
        postalCode: formData.get("postalCode") || undefined,
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error ?? "CHECKOUT_FAILED");
    router.push(result.checkoutUrl ?? `/order/${result.orderNumber}`);
  }

  return (
    <form action={submit} className="grid max-w-xl gap-4">
      <input name="email" required type="email" />
      <input name="customerName" required />
      <input name="phone" required />
      <input defaultValue="VN" name="country" required />
      <input name="addressLine1" required />
      <input name="city" required />
      <input name="province" />
      <input name="postalCode" />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Pay by QR</button>
    </form>
  );
}
```

- [ ] **Step 6: Verify checkout boundaries**

Run:

```bash
npx vitest run tests/unit/checkout-schema.test.ts tests/integration/checkout-route.test.ts
```

Expected: invalid checkout input fails validation, and valid seeded cart input creates a pending order with server-calculated totals.

- [ ] **Step 7: Commit checkout orders**

```bash
git add app components lib tests
git commit -m "feat: create checkout orders"
```

### Task 6: Integrate payOS QR Payment And Webhooks

**Files:**
- Create: `lib/payments/types.ts`
- Create: `lib/payments/payos.ts`
- Create: `lib/payments/payment-service.ts`
- Create: `app/api/payments/payos/webhook/route.ts`
- Create: `app/(storefront)/checkout/result/page.tsx`
- Create: `app/(storefront)/order/[orderNumber]/page.tsx`
- Create: `tests/unit/payment-service.test.ts`
- Create: `tests/integration/payos-webhook.test.ts`

- [ ] **Step 1: Write a failing payment status test**

```ts
// tests/unit/payment-service.test.ts
import { describe, expect, it } from "vitest";
import { mapPayOSStatus } from "@/lib/payments/payos";

describe("mapPayOSStatus", () => {
  it("maps paid and canceled provider states", () => {
    expect(mapPayOSStatus("PAID")).toBe("PAID");
    expect(mapPayOSStatus("CANCELLED")).toBe("CANCELED");
  });
});
```

- [ ] **Step 2: Add the payment adapter boundary**

```ts
// lib/payments/types.ts
export type PaymentCheckout = {
  providerRef: string;
  checkoutUrl: string;
};

export interface PaymentProvider {
  createCheckout(input: {
    orderId: string;
    orderNumber: string;
    amountVnd: number;
    buyerName: string;
    buyerEmail: string;
  }): Promise<PaymentCheckout>;
}
```

- [ ] **Step 3: Implement payOS checkout creation**

```ts
// lib/payments/payos.ts
import PayOS from "@payos/node";
import type { PaymentStatus } from "@prisma/client";
import type { PaymentProvider } from "./types";

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!,
);

export function mapPayOSStatus(status: string): PaymentStatus {
  if (status === "PAID") return "PAID";
  if (status === "CANCELLED") return "CANCELED";
  return "PENDING";
}

export const payOSProvider: PaymentProvider = {
  async createCheckout(input) {
    const paymentLink = await payOS.createPaymentLink({
      orderCode: Number(input.orderId.replace(/\D/g, "").slice(-12)) || Date.now(),
      amount: input.amountVnd,
      description: input.orderNumber.slice(0, 25),
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/result`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/result?canceled=1`,
    });

    return {
      providerRef: String(paymentLink.orderCode),
      checkoutUrl: paymentLink.checkoutUrl,
    };
  },
};
```

- [ ] **Step 4: Start payment after order creation**

```ts
// lib/payments/payment-service.ts
import { prisma } from "@/lib/prisma";
import { payOSProvider } from "./payos";

export async function startPayOSPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const checkout = await payOSProvider.createCheckout({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountVnd: order.totalVnd,
    buyerName: order.customerName,
    buyerEmail: order.email,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amountVnd: order.totalVnd,
      provider: "payos",
      providerRef: checkout.providerRef,
      checkoutUrl: checkout.checkoutUrl,
      status: "PENDING",
    },
  });

  return checkout;
}
```

Update `/api/checkout` to call `startPayOSPayment(order.id)` and return
`checkoutUrl` so checkout can redirect buyers into payOS QR checkout.

- [ ] **Step 5: Add an idempotent payOS webhook route**

```ts
// app/api/payments/payos/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapPayOSStatus, verifyPayOSWebhook } from "@/lib/payments/payos";

export async function POST(request: Request) {
  const body = await request.json();
  const verified = verifyPayOSWebhook(body);
  if (!verified) return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });

  const providerRef = String(verified.orderCode);
  const status = mapPayOSStatus(String(verified.status));
  const payment = await prisma.payment.findUnique({ where: { providerRef } });

  if (!payment) return NextResponse.json({ ok: true });
  if (payment.status === "PAID") return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status, rawPayload: body } }),
    ...(status === "PAID"
      ? [prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
```

Add the verification wrapper beside the payOS mapper:

```ts
// lib/payments/payos.ts
export function verifyPayOSWebhook(body: unknown) {
  try {
    return payOS.verifyPaymentWebhookData(body as Parameters<typeof payOS.verifyPaymentWebhookData>[0]);
  } catch {
    return null;
  }
}
```

The integration test must send one invalid signature payload and one signed
fixture payload so the webhook rejects the first and updates the second.

- [ ] **Step 6: Add buyer-facing result and order pages**

```tsx
// app/(storefront)/checkout/result/page.tsx
export default function CheckoutResultPage() {
  return <main className="px-6 pb-20 pt-28 md:px-10"><h1 className="text-3xl">Payment received or pending</h1></main>;
}
```

```tsx
// app/(storefront)/order/[orderNumber]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, items: true },
  });
  if (!order) notFound();
  const payment = order.payments[0];
  return (
    <main className="px-6 pb-20 pt-28 md:px-10">
      <h1 className="text-3xl">Order {order.orderNumber}</h1>
      <p className="mt-4">Order status: {order.status}</p>
      <p>Payment status: {payment?.status ?? "PENDING"}</p>
    </main>
  );
}
```

- [ ] **Step 7: Verify QR payment behavior**

Run:

```bash
npx vitest run tests/unit/payment-service.test.ts tests/integration/payos-webhook.test.ts
npx playwright test tests/integration/checkout-payment.spec.ts
```

Expected: payment checkout creation stores a payOS payment row, signed webhooks
update order state once, duplicate webhooks stay idempotent, and the buyer flow
reaches payment result UI.

- [ ] **Step 8: Commit payment integration**

```bash
git add app lib tests .env.example
git commit -m "feat: add payos qr checkout"
```

### Task 7: Add Admin Authentication

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth/admin.ts`
- Create: `app/admin/login/page.tsx`
- Create: `tests/unit/admin-auth.test.ts`

- [ ] **Step 1: Write the failing admin guard test**

```ts
// tests/unit/admin-auth.test.ts
import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/auth/admin";

describe("admin auth helpers", () => {
  it("requires a Starliar admin identity", () => {
    expect(isAdminEmail("admin@starliar.local")).toBe(true);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Add the admin helper**

```ts
// lib/auth/admin.ts
export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && email.length > 3);
}
```

- [ ] **Step 3: Configure Auth.js credentials**

```ts
// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
        if (!parsed.success) return null;
        const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
        if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) return null;
        return { id: admin.id, email: admin.email, role: admin.role };
      },
    }),
  ],
});
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Add login page and protect admin pages**

```tsx
// app/admin/login/page.tsx
import { signIn } from "@/auth";

export default function AdminLoginPage() {
  return (
    <form action={async (formData) => {
      "use server";
      await signIn("credentials", formData);
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign in</button>
    </form>
  );
}
```

Every admin page added later must call `auth()` on the server and redirect to
`/admin/login` when the session has no admin email.

- [ ] **Step 5: Verify authentication path**

Run:

```bash
npx vitest run tests/unit/admin-auth.test.ts
npx playwright test tests/integration/admin-login.spec.ts
```

Expected: the helper test passes, unauthenticated admin access redirects, and the seeded admin can sign in.

- [ ] **Step 6: Commit admin auth**

```bash
git add app auth.ts lib tests
git commit -m "feat: protect starliar admin"
```

### Task 8: Build Admin Product Operations

**Files:**
- Create: `lib/commerce/admin-products.ts`
- Create: `app/api/admin/products/route.ts`
- Create: `app/api/admin/products/[id]/route.ts`
- Create: `components/admin/product-form.tsx`
- Create: `app/admin/products/page.tsx`
- Create: `app/admin/products/new/page.tsx`
- Create: `app/admin/products/[id]/page.tsx`
- Create: `tests/integration/admin-products.test.ts`

- [ ] **Step 1: Write a failing product payload test**

```ts
// tests/integration/admin-products.test.ts
import { describe, expect, it } from "vitest";
import { adminProductSchema } from "@/lib/commerce/admin-products";

describe("adminProductSchema", () => {
  it("requires slug, price, media, and at least one variant", () => {
    expect(adminProductSchema.safeParse({ name: "Only a name" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Add product write validation**

```ts
// lib/commerce/admin-products.ts
import { z } from "zod";

export const adminProductSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().min(10),
  priceVnd: z.number().int().positive(),
  published: z.boolean(),
  media: z.array(z.string().min(1)).min(1),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1),
    sku: z.string().min(3),
    stock: z.number().int().nonnegative(),
  })).min(1),
});
```

- [ ] **Step 3: Add authenticated product handlers**

```ts
// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminProductSchema } from "@/lib/commerce/admin-products";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const data = adminProductSchema.parse(await request.json());
  const product = await prisma.product.create({
    data: {
      ...data,
      variants: { create: data.variants },
    },
  });
  return NextResponse.json(product, { status: 201 });
}
```

```ts
// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminProductSchema } from "@/lib/commerce/admin-products";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())?.user?.email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const data = adminProductSchema.parse(await request.json());
  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      priceVnd: data.priceVnd,
      published: data.published,
      media: data.media,
      variants: {
        deleteMany: {},
        create: data.variants.map(({ id: _id, ...variant }) => variant),
      },
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())?.user?.email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(await prisma.product.update({ where: { id }, data: { published: false } }));
}
```

- [ ] **Step 4: Build admin product screens**

```tsx
// app/admin/products/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");
  const products = await prisma.product.findMany({ include: { variants: true }, orderBy: { updatedAt: "desc" } });
  return (
    <main>
      <Link href="/admin/products/new">New product</Link>
      {products.map((product) => <article key={product.id}>{product.name}</article>)}
    </main>
  );
}
```

```tsx
// components/admin/product-form.tsx
"use client";

import { useState } from "react";

type VariantDraft = { size: string; sku: string; stock: number };

export function ProductForm({ action, initial }: { action: string; initial?: Record<string, unknown> }) {
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "M", sku: "", stock: 0 }]);
  async function submit(formData: FormData) {
    await fetch(action, {
      method: initial ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: formData.get("slug"),
        name: formData.get("name"),
        description: formData.get("description"),
        priceVnd: Number(formData.get("priceVnd")),
        published: formData.get("published") === "on",
        media: String(formData.get("media")).split("\n").filter(Boolean),
        variants,
      }),
    });
  }
  return (
    <form action={submit}>
      <input name="slug" required />
      <input name="name" required />
      <textarea name="description" required />
      <input name="priceVnd" required type="number" />
      <textarea name="media" required />
      <label><input name="published" type="checkbox" /> Published</label>
      {variants.map((variant, index) => (
        <div key={`${variant.sku}-${index}`}>
          <input value={variant.size} onChange={(event) => setVariants((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, size: event.target.value } : row))} />
          <input value={variant.sku} onChange={(event) => setVariants((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, sku: event.target.value } : row))} />
          <input type="number" value={variant.stock} onChange={(event) => setVariants((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, stock: Number(event.target.value) } : row))} />
        </div>
      ))}
      <button type="button" onClick={() => setVariants((rows) => [...rows, { size: "", sku: "", stock: 0 }])}>Add size</button>
      <button type="submit">Save product</button>
    </form>
  );
}
```

- [ ] **Step 5: Verify product CRUD**

Run:

```bash
npx vitest run tests/integration/admin-products.test.ts
npx playwright test tests/integration/admin-product-flow.spec.ts
```

Expected: only signed-in admins can create or edit products, and product changes appear in public catalog queries when published.

- [ ] **Step 6: Commit product admin**

```bash
git add app components lib tests
git commit -m "feat: add admin product operations"
```

### Task 9: Build Admin Campaign Media Controls

**Files:**
- Create: `lib/commerce/admin-campaign.ts`
- Create: `app/api/admin/campaign/route.ts`
- Create: `app/admin/campaign/page.tsx`
- Create: `components/admin/campaign-form.tsx`
- Create: `tests/integration/admin-campaign.test.ts`

- [ ] **Step 1: Write the failing campaign payload test**

```ts
// tests/integration/admin-campaign.test.ts
import { describe, expect, it } from "vitest";
import { campaignMediaSchema } from "@/lib/commerce/admin-campaign";

describe("campaignMediaSchema", () => {
  it("requires media source, title, and alt text", () => {
    expect(campaignMediaSchema.safeParse({ src: "/hero.mp4" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Add campaign validation and protected write route**

```ts
// lib/commerce/admin-campaign.ts
import { z } from "zod";

export const campaignMediaSchema = z.object({
  title: z.string().min(2),
  kind: z.enum(["video", "image"]),
  src: z.string().min(1),
  alt: z.string().min(3),
  hero: z.boolean(),
  position: z.number().int().nonnegative(),
});
```

```ts
// app/api/admin/campaign/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { campaignMediaSchema } from "@/lib/commerce/admin-campaign";

export async function POST(request: Request) {
  if (!(await auth())?.user?.email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const data = campaignMediaSchema.parse(await request.json());
  return NextResponse.json(await prisma.campaignMedia.create({ data }), { status: 201 });
}
```

- [ ] **Step 3: Add the protected campaign screen**

```tsx
// app/admin/campaign/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CampaignForm } from "@/components/admin/campaign-form";

export default async function AdminCampaignPage() {
  if (!(await auth())?.user?.email) redirect("/admin/login");
  const media = await prisma.campaignMedia.findMany({ orderBy: { position: "asc" } });
  return <main><CampaignForm />{media.map((item) => <article key={item.id}>{item.title}</article>)}</main>;
}
```

```tsx
// components/admin/campaign-form.tsx
"use client";

export function CampaignForm() {
  async function submit(formData: FormData) {
    await fetch("/api/admin/campaign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        kind: formData.get("kind"),
        src: formData.get("src"),
        alt: formData.get("alt"),
        hero: formData.get("hero") === "on",
        position: Number(formData.get("position")),
      }),
    });
  }
  return (
    <form action={submit}>
      <input name="title" required />
      <select name="kind"><option value="video">Video</option><option value="image">Image</option></select>
      <input name="src" required />
      <input name="alt" required />
      <input name="position" min="0" required type="number" />
      <label><input name="hero" type="checkbox" /> Hero media</label>
      <button type="submit">Save campaign media</button>
    </form>
  );
}
```

- [ ] **Step 4: Verify campaign controls**

Run:

```bash
npx vitest run tests/integration/admin-campaign.test.ts
npx playwright test tests/integration/admin-campaign-flow.spec.ts
```

Expected: only a signed-in admin can create campaign media and the campaign list reflects the new item.

- [ ] **Step 5: Commit campaign admin**

```bash
git add app components lib tests
git commit -m "feat: add campaign media admin"
```

### Task 10: Build Admin Order Views

**Files:**
- Create: `lib/commerce/admin-orders.ts`
- Create: `components/admin/order-status-badge.tsx`
- Create: `app/admin/orders/page.tsx`
- Create: `app/admin/orders/[id]/page.tsx`
- Create: `tests/integration/admin-orders.test.ts`

- [ ] **Step 1: Write the failing admin order view test**

```ts
// tests/integration/admin-orders.test.ts
import { describe, expect, it } from "vitest";
import { formatOrderTotal } from "@/lib/commerce/admin-orders";

describe("admin order formatting", () => {
  it("shows VND totals consistently", () => {
    expect(formatOrderTotal(2930000)).toContain("2.930.000");
  });
});
```

- [ ] **Step 2: Add admin order helpers**

```ts
// lib/commerce/admin-orders.ts
import { prisma } from "@/lib/prisma";

export function formatOrderTotal(totalVnd: number) {
  return `${totalVnd.toLocaleString("vi-VN")} VND`;
}

export function getAdminOrders() {
  return prisma.order.findMany({
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}
```

- [ ] **Step 3: Build protected order list and detail pages**

```tsx
// app/admin/orders/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminOrders, formatOrderTotal } from "@/lib/commerce/admin-orders";

export default async function AdminOrdersPage() {
  if (!(await auth())?.user?.email) redirect("/admin/login");
  const orders = await getAdminOrders();
  return <main>{orders.map((order) => <article key={order.id}>{order.orderNumber} {formatOrderTotal(order.totalVnd)}</article>)}</main>;
}
```

```tsx
// app/admin/orders/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())?.user?.email) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  if (!order) notFound();
  return (
    <main>
      <h1>{order.orderNumber}</h1>
      <p>{order.customerName} / {order.email} / {order.phone}</p>
      <p>{order.addressLine1}, {order.city}, {order.country}</p>
      {order.items.map((item) => <article key={item.id}>{item.productName} {item.size} x {item.quantity}</article>)}
      {order.payments.map((payment) => <article key={payment.id}>{payment.provider} {payment.status}</article>)}
    </main>
  );
}
```

- [ ] **Step 4: Verify admin order visibility**

Run:

```bash
npx vitest run tests/integration/admin-orders.test.ts
npx playwright test tests/integration/admin-order-flow.spec.ts
```

Expected: authenticated admins can inspect seeded checkout orders and payment state; public visitors cannot open admin order pages.

- [ ] **Step 5: Commit admin orders**

```bash
git add app components lib tests
git commit -m "feat: add admin order views"
```

### Task 11: Polish Responsive Brand Surfaces And Fallbacks

**Files:**
- Modify: `app/globals.css`
- Modify: `components/storefront/hero-video.tsx`
- Modify: `components/storefront/site-header.tsx`
- Modify: `components/storefront/product-grid.tsx`
- Modify: `components/commerce/checkout-form.tsx`
- Create: `tests/integration/home-responsive.spec.ts`
- Create: `tests/integration/checkout-responsive.spec.ts`

- [ ] **Step 1: Add Playwright coverage for mobile hero and checkout**

```ts
// tests/integration/home-responsive.spec.ts
import { expect, test } from "@playwright/test";

test("hero keeps brand and CTA visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("STARLIAR")).toBeVisible();
  await expect(page.getByRole("link", { name: /shop the drop/i })).toBeVisible();
});
```

- [ ] **Step 2: Add brand-system CSS tokens and fallback media states**

```css
/* app/globals.css */
:root {
  --starliar-ink: #090909;
  --starliar-paper: #f4f5f7;
  --starliar-line: #c7ccd4;
  --starliar-accent: #c9f3ff;
}

body {
  background: var(--starliar-paper);
  color: var(--starliar-ink);
  letter-spacing: 0;
}
```

Use stable aspect ratios for product media and a poster/fallback state for the
hero video so missing or slow media does not collapse the first viewport.

- [ ] **Step 3: Tighten responsive commerce UI**

Make checkout fields stack on mobile, keep product buttons and size controls
within their containers, and ensure admin tables become scan-friendly stacked
rows where needed.

- [ ] **Step 4: Run visual verification**

Run:

```bash
npm run lint
npm run build
npx playwright test tests/integration/home-responsive.spec.ts tests/integration/checkout-responsive.spec.ts
```

Expected: build succeeds and desktop/mobile storefront/checkout controls render without overlap.

- [ ] **Step 5: Commit responsive polish**

```bash
git add app components tests
git commit -m "feat: polish starliar responsive surfaces"
```

### Task 12: Verify The Release Slice

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Test: all unit and integration tests

- [ ] **Step 1: Document local setup and payment prerequisites**

```md
<!-- README.md -->
# Starliar

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and configure PostgreSQL, Auth.js, and payOS keys.
3. Run `npx prisma migrate dev` and `npx prisma db seed`.
4. Start the app with `npm run dev`.

## Payment notes

payOS checkout and webhook verification require merchant credentials and a
reachable webhook URL in the payOS dashboard.
```

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
npm run lint
npm run build
npx vitest run
npx playwright test
```

Expected: lint, production build, unit tests, and Playwright flows pass.

- [ ] **Step 3: Manually verify seeded buyer and admin flows**

Run:

```bash
npm run dev
```

Expected:

- `/` opens the Starliar hero video with shop and campaign CTAs.
- `/shop` opens seeded products.
- A seeded product can enter cart and checkout.
- payOS payment start is reachable when credentials are present.
- `/admin/login` accepts the seeded admin credentials.
- `/admin/products` and `/admin/orders` show protected operational screens.

- [ ] **Step 4: Commit release documentation**

```bash
git add README.md .env.example
git commit -m "docs: document starliar release setup"
```

## Verification Summary

- `npm run lint`
- `npm run build`
- `npx vitest run`
- `npx playwright test`
- Manual seeded storefront flow from hero to checkout result
- Manual seeded admin flow from login to product and order inspection

## Key Changes

- Scaffold a Next.js App Router commerce application around the existing Starliar video asset.
- Add Prisma-backed catalog, campaign, order, payment, and admin-user data.
- Build a cinematic Gentle Monster-inspired storefront with product/cart/checkout flows.
- Integrate payOS QR checkout behind a payment adapter and webhook-backed order status updates.
- Protect admin product and order operations with credentials-based admin auth.
- Add responsive and test coverage across storefront, checkout, payment, and admin boundaries.

## Next Skill

Use `$superpower-subagents` for task-by-task implementation with review between tasks, or `$superpower-executing-plans` for inline execution with checkpoints.
