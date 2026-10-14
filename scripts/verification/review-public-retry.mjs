import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
// Manual browser fault exercise for the installed Next.js 16.4 Flight format.
// Only the intercepted response changes; no app route or approved asset is edited.
// Run while the local production server is listening on port 3100.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
let injected = false;
await page.route('http://127.0.0.1:3100/sobre', async route => {
  if (injected || !route.request().isNavigationRequest()) return route.continue();
  const response = await route.fetch();
  let changed = false;
  const body = (await response.text()).replace(/self\.__next_f\.push\((.*?)\)<\/script>/gs, (script, encoded) => {
    const payload = JSON.parse(encoded);
    if (typeof payload[1] !== 'string') return script;
    payload[1] = payload[1].replace(/^([a-f\d]+):\[.*"className":"editorial-page brand-page".*$/gm, (_line, id) => {
      changed = true;
      return `${id}:E{"digest":"checkpoint-injected-response-failure"}`;
    });
    return `self.__next_f.push(${JSON.stringify(payload)})</script>`;
  });
  if (!changed) throw new Error('No page payload found: injection was not performed');
  injected = true;
  await route.fulfill({ response, body });
});
try {
  await page.goto('http://127.0.0.1:3100/sobre');
  await page.getByRole('heading', { name: 'Não foi possível abrir esta página' }).waitFor({ timeout: 15000 });
  console.log('Recovery heading:', await page.locator('main h1').innerText());
  console.log('Buttons:', await page.locator('main button').allTextContents());
  if (await page.locator('main a').getAttribute('href') !== '/') throw new Error('Missing homepage recovery action');
  await mkdir('test-results/checkpoint-manual', { recursive: true });
  await page.screenshot({ path: 'test-results/checkpoint-manual/retry.png', fullPage: true });
  const axe = await new AxeBuilder({ page }).analyze();
  await writeFile('test-results/checkpoint-manual/retry-axe.json', JSON.stringify(axe.violations, null, 2));
  if (axe.violations.length) throw new Error('Retry surface has axe violations');
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: 'test-results/checkpoint-manual/retry-mobile.png', fullPage: true });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile recovery overflow');
  await page.locator('main button').focus();
  await page.keyboard.press('Enter');
  await page.locator('.brand-intro h1').waitFor({ timeout: 15000 });
  console.log('Recovered:', await page.locator('.brand-intro h1').innerText());
  await writeFile('test-results/checkpoint-manual/retry-results.json', JSON.stringify({
    condition: 'One intercepted /sobre document contains a synthetic server-page Flight error; subsequent requests are unchanged.',
    engine: browser.version(), widths: [1440, 390], axeViolations: axe.violations.length,
    homepageAction: '/', keyboardRetryRecovered: true,
  }, null, 2));
} finally { await browser.close(); }
