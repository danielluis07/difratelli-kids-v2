# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product.spec.ts >> product and dialog image failures retain labeled fallbacks
- Location: tests\browser\product.spec.ts:157:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.product-gallery:visible .detail-photo').getByRole('img')
Expected substring: "Não foi possível carregar esta imagem."
Received string:    ""
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('.product-gallery:visible .detail-photo').getByRole('img') with timeout 5000ms
  - waiting for locator('.product-gallery:visible .detail-photo').getByRole('img')
    10 × locator resolved to <img loading="eager" decoding="async" data-nimg="fill" src="/_next/image?url=%2Fimages%2Fcatalog%2Fproduct-007-leaf-model-v1.webp&w=3840&q=75" alt="Lia usando Short Passo Leve na cor Verde-folha, com a peça inteira visível sobre fundo branco." sizes="(max-width: 591px) calc(100vw - 32px), (max-width: 767px) 560px, (max-width: 1023px) calc((100vw - 96px) / 2), (max-width: 1279px) calc((100vw - 160px) / 2), 560px" srcset="/_next/image?url=%2Fimages%2Fcatalog%2Fproduct-007-leaf-model-v1.webp&w=32&q=75…/>
       - unexpected value ""

```

```yaml
- img "Lia usando Short Passo Leve na cor Verde-folha, com a peça inteira visível sobre fundo branco."
```

# Test source

```ts
  61  |   await page.goBack();
  62  |   await expect(page).toHaveURL(/\/produtos$/);
  63  | });
  64  | 
  65  | test("valid initial color and first invalid scalar fallback do not select a size", async ({ page }) => {
  66  |   for (const [query, color] of [[`?cor=${otherColor.id}`, otherColor], [`?cor=invalid&cor=${otherColor.id}`, defaultColor], ["", defaultColor]] as const) {
  67  |     await page.goto(path + query);
  68  |     await expect(page.locator(".detail-colors:visible [aria-current=true]")).toHaveText(color.name);
  69  |     await expect(page.locator(".size-options:visible [aria-pressed=true]")).toHaveCount(0);
  70  |     await expect(page.locator(".product-gallery:visible .detail-photo img")).toHaveAttribute("alt", photographs(product.id, color.id)[0].alt);
  71  |   }
  72  | });
  73  | 
  74  | test("gallery buttons wrap, keyboard works, and touch swipes ignore vertical gestures", async ({ page, context, isMobile, browserName }) => {
  75  |   await page.goto(path);
  76  |   const gallery = page.locator(".product-gallery:visible");
  77  |   const image = gallery.locator(".detail-photo img");
  78  |   const photos = photographs(product.id, defaultColor.id);
  79  |   const previous = gallery.getByRole("button", { name: copy.product.previousPhoto });
  80  |   await expect(previous).toBeEnabled();
  81  |   await previous.focus();
  82  |   await page.keyboard.press("Enter");
  83  |   await expect(image).toHaveAttribute("alt", photos[1].alt);
  84  |   await page.keyboard.press("Enter");
  85  |   await expect(image).toHaveAttribute("alt", photos[0].alt);
  86  |   const area = gallery.locator(".detail-photo");
  87  |   if (isMobile && browserName === "chromium") {
  88  |     await area.scrollIntoViewIfNeeded();
  89  |     const bounds = (await area.boundingBox())!;
  90  |     const client = await context.newCDPSession(page);
  91  |     const y = bounds.y + Math.min(bounds.height / 2, 150);
  92  |     await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds.x + bounds.width - 40, y }] });
  93  |     await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: bounds.x + 40, y }] });
  94  |     await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  95  |   } else {
  96  |     await swipe(area, -150);
  97  |   }
  98  |   await expect(image).toHaveAttribute("alt", photos[1].alt);
  99  |   await swipe(area, 20, 150);
  100 |   await expect(image).toHaveAttribute("alt", photos[1].alt);
  101 |   await swipe(area, 150);
  102 |   await expect(image).toHaveAttribute("alt", photos[0].alt);
  103 | });
  104 | 
  105 | test("enlargement and guidance trap keyboard focus, restore triggers and pass axe", async ({ page }) => {
  106 |   test.setTimeout(60_000);
  107 |   await page.goto(path);
  108 |   await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  109 |   for (const [label, title, close] of [[copy.product.enlarge, copy.product.enlargedTitle.replace("{product}", product.name), copy.product.closeEnlargement], [copy.product.sizeGuide, copy.sizeGuidance.title, copy.sizeGuidance.close]] as const) {
  110 |     const trigger = page.getByRole("button", { name: label, exact: true });
  111 |     await trigger.focus();
  112 |     await page.keyboard.press("Enter");
  113 |     const dialog = page.getByRole("dialog", { name: title, exact: true });
  114 |     await expect(dialog).toBeVisible();
  115 |     await expect(dialog).toHaveCSS("opacity", "1");
  116 |     if (label === copy.product.enlarge) {
  117 |       await expect(dialog.locator("img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[1].alt);
  118 |     } else {
  119 |       await expect(dialog.getByRole("row")).toHaveCount(5);
  120 |       for (const instruction of copy.sizeGuidance.instructions) await expect(dialog.getByText(instruction.body, { exact: true })).toBeVisible();
  121 |       await expect(dialog.getByText(copy.sizeGuidance.outsideChart)).toBeVisible();
  122 |     }
  123 |     for (let i = 0; i < 6; i++) {
  124 |       await page.keyboard.press(i % 2 ? "Shift+Tab" : "Tab");
  125 |       await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  126 |     }
  127 |     await expect(dialog).toHaveCSS("opacity", "1");
  128 |     expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  129 |     await page.keyboard.press("Escape");
  130 |     await expect(dialog).not.toBeVisible();
  131 |     await expect(trigger).toBeFocused();
  132 |     await trigger.click();
  133 |     await dialog.getByRole("button", { name: close, exact: true }).click();
  134 |     await expect(trigger).toBeFocused();
  135 |   }
  136 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  137 | });
  138 | 
  139 | test("details, two-piece set contents and curated related products remain readable", async ({ page }) => {
  140 |   const set = catalog.products.find((item) => item.includedPieces.length === 2)!;
  141 |   await page.goto(`/produto/${set.slug}`);
  142 |   await expect(page.locator(".set-contents:visible")).toHaveText(copy.product.setContents.replace("{pieceOne}", set.includedPieces[0]).replace("{pieceTwo}", set.includedPieces[1]));
  143 |   for (const text of [set.description, set.composition, set.fitGuidance]) await expect(page.getByText(text, { exact: true })).toBeVisible();
  144 |   const description = page.locator(".product-description:visible details").first();
  145 |   await expect(page.getByRole("button", { name: copy.product.sizeGuide, exact: true })).toBeEnabled();
  146 |   await description.locator("summary").focus();
  147 |   await page.keyboard.press("Enter");
  148 |   await expect(description.locator("p")).not.toBeVisible();
  149 |   await page.keyboard.press("Enter");
  150 |   await expect(description.locator("p")).toBeVisible();
  151 |   expect(await page.locator(".related-products .product-card").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-product-id")))).toEqual(relatedProducts(set).map((item) => item.id));
  152 |   await page.locator(".related-products .product-card").first().getByRole("link").click();
  153 |   await expect(page.getByRole("heading", { level: 1 })).toHaveText(relatedProducts(set)[0].name);
  154 |   await expect(page.locator(".size-options:visible [aria-pressed=true]")).toHaveCount(0);
  155 | });
  156 | 
  157 | test("product and dialog image failures retain labeled fallbacks", async ({ page }) => {
  158 |   await page.route("**/_next/image?*", (route) => route.abort());
  159 |   await page.goto(path);
  160 |   const photo = page.locator(".product-gallery:visible .detail-photo");
> 161 |   await expect(photo.getByRole("img")).toContainText(copy.common.imageFallback);
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  162 |   await page.getByRole("button", { name: copy.product.enlarge, exact: true }).click();
  163 |   await expect(page.getByRole("dialog").getByRole("img")).toContainText(copy.common.imageFallback);
  164 | });
  165 | 
  166 | test("approved responsive widths and zoom keep options and dialogs usable", async ({ page }, testInfo) => {
  167 |   test.setTimeout(60_000);
  168 |   for (const width of [320, 390, 768, 1024, 1440]) {
  169 |     await page.setViewportSize({ width, height: 900 });
  170 |     if (width === 320) await page.goto(path);
  171 |     await expect(page.getByRole("button", { name: copy.product.sizeGuide, exact: true })).toBeEnabled();
  172 |     const gallery = page.locator(".product-gallery:visible");
  173 |     const information = page.locator(".product-information:visible");
  174 |     await expect(information.getByRole("button", { name: "Tamanho 8", exact: true })).toBeVisible();
  175 |     const bounds = (await gallery.boundingBox())!;
  176 |     const infoBounds = (await information.boundingBox())!;
  177 |     expect(width < 768 ? infoBounds.y >= bounds.y + bounds.height : infoBounds.x > bounds.x).toBe(true);
  178 |     expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  179 |     if (testInfo.project.name === "chromium" && [390, 768, 1440].includes(width)) {
  180 |       await page.locator(".product-gallery:visible .detail-photo img").evaluate((image) => (image as HTMLImageElement).decode());
  181 |       await page.evaluate(() => scrollTo(0, 0));
  182 |       await page.screenshot({ path: testInfo.outputPath(`product-${width}.png`), fullPage: true });
  183 |     }
  184 |     await page.getByRole("button", { name: copy.product.sizeGuide, exact: true }).click();
  185 |     const dialog = page.getByRole("dialog", { name: copy.sizeGuidance.title, exact: true });
  186 |     await expect(dialog).toBeVisible();
  187 |     const dialogBounds = (await dialog.boundingBox())!;
  188 |     expect(dialogBounds.width).toBeLessThanOrEqual(width);
  189 |     if (testInfo.project.name === "chromium" && [390, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath(`guidance-${width}.png`) });
  190 |     await dialog.getByRole("button", { name: copy.sizeGuidance.close }).click();
  191 |     await expect(dialog).not.toBeVisible();
  192 |   }
  193 |   await page.emulateMedia({ reducedMotion: "reduce" });
  194 |   await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
  195 |   expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  196 | });
  197 | 
```