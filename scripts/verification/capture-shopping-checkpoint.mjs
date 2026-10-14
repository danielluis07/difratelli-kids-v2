import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Run with Bun against the production server on port 3100.
const catalog = JSON.parse(await readFile('docs/content/catalog-proposal.json', 'utf8'));
const copy = JSON.parse(await readFile('docs/content/copy-proposal.json', 'utf8'));
const product = catalog.products.find(item => item.colorways.length === 2);
const color = product.colorways.find(item => item.id !== product.defaultColorwayId);
const line = { productId: product.id, colorwayId: color.id, size: 4, quantity: 2, lastSeenUnitPriceCents: product.priceCents };
const root = 'docs/reviews/issue-40';
await mkdir(`${root}/captures`, { recursive: true });
const browser = await chromium.launch();
const observations = [];
const baseURL = 'http://127.0.0.1:3100';

async function contextFor(width, cart, favorites, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width < 1024, ...options });
  if (cart !== undefined) await context.addInitScript(({ cart, favorites }) => {
    localStorage.setItem('difratelli.cart', cart);
    localStorage.setItem('difratelli.favorites', favorites);
  }, { cart, favorites });
  return context;
}

async function capture(page, width, state, checks = {}) {
  console.log(`Capturing ${state} at ${width}px`);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Settle visible photographs without forcing offscreen lazy images to load.
  await expect.poll(() => page.locator('img:visible').evaluateAll(images => images.every(image => {
    const bounds = image.getBoundingClientRect();
    return bounds.bottom < 0 || bounds.top > innerHeight || (image.complete && image.naturalWidth > 0);
  })), { timeout: 15000 }).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  const file = `captures/${state}-${width}.png`;
  await page.screenshot({ path: `${root}/${file}` });
  observations.push({ width, state, file, engine: browser.version(), touchEmulated: width < 1024, reducedMotion: true, horizontalOverflow: false, axeViolations: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })), ...checks });
  expect(axe.violations).toEqual([]);
}

