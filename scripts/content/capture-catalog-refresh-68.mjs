import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, expect } from "@playwright/test";
import { reviewRoot, revision, selections } from "./catalog-refresh-68-spec.mjs";

const baseURL = process.env.CATALOG_REVIEW_URL ?? "http://127.0.0.1:3200";
const integrated = process.argv.includes("--integrated");
const outputRoot = integrated ? `${reviewRoot}/integration` : reviewRoot;
await mkdir(outputRoot, { recursive: true });
const json = async path => JSON.parse(await readFile(path, "utf8"));
if (!integrated) {
  try {
    const approval = await json(`${reviewRoot}/approval.json`);
    assert.notEqual(approval.status, "approved", "Accepted review captures are immutable. Use --integrated for subsequent verification.");
  } catch (error) { if (error.code !== "ENOENT") throw error; }
}
const manifest = await json(`${reviewRoot}/manifest.json`), audit = await json(`${reviewRoot}/audit.json`);
const catalog = await json("docs/content/catalog-proposal.json"), copy = await json("docs/content/copy-proposal.json");
const maps = new Map(manifest.assets.map(asset => {
  const current = audit.assets.find(a => a.id === asset.replacesAssetId);
  return [current.webPath.replace(/^public/, ""), asset];
}));
const browser = await chromium.launch();
const results = [], requests = [], failures = [];
try {
  for (const width of [390, 768, 1440]) {
    console.log(`Checking ${width}px review, cards and gallery`);
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, hasTouch: width === 390, isMobile: width === 390, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => failures.push({ width, error: error.message }));
    // Use the real unchanged storefront components. Substitution exists only in
    // this Playwright context; production selectors/manifests stay approved.
    if (!integrated) await context.route("**/_next/image?*", async route => {
      const url = new URL(route.request().url()), asset = maps.get(url.searchParams.get("url"));
      if (!asset) return route.continue();
      const previousUrl = url.searchParams.get("url");
      url.searchParams.set("url", asset.webPath.replace(/^public/, ""));
      const response = await route.fetch({ url: url.toString() });
      assert(response.ok(), `${asset.id}: optimized image failed: ${response.status()}`);
      requests.push({ viewport: width, previousUrl, substitutedPath: asset.webPath, requestedWidth: Number(url.searchParams.get("w")), status: response.status() });
      await route.fulfill({ response });
    });
    if (integrated) page.on("response", response => {
      const url = new URL(response.url());
      const asset = manifest.assets.find(a => a.webPath.replace(/^public/, "") === url.searchParams.get("url"));
      if (url.pathname === "/_next/image" && asset) requests.push({ viewport: width, path: asset.webPath, requestedWidth: Number(url.searchParams.get("w")), status: response.status() });
    });
    await page.goto(pathToFileURL(resolve(`${reviewRoot}/review.html`)).href);
    await page.locator("section").first().locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert.equal(await page.locator("section").count(), 42);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator("section").first().screenshot({ path: `${outputRoot}/comparison-${width}.png` });
    for (const selection of selections) {
      const product = catalog.products.find(p => p.id === selection.productId);
      const colorway = product.colorways.find(c => c.id === selection.colorwayId);
      const currentPair = (integrated ? manifest.assets : audit.assets).filter(a => a.productId === product.id && a.colorwayId === colorway.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
      await page.goto(`${baseURL}/produtos?categoria=trousers`);
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      const card = page.locator(`main [data-product-id="${product.id}"]`);
      await expect(card).toBeVisible();
      await card.getByRole("button", { name: `Cor ${colorway.name}`, exact: true }).click();
      await expect(card.locator(".model-photo")).toHaveAttribute("alt", currentPair[0].alt);
      await card.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await card.scrollIntoViewIfNeeded();
      const cardSources = await card.locator("img").evaluateAll(images => images.map(image => ({ src: image.currentSrc, naturalWidth: image.naturalWidth, sizes: image.sizes })));
      assert(cardSources.every(i => i.naturalWidth > 0 && i.sizes));
      if (integrated) for (const [index, source] of cardSources.entries()) assert.equal(new URL(source.src).searchParams.get("url"), currentPair[index].webPath.replace(/^public/, ""));
      await page.mouse.move(0, 0);
      await page.locator(".product-grid").screenshot({ path: `${outputRoot}/cards-${width}.png` });
      if (width === 390) {
        await card.getByRole("button", { name: `Cor ${colorway.name}`, exact: true }).tap();
        await expect.poll(() => card.locator(".isolated-photo").evaluate(image => getComputedStyle(image).opacity)).toBe("0");
      }
      await card.getByRole("link").focus();
      // Establish keyboard modality after selecting the color with a pointer.
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect.poll(() => card.locator(".isolated-photo").evaluate(image => getComputedStyle(image).opacity)).toBe("1");
      await card.screenshot({ path: `${outputRoot}/card-focus-${width}.png` });
      if (width !== 390) {
        await card.hover();
        await expect.poll(() => card.locator(".isolated-photo").evaluate(image => getComputedStyle(image).opacity)).toBe("1");
      }
      await page.goto(`${baseURL}/produto/${product.slug}?cor=${colorway.id}`);
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      const gallery = page.locator(".product-gallery:visible");
      await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", currentPair[0].alt);
      await gallery.locator(".detail-photo img").evaluate(image => image.decode());
      if (integrated) assert.equal(await gallery.locator(".detail-photo img").evaluate(image => new URL(image.currentSrc).searchParams.get("url")), currentPair[0].webPath.replace(/^public/, ""));
      await gallery.screenshot({ path: `${outputRoot}/gallery-model-${width}.png` });
      await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
      await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", currentPair[1].alt);
      await gallery.locator(".detail-photo img").evaluate(image => image.decode());
      await expect(gallery.locator(".gallery-position")).toHaveText("Foto 2 de 2");
      if (integrated) assert.equal(await gallery.locator(".detail-photo img").evaluate(image => new URL(image.currentSrc).searchParams.get("url")), currentPair[1].webPath.replace(/^public/, ""));
      await gallery.screenshot({ path: `${outputRoot}/gallery-isolated-${width}.png` });
      await gallery.locator(".gallery-thumbnail").first().click();
      await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", currentPair[0].alt);
      await gallery.locator(".gallery-thumbnail").nth(1).click();
      await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", currentPair[1].alt);
      await page.getByRole("button", { name: copy.product.previousPhoto, exact: true }).click();
      await expect(gallery.locator(".gallery-position")).toHaveText("Foto 1 de 2");
      await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
      await page.getByRole("button", { name: copy.product.enlarge, exact: true }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator(".enlarged-photo img").evaluate(image => image.decode());
      const enlargementSource = await dialog.locator(".enlarged-photo img").evaluate(image => ({ src: image.currentSrc, naturalWidth: image.naturalWidth }));
      await dialog.getByRole("button", { name: copy.product.closeEnlargement, exact: true }).click();
      const retainedColor = product.colorways.find(c => c.id !== colorway.id);
      await page.locator(".detail-colors:visible").getByRole("link", { name: retainedColor.name, exact: true }).click();
      await expect(gallery.locator(".gallery-position")).toHaveText("Foto 1 de 2");
      const retained = audit.assets.find(a => a.productId === product.id && a.colorwayId === retainedColor.id && a.role === "model");
      await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", retained.alt);
      await gallery.locator(".detail-photo img").evaluate(image => image.decode());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      results.push({ width, productId: product.id, colorwayId: colorway.id, status: "passed", cardSources, enlargementSource,
        checks: ["42-colorway comparison review without horizontal overflow", "real card alongside retained photographs", "candidate image loading through responsive optimizer", width === 390 ? "touch retains model; keyboard focus reveals isolation" : "card keyboard focus and pointer hover reveal isolation", "model-first gallery", "isolated-second gallery", "thumbnail selection and previous/next controls", "enlargement", "retained colorway navigation and gallery reset"] });
    }
    await context.close();
  }
  assert.equal(failures.length, 0, JSON.stringify(failures));
  assert(manifest.assets.every(asset => requests.some(r => (integrated ? r.path : r.substitutedPath) === asset.webPath)));
  assert(requests.every(r => r.status === 200));
  await writeFile(`${outputRoot}/browser-checks.json`, `${JSON.stringify({ revision, recordedAtUtc: new Date().toISOString(), status: "passed", mode: integrated ? "integrated storefront; actual accepted URLs and Portuguese alt text; no image substitution" : "pre-integration browser-only network substitution; source URLs and alt text remain current approved metadata", baseURL, browser: "Chromium", deviceScaleFactor: 1, results, requests, pageErrors: failures }, null, 2)}\n`);
  console.log("Passed candidate comparisons and real storefront card/gallery checks at 390, 768 and 1440px.");
} finally { await browser.close(); }
