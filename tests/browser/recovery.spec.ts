import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy, formatMoney } from "../../lib/catalog";

const product = catalog.products[0];
const selection = { productId: product.id, colorwayId: product.defaultColorwayId, size: 4 };
const line = { ...selection, quantity: 2, lastSeenUnitPriceCents: product.priceCents };
const cartSaved = JSON.stringify({ version: 1, lines: [line] });
const favoritesSaved = JSON.stringify({ version: 1, productIds: [product.id] });
const path = `/produto/${product.slug}`;
const cartNotice = (page: Page) => page.locator('.storage-feedback[data-store="cart"]');
const favoritesNotice = (page: Page) => page.locator('.storage-feedback[data-store="favorites"]');

async function seed(page: Page, cart = cartSaved, favorites = favoritesSaved, failure?: { operation: "read" | "write"; key: string }) {
  await page.addInitScript(({ cart, favorites, failure }) => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    if (get.call(localStorage, "difratelli.cart") === null) set.call(localStorage, "difratelli.cart", cart);
    if (get.call(localStorage, "difratelli.favorites") === null) set.call(localStorage, "difratelli.favorites", favorites);
    Storage.prototype.getItem = function(key) {
      if (this === localStorage && failure?.operation === "read" && key === failure.key) throw new DOMException("Blocked", "SecurityError");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function(key, value) {
      if (this === localStorage && failure?.operation === "write" && key === failure.key) throw new DOMException("Full", "QuotaExceededError");
      return set.call(this, key, value);
    };
    // Inspect saved values even when the application-facing read is blocked.
    Object.assign(window, { readSaved: (key: string) => get.call(localStorage, key) });
  }, { cart, favorites, failure });
}

async function saved(page: Page, key: string) {
  return page.evaluate(key => (window as unknown as { readSaved(key: string): string | null }).readSaved(key), key);
}

async function add(page: Page) {
  await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
}

test("recovers mixed entries, deduplicates, corrects quantities/prices and explains each restoration once", async ({ page }, testInfo) => {
  const cart = JSON.stringify({ version: 1, lines: [
    line, { ...line, quantity: 12, lastSeenUnitPriceCents: 1 }, { ...line, size: 6, quantity: 1 },
    { ...line, productId: "obsolete" }, { ...line, colorwayId: "obsolete" }, { ...line, size: 3 },
    ...[0, -1, 2.5, "2", null].map(quantity => ({ ...line, quantity })), null,
  ] });
  const favorites = JSON.stringify({ version: 1, productIds: [product.id, null, "obsolete", product.id] });
  await seed(page, cart, favorites);
  await page.goto("/favoritos");
  await expect(page.locator(".favorites-content .product-card")).toHaveCount(1);
  await expect(page.locator(".cart-count")).toHaveText("11");
  await expect(cartNotice(page)).toContainText(copy.recovery.cart.removed);
  await expect(cartNotice(page)).toContainText(copy.recovery.cart.duplicates);
  await expect(cartNotice(page)).toContainText(copy.recovery.cart.quantities);
  await expect(cartNotice(page)).toContainText(copy.recovery.cart.prices);
  await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites.removed);
  await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites.deduplicated);
  expect(await saved(page, "difratelli.cart")).toBe(cart);
  expect(await saved(page, "difratelli.favorites")).toBe(favorites);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  if (testInfo.project.name === "chromium" || testInfo.project.name === "mobile-chromium") {
    await page.screenshot({ path: `docs/reviews/issue-39/recovery-${testInfo.project.name}.png`, fullPage: true });
  }
  await cartNotice(page).getByRole("button").click();
  await favoritesNotice(page).getByRole("button").click();
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const sheet = page.getByRole("dialog", { name: copy.cart.title });
  await expect(sheet.locator(".cart-line")).toHaveCount(2);
  await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(11 * product.priceCents));
  await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).first().click();
  await page.keyboard.press("Escape");
  await page.locator(".favorites-content .product-link").click();
  await expect(page).toHaveURL(new RegExp(product.slug), { timeout: 15000 });
  await add(page);
  await expect(cartNotice(page).getByRole("button")).toHaveCount(0);
  await expect(favoritesNotice(page).getByRole("button")).toHaveCount(0);
  const next = JSON.parse((await saved(page, "difratelli.cart"))!);
  expect(next.lines).toHaveLength(2);
  expect(next.lines[0].quantity).toBe(10);
  expect(next.lines[0].lastSeenUnitPriceCents).toBe(product.priceCents);
  expect(Object.keys(next)).toEqual(["version", "lines"]);
});

