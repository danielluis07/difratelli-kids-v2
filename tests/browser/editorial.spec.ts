import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog } from "../../lib/catalog";
import homepage from "../../docs/content/homepage-copy-proposal.json";
import heroIntegration from "../../docs/content/hero-color-refresh-integration.json";
import homepageImagery from "../../docs/content/homepage-unsplash-manifest.json";

test("full-bleed homepage keeps the approved structure, hero sources and destinations at eight widths", async ({ page }) => {
  // Eight viewport visits also decode both restored full-width banner images.
  test.setTimeout(180_000);
  for (const width of [390, 480, 768, 1024, 1279, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".hero-panel img:visible")).toHaveCount(width >= 1024 ? 2 : 1);
    await expect(page.locator("[data-home-section]")).toHaveCount(9);
    expect(await page.locator("[data-home-section]").evaluateAll(sections => sections.map(s => s.getAttribute("data-home-section")))).toEqual(["hero", "new-arrivals", "promo", "categories", "quote", "collection-feature", "looks", "street-play", "social"]);
    expect(await page.locator("main").evaluate(main => Math.round(main.getBoundingClientRect().width))).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const source = await page.locator(".hero-left img").evaluate((image: HTMLImageElement) => decodeURIComponent(image.currentSrc));
    expect(source).toContain(`photo-1604303768345-038b79a8c47a-${width < 480 ? "portrait" : width < 768 ? "narrow" : width < 1024 ? "tablet" : width < 1280 ? "narrow" : "desktop"}`);
    if (width >= 1024) {
      const rightSource = await page.locator(".hero-right img").evaluate((image: HTMLImageElement) => decodeURIComponent(image.currentSrc));
      expect(rightSource).toContain(`photo-1622290291468-a28f7a7dc6a8-${width < 1280 ? "narrow" : "desktop"}`);
      const panels = await page.locator(".hero-panel").evaluateAll(items => items.map(item => item.getBoundingClientRect().width));
      expect(panels[0]).toBeCloseTo(width / 2, 0);
      expect(panels[1]).toBeCloseTo(width / 2, 0);
    }
    await expect(page.locator(".hero-actions a")).toHaveCount(2);
    for (const action of heroIntegration.heroActions) await expect(page.locator(".hero-actions").getByRole("link", { name: action.label })).toHaveAttribute("href", action.href);
    await page.locator(".hero-panel img:visible").evaluateAll(async images => { await Promise.all(images.map(image => (image as HTMLImageElement).decode())); });
    for (const selector of [".hero-copy", ".hero-actions"]) {
      const bounds = (await page.locator(selector).boundingBox())!;
      const panel = (await page.locator(".hero-left").boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(panel.x);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(panel.x + panel.width + 1);
      expect(bounds.y).toBeGreaterThanOrEqual(panel.y);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(panel.y + panel.height + 1);
    }
    await expect(page.locator('[data-home-section="new-arrivals"] .product-card')).toHaveCount(8);
    await expect(page.locator('[data-home-section="street-play"] .product-card')).toHaveCount(4);
    expect(await page.locator(".category-tile a").evaluateAll(links => links.map(link => link.getAttribute("href")))).toEqual(catalog.categories.map(c => `/produtos?categoria=${c.id}`));
    await expect(page.locator(".social-photo")).toHaveCount(7);
    await expect(page.locator(".social-section a, main form, main video")).toHaveCount(0);
    for (const [selector, filename] of [[".quote-editorial", "quote-garments"], [".collection-editorial", "editorial-quintal"]]) {
      const image = page.locator(`${selector} img`);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((image: HTMLImageElement) => image.decode());
      expect(await image.evaluate((image: HTMLImageElement) => decodeURIComponent(image.currentSrc))).toContain(`${filename}-${width < 768 ? "compact" : "desktop"}-v1`);
      expect(await page.locator(`${selector} .editorial-overlay`).evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    }
    await page.locator(".editorial-hero").screenshot({ path: test.info().outputPath(`homepage-hero-${width}.png`) });
  }
});

test("approved category replacements and section-bounded sticky look photography", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const asset of homepageImagery.assets.filter(asset => asset.slotIds.some(slot => slot.startsWith("category-")))) {
    const image = page.locator(`.category-tile img[src*="${asset.id}"]`);
    await expect(image).toHaveCount(1);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  for (const width of [1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const look of homepage.shopTheLook.tabs) {
      await page.getByRole("tab", { name: look.label }).click();
      const panel = page.getByRole("tabpanel", { name: look.label });
      const photo = panel.locator(".look-photo");
      const bounds = await panel.locator(".look-content").evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      });
      const height = (await photo.boundingBox())!.height;
      const travel = bounds.bottom - bounds.top - height;
      expect(travel).toBeGreaterThan(0);
      await page.evaluate(y => scrollTo(0, y), bounds.top - 104 + travel / 2);
      await expect.poll(async () => Math.round((await photo.boundingBox())!.y)).toBe(104);
      await expect.poll(() => photo.locator("img").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      if (width === 1440 && look === homepage.shopTheLook.tabs[0]) await page.screenshot({ path: test.info().outputPath("sticky-look.png") });
      await page.evaluate(y => scrollTo(0, y), bounds.bottom - height - 104 + 150);
      await expect.poll(async () => Math.abs((await photo.boundingBox())!.y + 46)).toBeLessThan(2);
      expect(await photo.evaluate(el => Math.abs(el.getBoundingClientRect().bottom - el.parentElement!.getBoundingClientRect().bottom))).toBeLessThan(2);
    }
  }
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.locator(".look-photo:visible").evaluate(el => getComputedStyle(el).position)).toBe("relative");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("carousel arrows and keyboard reveal cards without off-screen tab stops", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator('[data-home-section="new-arrivals"]');
  const track = section.locator(".carousel-track");
  await expect(track.locator("li").last()).toHaveAttribute("inert", "");
  await section.getByRole("button", { name: "Próximo: Novidades" }).click();
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await track.focus();
  await page.keyboard.press("End");
  await expect(track.locator("li").last()).not.toHaveAttribute("inert", "");
  await expect(section.getByRole("button", { name: "Próximo: Novidades" })).toBeDisabled();
  const lastCard = track.locator("li").last();
  await lastCard.locator("a").focus();
  await expect(lastCard.locator("a")).toBeFocused();
  await track.focus();
  await page.keyboard.press("Home");
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBe(0);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBe(0);
  for (const kind of ["categories", "social"]) {
    const carousel = page.locator(`[data-carousel="${kind}"]`);
    await carousel.getByRole("button", { name: /^Próximo:/ }).click();
    await expect.poll(() => carousel.locator("ul").evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  }
});

