import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy, formatMoney } from "../../lib/catalog";

const product = catalog.products[0];
const savedCart = JSON.stringify({ version: 1, lines: [{ productId: product.id, colorwayId: product.defaultColorwayId, size: 4, quantity: 2, lastSeenUnitPriceCents: product.priceCents }] });
const savedFavorites = JSON.stringify({ version: 1, productIds: [product.id] });
const fields = copy.checkout.fields;
const submit = (page: Page) => page.getByRole("button", { name: copy.checkout.submit, exact: true });

async function seed(page: Page, failWrite = false) {
  await page.addInitScript(({ savedCart, savedFavorites, failWrite }) => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    if (get.call(localStorage, "difratelli.cart") === null) set.call(localStorage, "difratelli.cart", savedCart);
    if (get.call(localStorage, "difratelli.favorites") === null) set.call(localStorage, "difratelli.favorites", savedFavorites);
    Storage.prototype.setItem = function(key, value) {
      if (this === localStorage && key === "difratelli.cart" && failWrite) throw new DOMException("Full", "QuotaExceededError");
      return set.call(this, key, value);
    };
  }, { savedCart, savedFavorites, failWrite });
}

async function returnToCheckout(page: Page) {
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  await page.getByRole("dialog", { name: copy.cart.title }).getByRole("link", { name: copy.cart.checkout }).click();
  await expect(submit(page)).toBeVisible();
}

