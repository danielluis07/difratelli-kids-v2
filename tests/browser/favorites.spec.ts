import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy } from "../../lib/catalog";

const product = catalog.products.find(item => item.colorways.length === 2)!;
const other = catalog.products.find(item => item.id !== product.id)!;
const color = product.colorways.find(item => item.id !== product.defaultColorwayId)!;
const path = `/produto/${product.slug}?cor=${color.id}`;
const save = copy.favorites.save.replace("{product}", product.name);
const remove = copy.favorites.remove.replace("{product}", product.name);

async function openFavorites(page: Page) {
  if (page.viewportSize()!.width < 1024) await page.getByRole("button", { name: copy.navigation.openMenu }).click();
  await page.getByRole("link", { name: copy.favorites.count.one, exact: true }).filter({ visible: true }).click();
}

test("product-level save survives options, navigation/reload and leaves cart intact", async ({ page }) => {
  await page.goto(path);
  const favorite = page.getByRole("button", { name: save, exact: true });
  await expect(favorite).toBeEnabled();
  await favorite.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: remove, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".favorites-announcement")).toHaveText(copy.favorites.added.replace("{product}", product.name));
  await page.getByRole("button", { name: "Tamanho 6", exact: true }).click();
  await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  const cartSaved = await page.evaluate(() => localStorage.getItem("difratelli.cart"));
  await page.locator(".detail-colors:visible").getByRole("link", { name: product.colorways.find(c => c.id === product.defaultColorwayId)!.name, exact: true }).click();
  await expect(page.getByRole("button", { name: remove, exact: true })).toHaveAttribute("aria-pressed", "true");
  await openFavorites(page);
  const card = page.locator(`.product-card[data-product-id="${product.id}"]`);
  await expect(card).toBeVisible();
  await expect(card.locator(".product-link")).toHaveAttribute("href", `/produto/${product.slug}?cor=${product.defaultColorwayId}`);
  await page.reload();
  await expect(card).toBeVisible();
  await expect(page.locator(".cart-count")).toHaveText("1");
  await card.getByRole("button", { name: remove, exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(card).toHaveCount(0);
  await expect(page.locator(".favorites-content")).toBeFocused();
  await expect(page.locator(".favorites-announcement")).toHaveText(copy.favorites.removed.replace("{product}", product.name));
  await expect(page.getByText(copy.favorites.emptyHeading)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("difratelli.cart"))).toBe(cartSaved);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("difratelli.favorites")!))).toEqual({ version: 1, productIds: [] });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("link", { name: copy.favorites.emptyAction, exact: true }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await page.goBack();
  await expect(page.getByText(copy.favorites.emptyHeading)).toBeVisible();
});

test("card toggles synchronize with detail and removal keeps focus and saved count", async ({ page }) => {
  await page.goto("/produtos");
  const card = page.locator(`.product-card[data-product-id="${product.id}"]`);
  await card.getByRole("button", { name: save, exact: true }).click();
  await card.locator(".product-link").click();
  await expect(page).toHaveURL(new RegExp(`/produto/${product.slug}`), { timeout: 15000 });
  const detailFavorite = page.locator(".detail-favorite:visible");
  await expect(detailFavorite).toBeEnabled();
  await expect(detailFavorite).toHaveAttribute("aria-pressed", "true");
  await detailFavorite.click();
  await page.goBack();
  await expect(card.getByRole("button", { name: save, exact: true })).toHaveAttribute("aria-pressed", "false");
  await card.getByRole("button", { name: save, exact: true }).click();
  await page.locator(`.product-card[data-product-id="${other.id}"]`).getByRole("button", { name: copy.favorites.save.replace("{product}", other.name), exact: true }).click();
  await page.goto("/favoritos");
  await expect(page.locator(".favorites-content .product-card")).toHaveCount(2);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator(".favorites-content .card-favorite").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".favorites-content .product-card")).toHaveCount(1);
  await expect(page.locator(".favorites-content .card-favorite")).toBeFocused();
  await expect(page.locator(".favorites-count").first()).toHaveText("1");
});

test("normal saved envelope restores on any route without an initial overwrite", async ({ page }) => {
  const saved = JSON.stringify({ version: 1, productIds: [product.id] });
  await page.addInitScript(({ saved }) => {
    if (!localStorage.getItem("difratelli.favorites")) localStorage.setItem("difratelli.favorites", saved);
  }, { saved });
  await page.goto("/sobre");
  await expect(page.locator(".favorites-count").first()).toHaveText("1");
  expect(await page.evaluate(() => localStorage.getItem("difratelli.favorites"))).toBe(saved);
  await openFavorites(page);
  await expect(page.locator(".favorites-content .product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("button", { name: remove, exact: true })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem("difratelli.favorites"))).toBe(saved);
});

test("server content exposes neutral gated favorites rather than false emptiness", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/favoritos`);
  await expect(page.getByRole("heading", { name: copy.editorial.pages.favorites.heading })).toBeVisible();
  await expect(page.locator(".favorites-content")).toHaveText(copy.favorites.pending);
  await expect(page.getByText(copy.favorites.emptyHeading)).toHaveCount(0);
  await expect(page.locator(".favorites-count").first()).toHaveText("…");
  await page.goto(`${baseURL}${path}`);
  await expect(page.locator(".detail-favorite")).toBeDisabled();
  await expect(page.locator(".detail-favorite")).not.toHaveAttribute("aria-pressed");
  await context.close();
});

test("saved products fit mobile, tablet and desktop grids", async ({ page }, testInfo) => {
  await page.addInitScript(({ ids }) => {
    localStorage.setItem("difratelli.favorites", JSON.stringify({ version: 1, productIds: ids }));
  }, { ids: catalog.products.slice(0, 4).map(item => item.id) });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/favoritos");
    await expect(page.locator(".favorites-content .product-card")).toHaveCount(4);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect.poll(() => page.locator(".product-grid").evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(width < 768 ? 2 : width < 1024 ? 3 : 4);
    if (testInfo.project.name === "chromium") {
      await page.screenshot({ path: `docs/reviews/issue-38/favorites-${width}.png`, fullPage: true });
    }
  }
});
