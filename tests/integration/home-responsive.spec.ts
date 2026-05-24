import { expect, test } from "@playwright/test";

test("hero keeps brand and primary CTA visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "STARLIAR" })).toBeVisible();
  await expect(page.getByRole("link", { name: /shop the drop/i })).toBeVisible();
});

test("checkout page exposes QR payment action", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("button", { name: /pay by qr/i })).toBeVisible();
});

test("search overlay finds seeded products", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByPlaceholder("Search Starliar").fill("shell");
  await expect(page.getByRole("link", { name: /Orbital Shell Jacket/i })).toBeVisible();
});
