import { chromium, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Run with Bun while the production server is listening on port 3100.
const catalog = JSON.parse(await readFile('docs/content/catalog-proposal.json', 'utf8'));
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
await mkdir('test-results/checkpoint-manual', { recursive: true });
try {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`http://127.0.0.1:3100/produto/${catalog.products[0].slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(catalog.products[0].name);
    await page.locator('main img').evaluateAll(images => { for (const image of images) image.loading = 'eager'; });
    await expect.poll(() => page.locator('main img:visible').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/checkpoint-manual/product-${width}.png`, fullPage: true });
  }
  const skipEvidence = [];
  const copy = JSON.parse(await readFile('docs/content/copy-proposal.json', 'utf8'));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3100/produtos');
    await page.getByRole('link', { name: copy.navigation.skipLink }).focus();
    await page.keyboard.press('Enter');
    const measure = () => page.evaluate(() => ({
      headingTop: document.querySelector('h1').getBoundingClientRect().top,
      headerBottom: document.querySelector('header').getBoundingClientRect().bottom,
    }));
    await expect.poll(async () => { const bounds = await measure(); return bounds.headingTop >= bounds.headerBottom; }).toBe(true);
    skipEvidence.push({ width, ...await measure() });
    await page.screenshot({ path: `test-results/checkpoint-manual/skip-link-after-${width}.png` });
  }
  await writeFile('test-results/checkpoint-manual/skip-link-results.json', JSON.stringify(skipEvidence, null, 2));
} finally { await browser.close(); }
