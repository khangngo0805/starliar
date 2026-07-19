import { expect, test } from "@playwright/test";

test("hero keeps brand and primary CTA visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "STARLIAR" })).toBeVisible();
  await expect(page.getByRole("link", { name: /shop now/i })).toBeVisible();
});

test("checkout page exposes QR payment action", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("button", { name: /pay by qr/i })).toBeVisible();
});

test("search overlay finds seeded products", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByPlaceholder("Please enter the search term(s)").fill("shell");
  await expect(page.getByRole("link", { name: /Orbital Shell Jacket/i })).toBeVisible();
});

test("homepage presents editorial storefront sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "STARLIAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /First Signal/i })).toBeVisible();
  await expect(page.getByText(/Quiet luxury structure\. Dark streetwear attitude/i)).toBeHidden();
  await expect(page.getByRole("heading", { name: /Latest release/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /After dark uniform/i })).toBeVisible();
});

test("featured product cards remain navigable", async ({ page }) => {
  await page.goto("/");

  const card = page.getByRole("link", { name: /Trace Cap/i });
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/shop\/trace-cap/);
});

test("product purchase actions stay aligned", async ({ page }) => {
  await page.goto("/shop/silent-poplin-shirt");

  const buyNow = page.getByRole("button", { name: "Buy now" });
  const addToCart = page.getByRole("button", { name: "Add to cart" });

  await expect(buyNow).toBeVisible();
  await expect(addToCart).toBeVisible();

  const buyNowBox = await buyNow.boundingBox();
  const addToCartBox = await addToCart.boundingBox();

  expect(buyNowBox).not.toBeNull();
  expect(addToCartBox).not.toBeNull();
  expect(Math.abs(buyNowBox!.y - addToCartBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(buyNowBox!.height - addToCartBox!.height)).toBeLessThanOrEqual(1);
});
