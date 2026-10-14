# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> add focuses missing size, merges, limits, and keeps selected options distinct
- Location: tests\browser\cart.spec.ts:9:5

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  getByRole('button', { name: 'Adicionar à sacola', exact: true })
Expected: enabled
Received: disabled
Timeout:  5000ms

Call log:
  - Expect "toBeEnabled" getByRole('button', { name: 'Adicionar à sacola', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Adicionar à sacola', exact: true })
    8 × locator resolved to <button disabled tabindex="0" type="button" data-disabled="" data-slot="button" class="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-colors duration-150 select-none focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:rin…>Adicionar à sacola</button>
      - unexpected value "disabled"

```

```yaml
- button "Adicionar à sacola" [disabled]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { catalog, copy, formatMoney } from "../../lib/catalog";
  4   | 
  5   | const product = catalog.products.find(item => item.colorways.length === 2)!;
  6   | const otherColor = product.colorways.find(color => color.id !== product.defaultColorwayId)!;
  7   | const path = `/produto/${product.slug}`;
  8   | 
  9   | test("add focuses missing size, merges, limits, and keeps selected options distinct", async ({ page }) => {
  10  |   await page.goto(path);
  11  |   const add = page.getByRole("button", { name: copy.product.addToCart, exact: true });
> 12  |   await expect(add).toBeEnabled();
      |                     ^ Error: expect(locator).toBeEnabled() failed
  13  |   await add.click();
  14  |   await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.missingSize);
  15  |   await expect(page.locator(".size-options:visible button").first()).toBeFocused();
  16  |   await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  17  |   await add.click();
  18  |   await expect(page.locator(".purchase-feedback")).toContainText("adicionado à sacola");
  19  |   await expect(page.getByRole("dialog", { name: copy.cart.title })).toHaveCount(0);
  20  |   await add.click();
  21  |   await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.merged.replace("{product}", product.name));
  22  |   for (let i = 0; i < 9; i++) await add.click();
  23  |   await expect(page.locator(".purchase-feedback")).toHaveText(copy.product.quantityLimited);
  24  |   await expect(page.locator(".cart-count")).toHaveText("10");
  25  |   await page.locator(".detail-colors:visible").getByRole("link", { name: otherColor.name, exact: true }).click();
  26  |   await expect(page.locator(".product-information strong:visible")).toHaveText(otherColor.name);
  27  |   await add.click();
  28  |   await page.getByRole("button", { name: "Tamanho 6", exact: true }).click();
  29  |   await add.click();
  30  |   await page.getByRole("button", { name: /Abrir sacola/ }).click();
  31  |   const sheet = page.getByRole("dialog", { name: copy.cart.title });
  32  |   await expect(sheet.locator(".cart-line")).toHaveCount(3);
  33  |   await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 12));
  34  |   await expect(sheet.locator(".cart-line").nth(1)).toContainText(otherColor.name);
  35  |   await expect(sheet.locator(".cart-line").nth(2)).toContainText("Tamanho: 6");
  36  |   await expect(sheet.getByRole("link", { name: copy.cart.checkout })).toHaveAttribute("href", "/checkout");
  37  |   await page.reload();
  38  |   await expect(page.locator(".cart-count")).toHaveText("12");
  39  |   await page.getByRole("button", { name: /Abrir sacola/ }).click();
  40  |   await expect(sheet.locator(".cart-line")).toHaveCount(3);
  41  |   await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 12));
  42  | });
  43  | 
  44  | test("Sheet quantity limits, removal, announcements, focus, sizing and empty exploration", async ({ page }) => {
  45  |   await page.goto(path);
  46  |   await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  47  |   await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  48  |   const trigger = page.getByRole("button", { name: /Abrir sacola/ });
  49  |   await trigger.click();
  50  |   const sheet = page.getByRole("dialog", { name: copy.cart.title });
  51  |   await expect(sheet.getByRole("button", { name: copy.cart.close })).toBeFocused();
  52  |   const viewport = page.viewportSize()!;
  53  |   await expect.poll(async () => {
  54  |     const bounds = await sheet.boundingBox();
  55  |     return bounds ? { width: Math.round(bounds.width), right: Math.round(bounds.x + bounds.width) } : null;
  56  |   }).toEqual({ width: viewport.width < 768 ? viewport.width : 480, right: viewport.width });
  57  |   await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).click();
  58  |   await expect(sheet.getByRole("status")).toHaveText(copy.cart.minimumQuantity);
  59  |   await expect(page.locator(".cart-count")).toHaveText("1");
  60  |   const increase = sheet.getByRole("button", { name: copy.cart.increase.replace("{product}", product.name) });
  61  |   for (let i = 0; i < 10; i++) await increase.click();
  62  |   await expect(sheet.getByRole("status")).toHaveText(copy.cart.maximumQuantity);
  63  |   await expect(page.locator(".cart-count")).toHaveText("10");
  64  |   await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).click();
  65  |   await expect(sheet.getByRole("status")).toHaveText(copy.cart.quantityUpdated.replace("{product}", product.name).replace("{quantity}", "9"));
  66  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  67  |   await sheet.getByRole("button", { name: copy.cart.remove.replace("{product}", product.name) }).click();
  68  |   await expect(sheet.getByRole("status")).toHaveText(copy.cart.removed.replace("{product}", product.name));
  69  |   await expect(sheet.getByRole("button", { name: copy.cart.close })).toBeFocused();
  70  |   await expect(sheet).toContainText(copy.cart.emptyHeading);
  71  |   await expect(page.locator(".cart-count")).toHaveText("0");
  72  |   await page.keyboard.press("Escape");
  73  |   await expect(trigger).toBeFocused();
  74  |   await trigger.click();
  75  |   await sheet.getByRole("link", { name: copy.cart.emptyAction }).click();
  76  |   await expect(page).toHaveURL(/\/produtos$/);
  77  |   await expect(sheet).toHaveCount(0);
  78  |   await page.reload();
  79  |   await expect(page.locator(".cart-count")).toHaveText("0");
  80  | });
  81  | 
  82  | test("prerendered public content uses neutral gated cart UI", async ({ browser, baseURL }) => {
  83  |   const context = await browser.newContext({ javaScriptEnabled: false });
  84  |   const page = await context.newPage();
  85  |   await page.goto(`${baseURL}${path}`);
  86  |   await expect(page.getByRole("heading", { name: product.name, exact: true })).toBeVisible();
  87  |   await expect(page.locator(".cart-count")).toHaveText("…");
  88  |   await expect(page.getByRole("button", { name: copy.product.addToCart, exact: true })).toBeDisabled();
  89  |   await context.close();
  90  | });
  91  | 
  92  | test("normal restoration never overwrites saved selections and survives public navigation", async ({ page }) => {
  93  |   const saved = JSON.stringify({ version: 1, lines: [{ productId: product.id, colorwayId: otherColor.id, size: 8, quantity: 3, lastSeenUnitPriceCents: 1 }] });
  94  |   await page.addInitScript(({ saved }) => {
  95  |     if (!localStorage.getItem("difratelli.cart")) localStorage.setItem("difratelli.cart", saved);
  96  |   }, { saved });
  97  |   await page.goto("/sobre");
  98  |   await expect(page.locator(".cart-count")).toHaveText("3");
  99  |   expect(await page.evaluate(() => localStorage.getItem("difratelli.cart"))).toBe(saved);
  100 |   await page.getByRole("button", { name: /Abrir sacola/ }).click();
  101 |   const sheet = page.getByRole("dialog", { name: copy.cart.title });
  102 |   await expect(sheet.locator(".cart-line")).toContainText(otherColor.name);
  103 |   await expect(sheet.locator(".cart-line")).toContainText("Tamanho: 8");
  104 |   await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(product.priceCents * 3));
  105 |   await sheet.locator(".cart-photo").click();
  106 |   await expect(page).toHaveURL(new RegExp(`${product.slug}\\?cor=${otherColor.id}$`));
  107 |   await expect(page.locator(".cart-count")).toHaveText("3");
  108 |   await page.getByRole("button", { name: "Tamanho 8", exact: true }).click();
  109 |   await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  110 |   await expect(page.locator(".cart-count")).toHaveText("4");
  111 |   await page.reload();
  112 |   await expect(page.locator(".cart-count")).toHaveText("4");
```