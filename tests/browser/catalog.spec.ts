import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy, newArrivals, curatedProducts, photographs } from "../../lib/catalog";

test("catalog, curated arrivals and audience views retain the approved assortment", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/produtos");
  for (const [path, label, products] of [
    ["/produtos", copy.navigation.catalog, curatedProducts()],
    ["/novidades", copy.navigation.newArrivals, newArrivals().toSorted((a, b) => a.curatedRank - b.curatedRank)],
    ["/meninas", copy.navigation.girls, curatedProducts().filter((p) => p.audienceId !== "boys")],
    ["/meninos", copy.navigation.boys, curatedProducts().filter((p) => p.audienceId !== "girls")],
  ] as const) {
    if (path !== "/produtos") await page.getByRole("contentinfo").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("main:visible .product-card")).toHaveCount(products.length);
    await expect(page.getByRole("status")).toHaveText(`${products.length} produtos`);
    const ids = await page.locator("main:visible .product-card").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-product-id")));
    expect(ids).toEqual(products.map((product) => product.id));
    expect(new Set(ids).size).toBe(products.length);
  }
  expect(errors).toEqual([]);
});

test("responsive grids, sticky navigation and compact destinations work at the approved widths", async ({ page }) => {
  for (const [width, columns] of [[390, 2], [768, 3], [1024, 4], [1440, 4]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/produtos");
    await expect(page.locator("main .product-card")).toHaveCount(30);
    const layout = await page.locator(".product-grid:visible").evaluate((grid) => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    expect(layout).toEqual({ columns, overflow: false });
    await page.evaluate(() => window.scrollTo(0, 500));
    expect(await page.locator("header").evaluate((header) => header.getBoundingClientRect().top)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    if (width < 1024) {
      const opener = page.getByRole("button", { name: copy.navigation.openMenu });
      await opener.click();
      const sheet = page.getByRole("dialog", { name: copy.navigation.mobileMenuTitle });
      await expect(sheet).toBeVisible();
      for (const label of [copy.navigation.newArrivals, copy.navigation.girls, copy.navigation.boys, copy.navigation.collections, copy.navigation.brand, copy.navigation.search, copy.navigation.favorites]) {
        await expect(sheet.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
      await page.keyboard.press("Escape");
      await expect(sheet).not.toBeVisible();
      await expect(opener).toBeFocused();
    } else {
      await expect(page.locator(".desktop-navigation")).toBeVisible();
    }
  }
});

test("keyboard and click category menus lead to existing scoped listings", async ({ page, isMobile }) => {
  await page.goto("/produtos");
  if (isMobile) {
    await page.getByRole("button", { name: copy.navigation.openMenu }).click();
    await page.getByRole("button", { name: "Mostrar opções de Meninas" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Vestidos", exact: true }).click();
  } else {
    const trigger = page.locator(".desktop-navigation").getByRole("button", { name: "Meninas", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("menuitem", { name: "Vestidos", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/meninas\?categoria=dresses$/);
  await expect(page.locator("main:visible .product-card")).toHaveCount(3);
  await page.reload();
  await expect(page.locator("main:visible .product-card")).toHaveCount(3);
});

test("swatches carry preview choice to readable detail and invalid color values use the default", async ({ page }) => {
  const product = catalog.products.find((product) => product.colorways.length === 2)!;
  const chosen = product.colorways[1];
  await page.goto("/produtos");
  const card = page.locator(`[data-product-id="${product.id}"]`);
  await card.getByRole("button", { name: `Cor ${chosen.name}`, exact: true }).click();
  await expect(card.getByRole("button", { name: `Cor ${chosen.name}`, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(card.locator(".model-photo")).toHaveAttribute("alt", new RegExp(chosen.name));
  await card.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/produto/${product.slug}\\?cor=${chosen.id}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name);
  await expect(page.locator(".product-information strong:visible")).toHaveText(chosen.name);
  const information = page.locator(".product-information:visible");
  await expect(information.getByText(product.description, { exact: true })).toBeVisible();
  await expect(information.getByText(product.composition, { exact: true })).toBeVisible();
  await expect(information.getByText(product.fitGuidance, { exact: true })).toBeVisible();
  await page.goto(`/produto/${product.slug}?cor=unknown&cor=${chosen.id}`);
  await expect(page.locator(".product-information strong:visible")).toHaveText(product.colorways.find((color) => color.id === product.defaultColorwayId)!.name);
});

test("product gallery shows one image, supports thumbnail selection and resets for another color", async ({ page }) => {
  const product = catalog.products.find((product) => product.colorways.length === 2)!;
  const color = product.colorways.find((color) => color.id === product.defaultColorwayId)!;
  const otherColor = product.colorways.find((option) => option.id !== color.id)!;
  const photos = photographs(product.id, color.id);
  await page.goto(`/produto/${product.slug}`);
  const gallery = page.locator(".product-gallery:visible");
  const mainImage = gallery.locator(".detail-photo img");
  const thumbnails = gallery.getByRole("button");
  await expect(mainImage).toHaveCount(1);
  await expect(mainImage).toHaveAttribute("alt", photos[0].alt);
  await expect(thumbnails).toHaveCount(photos.length);
  await expect(thumbnails.first()).toHaveAttribute("aria-pressed", "true");
  await thumbnails.nth(1).click();
  await expect(mainImage).toHaveAttribute("alt", photos[1].alt);
  await expect(thumbnails.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(gallery.locator(".gallery-position")).toHaveText("Foto 2 de 2");
  // Pressing the current thumbnail must not leave the gallery without a photo.
  await thumbnails.nth(1).click();
  await expect(mainImage).toHaveAttribute("alt", photos[1].alt);
  await thumbnails.nth(1).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(thumbnails.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(mainImage).toHaveAttribute("alt", photos[0].alt);
  await thumbnails.nth(1).click();
  await page.locator(".detail-colors:visible").getByRole("link", { name: otherColor.name, exact: true }).click();
  await expect(mainImage).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  await expect(thumbnails.first()).toHaveAttribute("aria-pressed", "true");
  await expect(gallery.locator(".gallery-position")).toHaveText("Foto 1 de 2");
  await page.reload();
  await expect(page.locator(".product-information strong:visible")).toHaveText(otherColor.name);
  await expect(mainImage).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  await expect(thumbnails.first()).toHaveAttribute("aria-pressed", "true");
  const bounds = await gallery.locator(".detail-photo").boundingBox();
  expect(bounds!.height / bounds!.width).toBeCloseTo(4 / 3, 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("gallery thumbnails become interactive when their hydrated color view is ready", async ({ page }) => {
  let resumeHydration!: () => void;
  const hydrationGate = new Promise<void>((resolve) => { resumeHydration = resolve; });
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await hydrationGate;
    await route.continue();
  });
  await page.goto(`/produto/${catalog.products[0].slug}`, { waitUntil: "commit" });
  const gallery = page.locator(".product-gallery:visible");
  const thumbnails = gallery.getByRole("button");
  try {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(catalog.products[0].name);
    await expect(thumbnails.nth(1)).toBeDisabled();
  } finally {
    resumeHydration();
  }
  await expect(thumbnails.nth(1)).toBeEnabled();
  await thumbnails.nth(1).click();
  await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(catalog.products[0].id, catalog.products[0].defaultColorwayId)[1].alt);
});

test("cards reveal isolated images for pointer and keyboard inspection while touch retains models", async ({ page, isMobile }) => {
  await page.goto("/novidades");
  const card = page.locator("main .product-card").first();
  const isolated = card.locator(".isolated-photo");
  await expect(isolated).toHaveCSS("opacity", "0");
  if (isMobile) {
    await card.getByRole("button").first().tap();
    await expect(isolated).toHaveCSS("opacity", "0");
  } else {
    await card.hover();
    await expect(isolated).toHaveCSS("opacity", "1");
    await page.mouse.move(0, 0);
    await card.getByRole("link").focus();
    await expect(isolated).toHaveCSS("opacity", "1");
  }
});

test("failed catalog images retain their reserved space and readable fallback", async ({ page }) => {
  await page.route("**/_next/image?*", (route) => route.abort());
  await page.goto("/novidades");
  const photo = page.locator("main .product-photo").first();
  await expect(photo.locator(".model-photo.image-fallback")).toHaveText(copy.common.imageFallback);
  const bounds = await photo.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height / bounds!.width).toBeCloseTo(4 / 3, 1);
});

test("unknown destinations recover through the catalog and sharing metadata uses the configured origin", async ({ page, request }) => {
  for (const path of ["/not-a-route", "/produto/not-a-product", "/colecoes/not-a-collection"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.errors.notFoundHeading);
    await expect(page.getByRole("main").getByRole("link", { name: copy.errors.notFoundAction })).toHaveAttribute("href", "/produtos");
  }
  await page.goto("/produtos");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "http://127.0.0.1:3100/produtos");
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toMatch(/^http:\/\/127\.0\.0\.1:3100\/images\//);
  expect((await request.get(image!)).ok()).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("listing, product, navigation and cart surfaces pass representative axe checks", async ({ page, isMobile }) => {
  test.setTimeout(60_000);
  for (const path of ["/produtos", `/produto/${catalog.products[0].slug}`]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  }
  if (isMobile) {
    await page.getByRole("button", { name: copy.navigation.openMenu }).click();
    await expect(page.getByRole("dialog", { name: copy.navigation.mobileMenuTitle })).toHaveCSS("opacity", "1");
  } else {
    await page.locator(".desktop-navigation").getByRole("button", { name: "Meninas", exact: true }).click();
    await expect(page.getByRole("menu")).toHaveCSS("opacity", "1");
  }
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  const cart = page.getByRole("button", { name: copy.cart.open });
  await cart.click();
  await expect(page.getByRole("dialog", { name: copy.cart.title })).toBeVisible();
  await expect(page.getByRole("dialog", { name: copy.cart.title })).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(cart).toBeFocused();
});

test("public catalog and known product and collection content is available before hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/produtos`);
  await expect(page.locator("main .product-card")).toHaveCount(30);
  await page.goto(`${baseURL}/produto/${catalog.products[0].slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(catalog.products[0].name);
  await expect(page.getByRole("main").getByText(catalog.products[0].description, { exact: true })).toBeVisible();
  const collection = catalog.collections[0];
  await page.goto(`${baseURL}/colecoes/${collection.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection.name);
  await expect(page.locator("main .product-card")).toHaveCount(curatedProducts().filter((product) => product.collectionId === collection.id).length);
  await context.close();
});