test("native touch swipe moves the category carousel", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Native touch gesture injected through Chromium's protocol.");
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const track = page.locator('[data-carousel="categories"] ul');
  await track.scrollIntoViewIfNeeded();
  const bounds = (await track.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const y = bounds.y + Math.min(bounds.height / 2, 200);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 330, y }] });
  for (const x of [290, 250, 200, 150, 90]) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await session.detach();
});

test("announcement rotates, pauses and obeys reduced motion; details navigate", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const bar = page.locator(".announcement-bar");
  await expect(bar.locator("p")).toContainText(homepage.announcement[0].text);
  // Start through hydrated controls before advancing the virtual timer.
  await bar.getByRole("button", { name: "Pausar mensagens" }).click();
  await bar.getByRole("button", { name: "Retomar mensagens" }).click();
  await page.locator("h1").click();
  await page.bringToFront();
  await page.clock.runFor(6100);
  await expect(bar.locator("p")).toContainText(homepage.announcement[1].text);
  await bar.getByRole("button", { name: "Pausar mensagens" }).click();
  await page.locator("h1").click();
  await page.clock.fastForward(13000);
  await expect(bar.locator("p")).toContainText(homepage.announcement[1].text);
  await bar.getByRole("button", { name: "Próxima mensagem" }).click();
  await expect(bar.locator("p")).toContainText(homepage.announcement[2].text);
  await bar.getByRole("button", { name: "Mensagem anterior" }).click();
  await expect(bar.getByRole("link", { name: "Detalhes" })).toHaveAttribute("href", "/novidades");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(bar.getByRole("button", { name: "Retomar mensagens" })).toBeDisabled();
  await page.clock.fastForward(13000);
  await expect(bar.locator("p")).toContainText(homepage.announcement[1].text);
  await bar.getByRole("link", { name: "Detalhes" }).click();
  await expect(page).toHaveURL(/\/novidades$/);
});