test("catalog to product, favorite, cart quantity and checkout form a complete visitor journey", async ({ page }) => {
  await page.goto("/produtos");
  await page.locator(`main [data-product-id="${product.id}"]`).getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/produto/${product.slug}(?:\\?|$)`));
  await page.locator(".detail-favorite:visible").click();
  await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const cart = page.getByRole("dialog", { name: copy.cart.title });
  await cart.getByRole("button", { name: copy.cart.increase.replace("{product}", product.name), exact: true }).click();
  await cart.getByRole("link", { name: copy.cart.checkout, exact: true }).click();
  await expect(page.locator(".checkout-totals")).toContainText(formatMoney(product.priceCents * 2 + 1590));
  await submit(page).click();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
  await expect(page.locator(".cart-count")).toHaveText("0");
  await expect(page.locator(".favorites-count").first()).toHaveText("1");
});

test("restoration gates checkout and empty state offers the full catalog", async ({ page, browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const pendingPage = await context.newPage();
  await pendingPage.goto(`${baseURL}/checkout`);
  await expect(pendingPage.getByText(copy.checkout.pending, { exact: true })).toBeVisible();
  await expect(submit(pendingPage)).toHaveCount(0);
  await expect(pendingPage.getByText(copy.checkout.emptyHeading)).toHaveCount(0);
  await context.close();
  await page.goto("/checkout");
  await expect(page.getByText(copy.checkout.emptyHeading)).toBeVisible();
  await page.getByRole("link", { name: copy.checkout.emptyAction }).click();
  await expect(page).toHaveURL(/\/produtos$/);
});

test("failed cart and checkout images stay inside thumbnails and leave completion usable", async ({ page }) => {
  await seed(page);
  await page.route("**/_next/image?*", route => route.abort());
  await page.goto("/sobre");
  await page.getByRole("button", { name: /Abrir sacola/ }).click();
  const cart = page.getByRole("dialog", { name: copy.cart.title });
  await cart.locator(".cart-photo").scrollIntoViewIfNeeded();
  await expect(cart.locator(".cart-photo .image-fallback")).toBeVisible();
  await expect.poll(() => cart.locator(".cart-photo .image-fallback").evaluate(element => {
    const fallback = element.getBoundingClientRect();
    const photo = element.parentElement!.getBoundingClientRect();
    return fallback.left >= photo.left && fallback.top >= photo.top && fallback.right <= photo.right && fallback.bottom <= photo.bottom;
  })).toBe(true);
  await cart.getByRole("link", { name: copy.cart.checkout, exact: true }).click();
  await page.locator(".checkout-summary .cart-photo").scrollIntoViewIfNeeded();
  await expect(page.locator(".checkout-summary .image-fallback")).toBeVisible();
  await expect.poll(() => page.locator(".checkout-summary .image-fallback").evaluate(element => element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight)).toBe(true);
  await submit(page).click();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
  await page.locator(".checkout-summary .cart-photo").scrollIntoViewIfNeeded();
  await expect(page.locator(".checkout-summary .image-fallback")).toBeVisible();
});

test("validates on edited-field exit and submit, preserves values and focuses the first invalid field", async ({ page }) => {
  await seed(page);
  await page.goto("/checkout");
  await expect(page.locator('[data-slot="field-error"]')).toHaveCount(0);
  const name = page.getByRole("textbox", { name: fields.name, exact: true });
  await name.focus();
  await name.press("Tab");
  await expect(page.locator('[data-slot="field-error"]')).toHaveCount(0);
  await name.fill("  ");
  await page.getByRole("textbox", { name: fields.email, exact: true }).fill("invalid");
  await expect(page.getByText(copy.checkout.validation.name, { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: fields.postalCode, exact: true }).fill("123");
  await page.getByRole("textbox", { name: fields.street, exact: true }).fill("");
  await page.getByRole("textbox", { name: fields.number, exact: true }).fill("");
  await page.getByRole("textbox", { name: fields.neighborhood, exact: true }).fill("");
  await page.getByRole("textbox", { name: fields.city, exact: true }).fill("");
  await submit(page).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("  ");
  await expect(page.locator('[data-slot="field-error"]')).toHaveCount(7);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await name.fill("Nome alterado");
  await submit(page).click();
  await expect(page.getByRole("textbox", { name: fields.email, exact: true })).toBeFocused();
  for (const field of ["email", "postalCode", "street", "neighborhood", "city"] as const) {
    await page.getByRole("textbox", { name: fields[field], exact: true }).fill(copy.checkout.defaults[field]);
  }
  await page.getByRole("textbox", { name: fields.number, exact: true }).fill("s/n");
  await page.getByRole("textbox", { name: fields.complement, exact: true }).fill("");
  await page.getByRole("combobox", { name: fields.state, exact: true }).click();
  await page.getByRole("option", { name: "Rio de Janeiro", exact: true }).click();
  await submit(page).click();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
  await expect(page.locator(".checkout-delivery-summary")).toContainText("Nome alterado");
  await expect(page.locator(".checkout-delivery-summary")).toContainText("RJ");
});

test("draft/payment survive client navigation, errors reset on return and reload restores approved defaults", async ({ page }) => {
  await seed(page);
  await page.goto("/checkout");
  await page.getByRole("textbox", { name: fields.name, exact: true }).fill("Nome da visita");
  await page.getByRole("textbox", { name: fields.email, exact: true }).fill("invalid");
  await page.getByRole("button", { name: "Cartão", exact: true }).click();
  await expect(page.getByText(copy.checkout.validation.emailInvalid, { exact: true })).toBeVisible();
  await page.locator(".store-footer").getByRole("link", { name: copy.navigation.catalog, exact: true }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await returnToCheckout(page);
  await expect(page.getByRole("textbox", { name: fields.name, exact: true })).toHaveValue("Nome da visita");
  await expect(page.getByRole("textbox", { name: fields.email, exact: true })).toHaveValue("invalid");
  await expect(page.getByRole("button", { name: "Cartão", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-slot="field-error"]')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("textbox", { name: fields.name, exact: true })).toHaveValue(copy.checkout.defaults.name);
  await expect(page.getByRole("button", { name: "Pix", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("completes once with exact post-success disclosure, totals, clearing, retained favorites and temporary confirmation", async ({ page }) => {
  await seed(page);
  await page.goto("/checkout");
  await expect(submit(page)).toBeVisible();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toHaveCount(0);
  await expect(page.locator(".checkout-totals")).toContainText(formatMoney(product.priceCents * 2 + 1590));
  await expect(page.locator(".checkout-summary")).toContainText("5 a 8 dias úteis");
  await expect(page.getByRole("button", { name: "Pix", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator('input[type="password"], input[autocomplete="cc-number"], input[autocomplete="cc-csc"]').count()).toBe(0);
  const purchaseRequests: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") purchaseRequests.push(request.url()); });
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    let clears = 0;
    Storage.prototype.setItem = function(key, value) {
      if (key === "difratelli.cart" && JSON.parse(value).lines.length === 0) clears++;
      return set.call(this, key, value);
    };
    Object.assign(window, { checkoutClears: () => clears });
    const form = document.querySelector<HTMLFormElement>("form.checkout-columns")!;
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: copy.checkout.completion.heading })).toBeFocused();
  expect(await page.evaluate(() => (window as unknown as { checkoutClears(): number }).checkoutClears())).toBe(1);
  expect(purchaseRequests).toEqual([]);
  await expect(page.locator(".cart-count")).toHaveText("0");
  await expect(page.locator(".favorites-count").first()).toHaveText("1");
  await expect(page.locator(".checkout-summary .cart-line")).toContainText(product.name);
  await expect(page.locator(".checkout-totals")).toContainText(formatMoney(product.priceCents * 2 + 1590));
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem("difratelli.cart")))!).lines).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("difratelli.favorites"))).toBe(savedFavorites);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("link", { name: copy.checkout.completion.continueAction.label }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText(copy.checkout.emptyHeading)).toBeVisible();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(copy.checkout.emptyHeading)).toBeVisible();
});

test("a preparation failure preserves inputs/cart and a retry completes", async ({ page }) => {
  await seed(page);
  await page.goto("/checkout");
  await page.getByRole("textbox", { name: fields.name, exact: true }).fill("Nome para tentar de novo");
  // Inject a failure at immutable snapshot preparation, without application test endpoints.
  await page.evaluate(() => {
    const freeze = Object.freeze;
    let fail = true;
    Object.freeze = function<T>(value: T): Readonly<T> {
      if (fail && value && typeof value === "object" && "lines" in value && "draft" in value && "totals" in value) {
        fail = false;
        throw new Error("Snapshot preparation failed");
      }
      return freeze(value);
    };
  });
  await submit(page).click();
  await expect(page.getByText(copy.checkout.preCommitFailure, { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: fields.name, exact: true })).toHaveValue("Nome para tentar de novo");
  await expect(page.locator(".cart-count")).toHaveText("2");
  expect(await page.evaluate(() => localStorage.getItem("difratelli.cart"))).toBe(savedCart);
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toHaveCount(0);
  await submit(page).click();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
});

test("failed cart persistence still completes and warns that previous saved choices can return on reload", async ({ page }) => {
  await seed(page, true);
  await page.goto("/checkout");
  await submit(page).click();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
  await expect(page.getByText(copy.checkout.completion.failedCartSave, { exact: true })).toBeVisible();
  await expect(page.locator(".cart-count")).toHaveText("0");
  await expect(page.locator(".favorites-count").first()).toHaveText("1");
  expect(await page.evaluate(() => localStorage.getItem("difratelli.cart"))).toBe(savedCart);
  await page.reload();
  await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toHaveCount(0);
  await expect(page.locator(".cart-count")).toHaveText("2");
  await expect(page.getByRole("textbox", { name: fields.name, exact: true })).toHaveValue(copy.checkout.defaults.name);
});

test("responsive checkout, errors and completion remain usable at 390, 768 and 1440 pixels", async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Fixed-width visual captures use desktop Chromium.");
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, baseURL });
    const page = await context.newPage();
    await seed(page);
    await page.goto("/checkout");
    await expect(submit(page)).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `docs/reviews/issue-41/checkout-${width}.png`, fullPage: true });
    await page.getByRole("textbox", { name: fields.name, exact: true }).fill("");
    await submit(page).click();
    await expect(page.getByRole("textbox", { name: fields.name, exact: true })).toBeFocused();
    await page.screenshot({ path: `docs/reviews/issue-41/errors-${width}.png`, fullPage: true });
    await page.getByRole("textbox", { name: fields.name, exact: true }).fill(copy.checkout.defaults.name);
    await submit(page).click();
    await expect(page.getByText(copy.checkout.completion.disclosure, { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `docs/reviews/issue-41/completion-${width}.png`, fullPage: true });
    await context.close();
  }
});
