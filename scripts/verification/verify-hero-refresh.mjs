import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const integration = JSON.parse(await readFile("docs/content/hero-color-refresh-integration.json", "utf8"));
const baseURL = process.env.HERO_REVIEW_URL ?? "http://127.0.0.1:3300";
const prefix = "docs/content/hero-color-refresh-runtime-v2";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const checks = [];
try {
  for (const width of [390, 480, 768, 1024, 1279, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1080 }, reducedMotion: "reduce" });
    await page.goto(baseURL);
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".hero-panel img:visible").evaluateAll(async images => { await Promise.all(images.map(i => i.decode())); });
    assert.equal(await page.locator(".hero-panel img:visible").count(), width >= 1024 ? 2 : 1);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const expected = width < 480 ? "hero-left-court-compact-v1-portrait" : width < 768 ? "hero-left-court-compact-v1-narrow" : width < 1024 ? "hero-left-court-wide-v2-tablet" : width < 1280 ? "hero-left-court-compact-v1-narrow" : "hero-left-court-wide-v2-desktop";
    const selected = await page.locator(".hero-left img").evaluate(i => decodeURIComponent(i.currentSrc));
    assert(selected.includes(expected), selected);
    if (width >= 1024) {
      const selected = await page.locator(".hero-right img").evaluate(i => decodeURIComponent(i.currentSrc));
      assert(selected.includes(width < 1280 ? "hero-right-clothes-v2-narrow" : "hero-right-clothes-v2-desktop"), selected);
    }
    for (const selector of [".hero-copy", ".hero-actions"]) {
      const bounds = await page.locator(selector).boundingBox(), panel = await page.locator(".hero-left").boundingBox();
      assert(bounds.x >= panel.x && bounds.x + bounds.width <= panel.x + panel.width + 1 && bounds.y >= panel.y && bounds.y + bounds.height <= panel.y + panel.height + 1);
    }
    await page.locator(".editorial-hero").screenshot({ path: prefix + "-" + width + ".png" });
// Sample the underlying rendered background at every text-character box.
    // This includes the unchanged overlay gradient and action backgrounds.
    const boxes = await page.locator(".hero-copy").evaluate(root => {
      const hero = root.closest(".editorial-hero").getBoundingClientRect();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const boxes = []; let node;
      while ((node = walker.nextNode())) for (let i = 0; i < node.textContent.length; i++) {
        if (!node.textContent[i].trim()) continue;
        const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
        for (const r of range.getClientRects()) boxes.push({ x: r.x - hero.x, y: r.y - hero.y, width: r.width, height: r.height, large: Boolean(node.parentElement.closest("h1")) });
      }
      return boxes;
    });
    await page.locator(".hero-copy").evaluate(el => { el.style.color = "transparent"; });
    const underlying = await page.locator(".editorial-hero").screenshot();
    await page.locator(".hero-copy").evaluate(el => { el.style.color = ""; });
    const { data, info } = await sharp(underlying).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const linear = n => { const s = n / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; };
    const contrast = { heading: 21, smallText: 21 };
    for (const box of boxes) for (let y = Math.max(0, Math.floor(box.y)); y < Math.min(info.height, Math.ceil(box.y + box.height)); y++) for (let x = Math.max(0, Math.floor(box.x)); x < Math.min(info.width, Math.ceil(box.x + box.width)); x++) {
      const offset = (y * info.width + x) * info.channels;
      const luminance = .2126 * linear(data[offset]) + .7152 * linear(data[offset + 1]) + .0722 * linear(data[offset + 2]);
      const key = box.large ? "heading" : "smallText";
      contrast[key] = Math.min(contrast[key], 1.05 / (luminance + .05));
    }
    assert(contrast.heading >= 3 && contrast.smallText >= 4.5, `Overlay contrast at ${width}: ${JSON.stringify(contrast)}`);
        checks.push({ width, imageLoading: "passed", selectedSource: expected, copyBounds: "passed", overlayContrast: contrast });
    await page.close();
  }
  const page = await browser.newPage();
  for (const action of integration.heroActions) {
    await page.goto(baseURL);
    assert.equal(await page.locator(".hero-actions a").count(), 2);
    await page.locator(".hero-actions").getByRole("link", { name: action.label, exact: true }).click();
    await page.waitForURL(url => url.pathname + url.search === action.href);
    await page.locator("main:visible h1").waitFor();
    assert.equal((await page.locator("main:visible h1").textContent())?.trim().length > 0, true);
  }
  await page.close();
} finally { await browser.close(); }
await writeFile(prefix + "-checks.json", JSON.stringify({ revision: integration.revision, recordedAtUtc: new Date().toISOString(), status: "passed", shoppingDestinations: integration.heroActions.map(a => a.href), checks }, null, 2) + "\n");
console.log("Runtime hero verified: eight widths, restored right image, two shopping actions, decoded images, exact responsive sources and readable overlays.");