for (const [cart, favorites, warning] of [
  ["{", "{", "invalidStorage"],
  [JSON.stringify({ version: 1, lines: {} }), JSON.stringify({ version: 1, productIds: null }), "invalidStorage"],
  [JSON.stringify({ version: 2, lines: [line] }), JSON.stringify({ version: 2, productIds: [product.id] }), "unsupportedStorage"],
] as const) {
  test(`preserves ${warning} envelopes (${cart}) and permits temporary shopping`, async ({ page }) => {
    await seed(page, cart, favorites);
    await page.goto(path);
    await expect(cartNotice(page)).toContainText(copy.recovery.cart[warning]);
    await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites[warning]);
    await cartNotice(page).getByRole("button").click();
    await favoritesNotice(page).getByRole("button").click();
    await add(page);
    await expect(page.locator(".cart-count")).toHaveText("1");
    await page.locator(".detail-favorite:visible").click();
    await expect(page.locator(".favorites-count").first()).toHaveText("1");
    await add(page);
    await expect(page.locator(".cart-count")).toHaveText("2");
    expect(await saved(page, "difratelli.cart")).toBe(cart);
    expect(await saved(page, "difratelli.favorites")).toBe(favorites);
    await expect(page.locator(".storage-notice[data-visible=true]")).toHaveCount(0);
  });
}

for (const key of ["difratelli.cart", "difratelli.favorites"]) {
  for (const operation of ["read", "write"] as const) {
    test(`${key} ${operation} failure leaves the other store persistent and warns once`, async ({ page }) => {
      await seed(page, cartSaved, favoritesSaved, { operation, key });
      await page.goto(path);
      const notice = key === "difratelli.cart" ? cartNotice(page) : favoritesNotice(page);
      const healthyNotice = key === "difratelli.cart" ? favoritesNotice(page) : cartNotice(page);
      const messages = key === "difratelli.cart" ? copy.recovery.cart : copy.recovery.favorites;
      await expect(page.getByRole("button", { name: copy.product.addToCart, exact: true })).toBeEnabled({ timeout: 15000 });
      if (operation === "read") await expect(notice).toContainText(messages.readFailure);
      await add(page);
      await page.locator(".detail-favorite:visible").click();
      if (operation === "write") await expect(notice).toContainText(messages.writeFailure);
      await expect(healthyNotice.getByRole("button")).toHaveCount(0);
      await notice.getByRole("button").click();
      await add(page);
      await page.locator(".detail-favorite:visible").click();
      await expect(notice.getByRole("button")).toHaveCount(0);
      await expect(page.locator(".cart-count")).toHaveText(operation === "read" && key === "difratelli.cart" ? "2" : "4");
      await expect(page.locator(".favorites-count").first()).toHaveText(operation === "read" && key === "difratelli.favorites" ? "0" : "1");
      expect(await saved(page, key)).toBe(key === "difratelli.cart" ? cartSaved : favoritesSaved);
      if (key === "difratelli.cart") {
        expect(JSON.parse((await saved(page, "difratelli.favorites"))!).productIds).toEqual([product.id]);
      } else {
        expect(JSON.parse((await saved(page, "difratelli.cart"))!).lines[0].quantity).toBe(4);
      }
      if (operation === "write") {
        await page.reload();
        await expect(page.locator(".cart-count")).toHaveText(key === "difratelli.cart" ? "2" : "4");
        await expect(page.locator(".favorites-count").first()).toHaveText("1");
      }
    });
  }
}