try {
  for (const width of [390, 768, 1440]) {
    const context = await contextFor(width, JSON.stringify({ version: 1, lines: [line, { ...line, size: 6, quantity: 1 }] }), JSON.stringify({ version: 1, productIds: catalog.products.slice(0, 4).map(item => item.id) }));
    const page = await context.newPage();
    await page.goto(`${baseURL}/produto/${product.slug}?cor=${color.id}`);
    await expect(page.getByRole('button', { name: copy.product.addToCart, exact: true })).toBeEnabled({ timeout: 15000 });
    await capture(page, width, 'product');
    await page.getByRole('button', { name: copy.product.addToCart, exact: true }).click();
    await expect(page.locator('.size-options:visible button').first()).toBeFocused();
    await capture(page, width, 'missing-size', { missingSizeFocus: true });
    for (const [state, label, title] of [['guidance', copy.product.sizeGuide, copy.sizeGuidance.title], ['enlargement', copy.product.enlarge, copy.product.enlargedTitle.replace('{product}', product.name)]]) {
      const trigger = page.getByRole('button', { name: label, exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: title, exact: true });
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Tab');
      await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
      await capture(page, width, state, { keyboardFocusContained: true });
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
    const cartTrigger = page.getByRole('button', { name: /Abrir sacola/ });
    await cartTrigger.click();
    const sheet = page.getByRole('dialog', { name: copy.cart.title });
    await expect(sheet.locator('.cart-line')).toHaveCount(2);
    await page.keyboard.press('Tab');
    await expect.poll(() => sheet.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await capture(page, width, 'cart', { keyboardFocusContained: true });
    await page.keyboard.press('Escape');
    await expect(cartTrigger).toBeFocused();
    await page.goto(`${baseURL}/favoritos`);
    await expect(page.locator('.favorites-content .product-card')).toHaveCount(4, { timeout: 15000 });
    await capture(page, width, 'favorites');
    await context.close();

    const empty = await contextFor(width);
    const emptyPage = await empty.newPage();
    await emptyPage.goto(`${baseURL}/favoritos`);
    await expect(emptyPage.getByText(copy.favorites.emptyHeading)).toBeVisible({ timeout: 15000 });
    await capture(emptyPage, width, 'favorites-empty');
    await emptyPage.getByRole('button', { name: /Abrir sacola/ }).click();
    await capture(emptyPage, width, 'cart-empty');
    await empty.close();

    for (const [state, cart, favorites] of [
      ['recovery', JSON.stringify({ version: 1, lines: [line, { ...line, quantity: 12, lastSeenUnitPriceCents: 1 }, { ...line, productId: 'obsolete' }] }), JSON.stringify({ version: 1, productIds: [product.id, product.id, 'obsolete'] })],
      ['storage-failure', '{', '{'],
    ]) {
      const recovery = await contextFor(width, cart, favorites);
      const recoveryPage = await recovery.newPage();
      await recoveryPage.goto(`${baseURL}/favoritos`);
      await expect(recoveryPage.locator('.storage-notice[data-visible=true]')).toHaveCount(2, { timeout: 15000 });
      await capture(recoveryPage, width, state);
      await recovery.close();
    }
    const pending = await contextFor(width);
    const pendingPage = await pending.newPage();
    // Block application bundles while retaining browser timers for axe's
    // asynchronous injected audit; disabling browser JS also disables them.
    await pendingPage.route('**/*.js', route => route.abort());
    await pendingPage.goto(`${baseURL}/favoritos`);
    await expect(pendingPage.locator('.favorites-content')).toHaveText(copy.favorites.pending);
    await capture(pendingPage, width, 'pending', { appJavaScriptBlocked: true });
    await pending.close();

    const failure = await contextFor(width);
    const failurePage = await failure.newPage();
    await failurePage.route('**/_next/image?*', route => route.abort());
    await failurePage.goto(`${baseURL}/produto/${product.slug}`);
    await expect(failurePage.locator('.product-gallery:visible .detail-photo').getByRole('img')).toContainText(copy.common.imageFallback);
    const thumbnails = failurePage.locator('.product-gallery:visible .gallery-thumbnail .image-fallback');
    await expect(thumbnails).toHaveCount(2);
    await expect.poll(() => thumbnails.evaluateAll(elements => elements.every(element => element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight))).toBe(true);
    await capture(failurePage, width, 'image-failure');
    await failure.close();
  }
} finally {
  await writeFile(`${root}/visual-observations.json`, JSON.stringify({ condition: 'Windows Chromium; touch emulation at 390/768 CSS pixels. Agent visual review and human/assistive-technology review are recorded separately.', observations }, null, 2) + '\n');
  const states = [...new Set(observations.map(item => item.state))];
  const rows = states.map(state => `<section><h2>${state}</h2><div class="row">${observations.filter(item => item.state === state).map(item => `<figure><a href="${item.file}"><img loading="lazy" src="${item.file}" alt="${state} at ${item.width} CSS pixels"></a><figcaption>${item.width}px · axe: ${item.axeViolations.length} findings</figcaption></figure>`).join('')}</div></section>`).join('\n');
  await writeFile(`${root}/gallery.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Issue 40 shopping review captures</title><style>body{font:16px system-ui;margin:24px;background:#faf7f0;color:#30241c}h1,h2{line-height:1.2}.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid #b8afa3}figcaption{margin:8px 0 32px}@media(max-width:700px){.row{grid-template-columns:1fr}}</style><h1>Integrated shopping checkpoint</h1><p>Local production captures at 390, 768 and 1440 CSS pixels. Click to inspect full size. Human acceptance remains pending; see <a href="review.md">the review record</a> for the exact revision, outcomes and unchecked coverage.</p>${rows}</html>\n`);
  await browser.close();
}
