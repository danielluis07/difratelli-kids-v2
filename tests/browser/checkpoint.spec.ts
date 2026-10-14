import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy, formatMoney, photographs } from "../../lib/catalog";

test("checkpoint: keyboard skip link leaves the main heading below the sticky header", async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/produtos");
    await expect(page.getByRole("combobox", { name: copy.browsing.sort })).toBeEnabled();
    await page.getByRole("link", { name: copy.navigation.skipLink }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect.poll(() => page.evaluate(() => document.querySelector("h1")!.getBoundingClientRect().top - document.querySelector("header")!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("main")))).toBe(true);
  }
});

test("checkpoint: every product and offered color has readable approved content", async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/produtos");
  for (const product of catalog.products) {
    await expect(page.locator("main:visible .product-card")).toHaveCount(30);
    await page.locator(`main:visible [data-product-id="${product.id}"]`).getByRole("link").click();
    expect((await page.request.get(`/produto/${product.slug}`)).status(), product.slug).toBe(200);
    const colors = [...product.colorways].sort((a, b) => Number(b.id === product.defaultColorwayId) - Number(a.id === product.defaultColorwayId));
    for (const color of colors) {
      if (color.id !== product.defaultColorwayId) {
        await page.locator(".detail-colors:visible").getByRole("link", { name: color.name, exact: true }).click();
      }
      const information = page.locator(".product-information:visible");
      await expect(information.getByRole("heading", { level: 1 })).toHaveText(product.name);
      await expect(information.locator(".detail-price")).toHaveText(formatMoney(product.priceCents));
      await expect(information.locator("strong")).toHaveText(color.name);
      for (const text of [product.description, product.composition, product.fitGuidance]) {
        await expect(information.getByText(text, { exact: true })).toBeVisible();
      }
      await expect(page.locator(".product-gallery:visible .detail-photo img")).toHaveAttribute("alt", photographs(product.id, color.id)[0].alt);
      await expect(information.locator('[aria-current="true"]')).toHaveText(color.name);
    }
    expect(errors, product.slug).toEqual([]);
    if (product !== catalog.products.at(-1)) {
      await page.getByRole("contentinfo").getByRole("link", { name: copy.navigation.catalog, exact: true }).click();
    }
  }
});

test("checkpoint: public route matrix retains loaded imagery, responsive layout and accessibility", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The other projects exercise route behavior; this matrix records desktop Chromium captures.");
  test.setTimeout(300_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paths = ["/", "/produtos", "/novidades", "/meninas", "/meninos", "/colecoes", ...catalog.collections.map(c => `/colecoes/${c.slug}`), "/sobre", "/busca", "/busca?q=descobertas", "/busca?q=inexistente", "/produtos?categoria=polos&familia=purple", "/favoritos", "/not-a-route"];
  const evidence: { path: string; width: number; status: number | undefined; axeViolations: number; screenshot: string }[] = [];
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [index, path] of paths.entries()) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(path === "/not-a-route" ? 404 : 200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // Full-page captures include off-screen carousel items. Load those assets
      // explicitly; browser lazy loading correctly leaves clipped items unloaded.
      await page.locator("main:visible img").evaluateAll(items => {
        for (const item of items) (item as HTMLImageElement).loading = "eager";
      });
      // Visit the full page so lazy photography is actually loaded in the capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
          scrollTo(0, y);
          await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        }
        scrollTo(0, 0);
      });
      const images = page.locator("main:visible img:visible");
      await expect.poll(() => images.evaluateAll(items => items.every(item => {
        const image = item as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      })), { timeout: 20_000 }).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width}px`).toBe(true);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(axe.violations, `${path} at ${width}px`).toEqual([]);
      const screenshot = `route-${index}-${width}.png`;
      await page.screenshot({ path: testInfo.outputPath(screenshot), fullPage: true });
      evidence.push({ path, width, status: response?.status(), axeViolations: axe.violations.length, screenshot });
    }
  }
  await testInfo.attach("route-matrix", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
});

test("checkpoint: product navigation returns to committed listing history", async ({ page }) => {
  await page.goto("/produtos?categoria=polos&ordem=preco-desc");
  const card = page.locator("main:visible .product-card").first();
  const productId = await card.getAttribute("data-product-id");
  await card.getByRole("link").click();
  const product = catalog.products.find(p => p.id === productId)!;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name);
  if (product.colorways.length > 1) {
    const color = product.colorways.find(c => c.id !== product.defaultColorwayId)!;
    await page.locator(".detail-colors:visible").getByRole("link", { name: color.name, exact: true }).click();
    await expect(page.locator(".product-information:visible strong")).toHaveText(color.name);
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/produtos\?categoria=polos&ordem=preco-desc$/);
  await expect(page.locator("main:visible .product-card")).toHaveCount(2);
  await expect(page.getByRole("combobox", { name: copy.browsing.sort })).toContainText(copy.browsing.sortOptions.priceDescending);
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name);
});
