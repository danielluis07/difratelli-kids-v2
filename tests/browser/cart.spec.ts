import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy, formatMoney } from "../../lib/catalog";

const product = catalog.products.find(item => item.colorways.length === 2)!;
const otherColor = product.colorways.find(color => color.id !== product.defaultColorwayId)!;
const path = `/produto/${product.slug}`;

test("add focuses missing size, merges, limits, and keeps selected options distinct", async ({ page }) => {
  await page.goto(path);
  const add = page.getByRole("button", { name: copy.product.addToCart, exact: true });
  await expect(add).toBeEnabled();
  await add.click();
  await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.missingSize);
  await expect(page.locator(".size-options:visible button").first()).toBeFocused();
  await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  await add.click();
  await expect(page.locator(".purchase-feedback")).toContainText("adicionado à sacola");
  await expect(page.getByRole("dialog", { name: copy.cart.title })).toHaveCount(0);
  await add.click();
  await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.merged.replace("{product}", product.name));
  for (let i = 0; i < 9; i++) await add.click();
  await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.quantityLimited);
  await expect(page.locator(".cart-count")).toHaveText("10");
  await page.locator(".detail-colors:visible").getByRole("link", { name: otherColor.name, exact: true }).click();
  await expect(page.locator(".product-information strong:visible")).toHaveText(otherColor.name);
  await add.click();
  await page.getByRole("button", { name: "Tamanho 6", exact: true }).click();
  await add.click();
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const sheet = page.getByRole("dialog", { name: copy.cart.title });
  await expect(sheet.locator(".cart-line")).toHaveCount(3);
  await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 12));
  await expect(sheet.locator(".cart-line").nth(1)).toContainText(otherColor.name);
  await expect(sheet.locator(".cart-line").nth(2)).toContainText("Tamanho: 6");
  await expect(sheet.getByRole("link", { name: copy.cart.checkout })).toHaveAttribute("href", "/checkout");
  await page.reload();
  await expect(page.locator(".cart-count")).toHaveText("12");
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  await expect(sheet.locator(".cart-line")).toHaveCount(3);
  await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 12));
});

test("Sheet quantity limits, removal, announcements, focus, sizing and empty exploration", async ({ page }) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  const trigger = page.getByRole("button", { name: /Abrir sacola/ });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: copy.cart.title });
  await expect(sheet.getByRole("button", { name: copy.cart.close })).toBeFocused();
  const viewport = page.viewportSize()!;
  await expect.poll(async () => {
    const bounds = await sheet.boundingBox();
    return bounds ? { width: Math.round(bounds.width), right: Math.round(bounds.x + bounds.width) } : null;
  }).toEqual({ width: viewport.width < 768 ? viewport.width : 480, right: viewport.width });
  await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).click();
  await expect(sheet.getByRole("status")).toHaveText(copy.cart.minimumQuantity);
  await expect(page.locator(".cart-count")).toHaveText("1");
  const increase = sheet.getByRole("button", { name: copy.cart.increase.replace("{product}", product.name) });
  for (let i = 0; i < 10; i++) await increase.click();
  await expect(sheet.getByRole("status")).toHaveText(copy.cart.maximumQuantity);
  await expect(page.locator(".cart-count")).toHaveText("10");
  await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).click();
  await expect(sheet.getByRole("status")).toHaveText(copy.cart.quantityUpdated.replace("{product}", product.name).replace("{quantity}", "9"));
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await sheet.getByRole("button", { name: copy.cart.remove.replace("{product}", product.name) }).click();
  await expect(sheet.getByRole("status")).toHaveText(copy.cart.removed.replace("{product}", product.name));
  await expect(sheet.getByRole("button", { name: copy.cart.close })).toBeFocused();
  await expect(sheet).toContainText(copy.cart.emptyHeading);
  await expect(page.locator(".cart-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await sheet.getByRole("link", { name: copy.cart.emptyAction }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(sheet).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".cart-count")).toHaveText("0");
});

test("prerendered public content uses neutral gated cart UI", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}${path}`);
  await expect(page.getByRole("heading", { name: product.name, exact: true })).toBeVisible();
  await expect(page.locator(".cart-count")).toHaveText("…");
  await expect(page.getByRole("button", { name: copy.product.addToCart, exact: true })).toBeDisabled();
  await context.close();
});

test("normal restoration never overwrites saved selections and survives public navigation", async ({ page }) => {
  const saved = JSON.stringify({ version: 1, lines: [{ productId: product.id, colorwayId: otherColor.id, size: 8, quantity: 3, lastSeenUnitPriceCents: 1 }] });
  await page.addInitScript(({ saved }) => {
    if (!localStorage.getItem("difratelli.cart")) localStorage.setItem("difratelli.cart", saved);
  }, { saved });
  await page.goto("/sobre");
  await expect(page.locator(".cart-count")).toHaveText("3");
  expect(await page.evaluate(() => localStorage.getItem("difratelli.cart"))).toBe(saved);
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const sheet = page.getByRole("dialog", { name: copy.cart.title });
  await expect(sheet.locator(".cart-line")).toContainText(otherColor.name);
  await expect(sheet.locator(".cart-line")).toContainText("Tamanho: 8");
  await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 3));
  await sheet.locator(".cart-photo").click();
  await expect(page).toHaveURL(new RegExp(`${product.slug}\\?cor=${otherColor.id}$`));
  await expect(page.locator(".cart-count")).toHaveText("3");
  await page.getByRole("button", { name: "Tamanho 8", exact: true }).click();
  await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  await expect(page.locator(".cart-count")).toHaveText("4");
  await page.reload();
  await expect(page.locator(".cart-count")).toHaveText("4");
});