test("look tabs work by keyboard and retain product/colorway links beside clothes-only imagery", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "Combinações por coleção" });
  await tabs.getByRole("tab").first().focus();
  for (const [index, look] of homepage.shopTheLook.tabs.entries()) {
    if (index) await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: look.label })).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel", { name: look.label });
    await expect(panel.locator(".product-card")).toHaveCount(4);
    expect(await panel.locator(".product-card").evaluateAll(cards => cards.map(c => c.getAttribute("data-product-id")))).toEqual(look.products.map(p => p.productId));
    for (const p of look.products) await expect(panel.locator(`[data-product-id="${p.productId}"] .product-link`)).toHaveAttribute("href", new RegExp(`cor=${p.colorwayId}$`));
    const asset = homepageImagery.assets.find(asset => asset.slotIds.includes(look.imageId))!;
    expect(asset.kind).toBe("clothes-only");
    await expect(panel.locator(".look-photo img")).toHaveAttribute("src", new RegExp(asset.id));
  }
});

test("collection and brand pages retain full-width approved imagery, stories, browsing and 404 behavior", async ({ page, request }) => {
  await page.goto("/colecoes");
  for (const collection of catalog.collections) {
    await page.locator(".collection-index-grid").getByRole("link", { name: new RegExp(collection.name) }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection.name);
    await expect(page.locator(".editorial-opening img")).toBeVisible();
    await expect(page.locator("main .product-card")).toHaveCount(10);
    await expect(page.getByRole("combobox")).toBeEnabled();
    expect(await page.locator("main:visible").evaluate(main => main.getBoundingClientRect().width)).toBe(await page.evaluate(() => innerWidth));
    await page.goto("/colecoes");
  }
  await page.goto("/sobre");
  await expect(page.locator(".brand-section")).toHaveCount(2);
  await expect(page.locator(".editorial-opening img")).toBeVisible();
  await expect(page.locator(".brand-motif")).toHaveCount(2);
  const response = await request.get("/colecoes/missing-collection");
  expect(response.status()).toBe(404);
  await page.goto("/colecoes/missing-collection");
  await expect(page.locator("main:visible").getByRole("link", { name: "Explorar produtos" })).toHaveAttribute("href", "/produtos");
});

test("responsive editorial pages remain accessible with reduced motion and 200% text zoom", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/sobre", "/colecoes/quintal-de-descobertas"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations).toEqual([]);
    }
  }
  // Browser-equivalent 200% zoom at a 1440px screen gives a 720px CSS viewport.
  await page.setViewportSize({ width: 720, height: 500 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const action of heroIntegration.heroActions) await expect(page.locator(".hero-actions").getByRole("link", { name: action.label })).toBeVisible();
});

test("a failed editorial image retains its space and readable fallback", async ({ page }) => {
  await page.route("**/_next/image?*", route => decodeURIComponent(route.request().url()).includes("photo-1604303768345-038b79a8c47a") ? route.abort() : route.continue());
  await page.goto("/");
  await expect(page.locator(".hero-left .image-fallback")).toBeVisible();
  expect((await page.locator(".hero-left").boundingBox())!.height).toBeGreaterThanOrEqual(560);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(homepage.hero.heading);
});
