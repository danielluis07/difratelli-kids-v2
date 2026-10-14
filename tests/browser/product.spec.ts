import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { catalog, copy, photographs, relatedProducts } from "../../lib/catalog";

const product = catalog.products.find((item) => item.colorways.length === 2)!;
const defaultColor = product.colorways.find((color) => color.id === product.defaultColorwayId)!;
const otherColor = product.colorways.find((color) => color.id !== product.defaultColorwayId)!;
const path = `/produto/${product.slug}`;

// Firefox desktop does not expose the Touch constructor. Dispatch the native
// event shape directly for gesture checks; mobile Chromium also uses real CDP input.
async function swipe(area: Locator, dx: number, dy = 0) {
  await area.evaluate((element, { dx, dy }) => {
    for (const [type, x, y] of [["touchstart", 100, 100], ["touchend", 100 + dx, 100 + dy]] as const) {
      const event = new Event(type, { bubbles: true });
      Object.defineProperties(event, { touches: { value: type === "touchstart" ? [{ clientX: x, clientY: y }] : [] }, changedTouches: { value: [{ clientX: x, clientY: y }] } });
      element.dispatchEvent(event);
    }
  }, { dx, dy });
}

test("size starts empty, keyboard selection survives replacement color and URL history changes", async ({ page }) => {
  await page.goto("/produtos");
  await page.locator(`[data-product-id="${product.id}"]`).getByRole("link").click();
  const sizes = page.locator(".size-options:visible");
  await expect(sizes.locator('[aria-pressed="true"]')).toHaveCount(0);
  const size = sizes.getByRole("button", { name: "Tamanho 4", exact: true });
  await size.focus();
  await page.keyboard.press("Enter");
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await size.click();
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  const historyLength = await page.evaluate(() => history.length);
  await page.locator(".detail-colors:visible").getByRole("link", { name: otherColor.name, exact: true }).click();
  await expect(page).toHaveURL(`${page.url().split("?")[0]}?cor=${otherColor.id}`);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await expect(size).toHaveAttribute("aria-pressed", "true");
  const gallery = page.locator(".product-gallery:visible");
  await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  await expect(gallery.locator(".gallery-position")).toHaveText("Foto 1 de 2");
  await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  await page.evaluate((color) => history.pushState(null, "", `?cor=${color}`), defaultColor.id);
  await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[0].alt);
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await page.goForward();
  await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[0].alt);
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => history.replaceState(null, "", "?cor=unknown"));
  await expect(page.locator(".detail-colors:visible [aria-current=true]")).toHaveText(defaultColor.name);
  await expect(size).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(sizes.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(page).toHaveURL(/cor=unknown$/);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`cor=${otherColor.id}$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/produtos$/);
});

test("valid initial color and first invalid scalar fallback do not select a size", async ({ page }) => {
  for (const [query, color] of [[`?cor=${otherColor.id}`, otherColor], [`?cor=invalid&cor=${otherColor.id}`, defaultColor], ["", defaultColor]] as const) {
    await page.goto(path + query);
    await expect(page.locator(".detail-colors:visible [aria-current=true]")).toHaveText(color.name);
    await expect(page.locator(".size-options:visible [aria-pressed=true]")).toHaveCount(0);
    await expect(page.locator(".product-gallery:visible .detail-photo img")).toHaveAttribute("alt", photographs(product.id, color.id)[0].alt);
  }
});

test("gallery buttons wrap, keyboard works, and touch swipes ignore vertical gestures", async ({ page, context, isMobile, browserName }) => {
  await page.goto(path);
  const gallery = page.locator(".product-gallery:visible");
  const image = gallery.locator(".detail-photo img");
  const photos = photographs(product.id, defaultColor.id);
  const previous = gallery.getByRole("button", { name: copy.product.previousPhoto });
  await expect(previous).toBeEnabled();
  await previous.focus();
  await page.keyboard.press("Enter");
  await expect(image).toHaveAttribute("alt", photos[1].alt);
  await page.keyboard.press("Enter");
  await expect(image).toHaveAttribute("alt", photos[0].alt);
  const area = gallery.locator(".detail-photo");
  if (isMobile && browserName === "chromium") {
    await area.scrollIntoViewIfNeeded();
    const bounds = (await area.boundingBox())!;
    const client = await context.newCDPSession(page);
    const y = bounds.y + Math.min(bounds.height / 2, 150);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds.x + bounds.width - 40, y }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: bounds.x + 40, y }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await swipe(area, -150);
  }
  await expect(image).toHaveAttribute("alt", photos[1].alt);
  await swipe(area, 20, 150);
  await expect(image).toHaveAttribute("alt", photos[1].alt);
  await swipe(area, 150);
  await expect(image).toHaveAttribute("alt", photos[0].alt);
});

test("enlargement and guidance trap keyboard focus, restore triggers and pass axe", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(path);
  await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  for (const [label, title, close] of [[copy.product.enlarge, copy.product.enlargedTitle.replace("{product}", product.name), copy.product.closeEnlargement], [copy.product.sizeGuide, copy.sizeGuidance.title, copy.sizeGuidance.close]] as const) {
    const trigger = page.getByRole("button", { name: label, exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("opacity", "1");
    if (label === copy.product.enlarge) {
      await expect(dialog.locator("img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[1].alt);
    } else {
      await expect(dialog.getByRole("row")).toHaveCount(5);
      for (const instruction of copy.sizeGuidance.instructions) await expect(dialog.getByText(instruction.body, { exact: true })).toBeVisible();
      await expect(dialog.getByText(copy.sizeGuidance.outsideChart)).toBeVisible();
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(i % 2 ? "Shift+Tab" : "Tab");
      await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await expect(dialog).toHaveCSS("opacity", "1");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("button", { name: close, exact: true }).click();
    await expect(trigger).toBeFocused();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("details, two-piece set contents and curated related products remain readable", async ({ page }) => {
  const set = catalog.products.find((item) => item.includedPieces.length === 2)!;
  await page.goto(`/produto/${set.slug}`);
  await expect(page.locator(".set-contents:visible")).toHaveText(copy.product.setContents.replace("{pieceOne}", set.includedPieces[0]).replace("{pieceTwo}", set.includedPieces[1]));
  for (const text of [set.description, set.composition, set.fitGuidance]) await expect(page.getByText(text, { exact: true })).toBeVisible();
  const description = page.locator(".product-description:visible details").first();
  await expect(page.getByRole("button", { name: copy.product.sizeGuide, exact: true })).toBeEnabled();
  await description.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(description.locator("p")).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(description.locator("p")).toBeVisible();
  expect(await page.locator(".related-products .product-card").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-product-id")))).toEqual(relatedProducts(set).map((item) => item.id));
  await page.locator(".related-products .product-card").first().getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(relatedProducts(set)[0].name);
  await expect(page.locator(".size-options:visible [aria-pressed=true]")).toHaveCount(0);
});

test("product and dialog image failures retain labeled fallbacks", async ({ page }) => {
  await page.route("**/_next/image?*", (route) => route.abort());
  await page.goto(path);
  const photo = page.locator(".product-gallery:visible .detail-photo");
  await expect(photo.getByRole("img")).toContainText(copy.common.imageFallback);
  await page.getByRole("button", { name: copy.product.enlarge, exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("img")).toContainText(copy.common.imageFallback);
});

test("approved responsive widths and zoom keep options and dialogs usable", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 320) await page.goto(path);
    await expect(page.getByRole("button", { name: copy.product.sizeGuide, exact: true })).toBeEnabled();
    const gallery = page.locator(".product-gallery:visible");
    const information = page.locator(".product-information:visible");
    await expect(information.getByRole("button", { name: "Tamanho 8", exact: true })).toBeVisible();
    const bounds = (await gallery.boundingBox())!;
    const infoBounds = (await information.boundingBox())!;
    expect(width < 768 ? infoBounds.y >= bounds.y + bounds.height : infoBounds.x > bounds.x).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (testInfo.project.name === "chromium" && [390, 768, 1440].includes(width)) {
      await page.locator(".product-gallery:visible .detail-photo img").evaluate((image) => (image as HTMLImageElement).decode());
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`product-${width}.png`), fullPage: true });
    }
    await page.getByRole("button", { name: copy.product.sizeGuide, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: copy.sizeGuidance.title, exact: true });
    await expect(dialog).toBeVisible();
    const dialogBounds = (await dialog.boundingBox())!;
    expect(dialogBounds.width).toBeLessThanOrEqual(width);
    if (testInfo.project.name === "chromium" && [390, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath(`guidance-${width}.png`) });
    await dialog.getByRole("button", { name: copy.sizeGuidance.close }).click();
    await expect(dialog).not.toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
