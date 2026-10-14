import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const manifest = JSON.parse(await readFile("docs/content/homepage-unsplash-manifest.json", "utf8"));
const baseURL = process.env.HOMEPAGE_IMAGE_REVIEW_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const editorialSelector = ".hero-panel img, .category-photo img, .editorial-background img, .look-photo img, .social-photo img";
const checks = [];
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1080 }, reducedMotion: "reduce" });
    page.setDefaultTimeout(90_000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.goto(baseURL, { timeout: 90_000 });
    await page.locator(".homepage").waitFor();
    await page.evaluate(() => document.fonts.ready);
    // Trigger lazy loading through scrolling without changing React-owned attributes.
    const visiblePhotos = page.locator(editorialSelector).filter({ visible: true });
    for (const photo of await visiblePhotos.all()) {
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(image => image.decode());
    }
    const selected = await visiblePhotos.evaluateAll(images => images.map(image => ({ src: decodeURIComponent(image.currentSrc), alt: image.alt, width: image.naturalWidth })));
    assert(selected.length >= 19);
    const retainedCrops = manifest.retainedAssets.flatMap(asset => asset.crops.map(crop => crop.src));
    assert(selected.every(image => image.width > 0 && (image.src.includes("/images/homepage/unsplash/") || retainedCrops.some(src => image.src.includes(src)))), JSON.stringify(selected));
    for (const asset of manifest.retainedAssets) {
      const panel = asset.id === "quote-garments" ? ".quote-editorial" : ".collection-editorial";
      const crop = asset.crops.find(crop => crop.name === (width < 768 ? "compact" : "desktop"));
      assert((await page.locator(`${panel} img`).evaluate(image => decodeURIComponent(image.currentSrc))).includes(crop.src), "Original banner crop not restored");
      assert.equal(await page.locator(`${panel} .editorial-overlay`).evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)", "Original banner overlay styling not restored");
    }
    for (const { slot, sourceUrl } of manifest.userSelections ?? []) {
      const category = slot.replace(/^category-/, "");
      const image = page.locator(slot.startsWith("category-") ? `.category-tile a[href="/produtos?categoria=${category}"] img` : slot === "hero-left-wide" ? ".hero-left img" : ".hero-right img");
      if (!await image.isVisible()) continue;
      const expectedId = new URL(sourceUrl).pathname.slice(1);
      assert((await image.evaluate(image => decodeURIComponent(image.currentSrc))).includes(expectedId), `Wrong user-selected photo for ${slot}`);
    }
    assert(await page.locator(".product-photo img").evaluateAll(images => images.length > 0 && images.every(image => decodeURIComponent(image.src).includes("/images/catalog/"))));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const leftSource = selected[0].src;
    assert(leftSource.includes(width < 480 ? "-portrait.webp" : width < 768 ? "-narrow.webp" : width < 1024 ? "-tablet.webp" : "-desktop.webp"));
    for (const [label, id] of [["Dia de quintal", "MDIGo4Ez-0g"], ["Riscos na calçada", "COgVvJ_CG_I"], ["Histórias em casa", "VoXqvbLAPjM"]]) {
      await page.getByRole("tab", { name: label }).click();
      const photo = page.locator(".look-photo img:visible");
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(image => image.decode());
      assert((await photo.evaluate(image => decodeURIComponent(image.currentSrc))).includes(id));
      const asset = manifest.assets.find(asset => asset.id === id);
      assert.equal(asset.kind, "clothes-only");
    }
    await page.getByRole("tab", { name: "Dia de quintal" }).click();
    await page.evaluate(() => {
      for (const track of document.querySelectorAll(".carousel-track")) track.scrollLeft = 0;
      window.scrollTo(0, 0);
    });
    assert.equal(await page.locator(".quote-editorial a").getAttribute("href"), "/produtos?categoria=dresses");
    assert.equal(await page.locator(".collection-editorial a").getAttribute("href"), "/colecoes/quintal-de-descobertas");
    await page.locator(".editorial-hero").screenshot({ path: `docs/content/homepage-unsplash-hero-${width}.png` });
    for (const panel of ["quote", "collection"]) await page.locator(`.${panel}-editorial`).screenshot({ path: `docs/content/homepage-unsplash-${panel}-${width}.png` });
    await page.screenshot({ path: `docs/content/homepage-unsplash-page-${width}.png`, fullPage: true });
    assert.deepEqual(errors, [], "Browser errors");
    checks.push({ width, editorialImageLoading: "passed", imageSources: "local Unsplash exports and two restored original banners", restoredBannerCropsAndStyling: "passed", catalogCardSources: "unchanged catalog", responsiveHero: "passed", allThreeClothesOnlyLooks: "passed", horizontalOverflow: false, browserErrors: errors });
    await page.close();
  }
  const page = await browser.newPage();
  await page.goto(baseURL);
  const productHref = await page.locator(".product-link").first().getAttribute("href");
  await page.goto(new URL(productHref, baseURL).href, { timeout: 90_000 });
  await page.locator("main h1").waitFor();
  const photos = await page.locator("main img").evaluateAll(images => images.map(image => decodeURIComponent(image.src)));
  assert(photos.some(src => src.includes("/images/catalog/")), "Product gallery missing catalog photos");
  assert(photos.every(src => !src.includes("/images/homepage/unsplash/")), "Homepage preview leaked into product page");
  await page.close();
} finally { await browser.close(); }
await writeFile("docs/content/homepage-unsplash-runtime-checks.json", JSON.stringify({ revision: manifest.revision, status: "passed", recordedAtUtc: new Date().toISOString(), productPageCatalogSources: "passed", checks }, null, 2) + "\n");
console.log("Verified Unsplash homepage at mobile, tablet and desktop; all look tabs, local image decoding, shopping links and untouched product-page catalog photos.");
