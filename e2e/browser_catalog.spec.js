import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test("la tienda muestra el catálogo de productos", async ({ page }) => {
  await page.goto(BASE_URL);

  await expect(page).toHaveTitle(/QA Cloud Native Store/i);
  await expect(page.locator("h1")).toBeVisible();

  const productsSection = page.locator("#products");
  const productPrices = productsSection.locator(".price");

  await expect(productsSection).toBeVisible();
  await expect(productPrices.first()).toBeVisible();
  await expect(productPrices).toHaveCount(24);

  await expect(page.locator("#status")).toContainText(/24/i);
});