test("delayed hydration keeps public content visible, controls pending, and saved data untouched", async ({ page }) => {
  await seed(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/*.js", async route => { await gate; await route.continue(); });
  try {
    await page.goto("/favoritos", { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: copy.editorial.pages.favorites.heading })).toBeVisible();
    await expect(page.locator(".favorites-content")).toHaveText(copy.favorites.pending);
    await expect(page.getByText(copy.favorites.emptyHeading)).toHaveCount(0);
    await expect(page.locator(".favorites-count").first()).toHaveText("…");
    await expect(page.locator(".cart-count")).toHaveText("…");
    expect(await saved(page, "difratelli.cart")).toBe(cartSaved);
    expect(await saved(page, "difratelli.favorites")).toBe(favoritesSaved);
    await page.evaluate((empty) => {
      Object.assign(window, { sawFalseEmpty: false });
      new MutationObserver(() => {
        if (document.querySelector(".favorites-content")?.textContent?.includes(empty)) Object.assign(window, { sawFalseEmpty: true });
      }).observe(document.querySelector(".favorites-content")!, { subtree: true, childList: true, characterData: true });
    }, copy.favorites.emptyHeading);
  } finally { release(); }
  await expect(page.locator(".favorites-content .product-card")).toHaveCount(1);
  await expect(page.locator(".cart-count")).toHaveText("2");
  await expect(page.getByText(copy.favorites.emptyHeading)).toHaveCount(0);
  expect(await saved(page, "difratelli.cart")).toBe(cartSaved);
  expect(await saved(page, "difratelli.favorites")).toBe(favoritesSaved);
  expect(await page.evaluate(() => (window as unknown as { sawFalseEmpty: boolean }).sawFalseEmpty)).toBe(false);
});

test("a failed save inside the cart Sheet keeps the command and announces its warning once within the modal", async ({ page }) => {
  await seed(page, cartSaved, favoritesSaved, { operation: "write", key: "difratelli.cart" });
  await page.goto(path);
  await expect(page.locator(".cart-count")).toHaveText("2");
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const sheet = page.getByRole("dialog", { name: copy.cart.title });
  await sheet.getByRole("button", { name: copy.cart.increase.replace("{product}", product.name) }).click();
  await expect(sheet.locator(".cart-feedback")).toContainText(copy.recovery.cart.writeFailure);
  await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(3 * product.priceCents));
  await sheet.getByRole("button", { name: copy.cart.remove.replace("{product}", product.name) }).click();
  await expect(sheet.locator(".cart-feedback")).toHaveText(copy.cart.removed.replace("{product}", product.name));
  await expect(sheet).toContainText(copy.cart.emptyHeading);
  expect(await saved(page, "difratelli.cart")).toBe(cartSaved);
  await page.keyboard.press("Escape");
  await cartNotice(page).getByRole("button").click();
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  await expect(sheet.locator(".cart-feedback")).toBeEmpty();
});

test("tabs keep independent snapshots and each store follows its last successful save", async ({ page, context }) => {
  await seed(page);
  await page.goto(path);
  const second = await context.newPage();
  await second.goto("/favoritos");
  await second.bringToFront();
  await expect(second.locator(".cart-count")).toHaveText("2", { timeout: 15000 });
  await expect(second.locator(".favorites-content .product-card")).toHaveCount(1);
  await page.bringToFront();
  await add(page);
  await page.locator(".detail-favorite:visible").click();
  await expect(page.locator(".cart-count")).toHaveText("3");
  await second.bringToFront();
  await expect(second.locator(".cart-count")).toHaveText("2", { timeout: 15000 });
  await expect(second.locator(".favorites-count").first()).toHaveText("1");
  await second.locator(".favorites-content .product-link").click();
  await expect(second).toHaveURL(new RegExp(product.slug), { timeout: 15000 });
  await add(second);
  await add(second);
  await expect(second.locator(".cart-count")).toHaveText("4");
  await page.bringToFront();
  await expect(page.locator(".cart-count")).toHaveText("3");
  await second.bringToFront();
  await second.reload();
  await expect(second.locator(".cart-count")).toHaveText("4");
  await expect(second.locator(".favorites-count").first()).toHaveText("0");
});
