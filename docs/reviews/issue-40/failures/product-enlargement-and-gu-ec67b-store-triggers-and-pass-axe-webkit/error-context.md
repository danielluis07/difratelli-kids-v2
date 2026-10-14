# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product.spec.ts >> enlargement and guidance trap keyboard focus, restore triggers and pass axe
- Location: tests\browser\product.spec.ts:105:5

# Error details

```
Error: Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - complementary "Novidades da Difratelli" [ref=e2]:
    - button [aria-hidden] [ref=e3] [cursor=pointer]
    - paragraph [ref=e6]:
      - text: Cores que se encontram. Escolhas do seu jeito.
      - link "Detalhes" [ref=e7]:
        - /url: /colecoes/imaginacao-em-casa
    - button [aria-hidden] [ref=e8] [cursor=pointer]
    - button [aria-hidden] [ref=e11] [cursor=pointer]
  - banner [aria-hidden] [ref=e15]:
    - link [ref=e16]:
      - /url: "#main-content"
      - text: Pular para o conteúdo
    - generic [ref=e17]:
      - link [ref=e18]:
        - /url: /
      - navigation [ref=e20]:
        - button [ref=e21] [cursor=pointer]: Novidades
        - button [ref=e22] [cursor=pointer]: Meninas
        - button [ref=e23] [cursor=pointer]: Meninos
        - link [ref=e24]:
          - /url: /colecoes
          - text: Coleções
        - link [ref=e25]:
          - /url: /sobre
          - text: Sobre a Difratelli
      - generic [ref=e26]:
        - button [ref=e27] [cursor=pointer]
        - link [ref=e28]:
          - /url: /favoritos
          - generic [aria-hidden] [ref=e29]: "0"
        - button [ref=e30] [cursor=pointer]:
          - generic [aria-hidden] [ref=e31]: "0"
  - main [ref=e32]:
    - navigation [aria-hidden] [ref=e33]:
      - link [ref=e34]:
        - /url: /
        - text: Página inicial
      - generic [aria-hidden] [ref=e35]: /
      - link [ref=e36]:
        - /url: /produtos
        - text: Todas as roupas
    - generic [ref=e37]:
      - region "Fotos de Short Passo Leve" [ref=e38]:
        - group [aria-hidden] [ref=e41]:
          - button [ref=e42] [cursor=pointer]
          - button [pressed] [ref=e44] [cursor=pointer]
        - generic [aria-hidden] [ref=e46]:
          - button [ref=e47] [cursor=pointer]: Foto anterior
          - button [ref=e48] [cursor=pointer]: Próxima foto
          - button [ref=e49] [cursor=pointer]: Ampliar imagem
        - paragraph [ref=e50]: Foto 2 de 2
      - generic [ref=e51]:
        - heading [level=1] [aria-hidden] [ref=e52]: Short Passo Leve
        - paragraph [aria-hidden] [ref=e53]: R$ 89,00
        - paragraph [ref=e54]:
          - text: "Cor:"
          - strong [ref=e55]: Verde-folha
        - generic [aria-hidden] [ref=e56]:
          - link [ref=e57]:
            - /url: "?cor=leaf"
            - text: Verde-folha
          - link [ref=e59]:
            - /url: "?cor=cream"
            - text: Creme
        - region "Tamanho" [ref=e61]:
          - generic [aria-hidden] [ref=e62]:
            - heading [level=2] [ref=e63]: Tamanho
            - button [expanded] [ref=e64] [cursor=pointer]: Guia de tamanhos
          - group [aria-hidden] [ref=e65]:
            - button [ref=e66] [cursor=pointer]: "2"
            - button [ref=e67] [cursor=pointer]: "4"
            - button [ref=e68] [cursor=pointer]: "6"
            - button [ref=e69] [cursor=pointer]: "8"
          - paragraph [ref=e70]: Selecione um tamanho
        - generic [aria-hidden] [ref=e71]:
          - button [ref=e72] [cursor=pointer]: Adicionar à sacola
          - status [ref=e73]
        - button [aria-hidden] [ref=e74] [cursor=pointer]: Favoritos
        - generic [aria-hidden] [ref=e75]:
          - group [ref=e76]:
            - generic [ref=e77] [cursor=pointer]: Descrição
            - paragraph [ref=e78]: Short de sarja com cintura elástica, dois bolsos e cores que se misturam às estampas do quintal.
          - group [ref=e79]:
            - generic [ref=e80] [cursor=pointer]: Composição
            - paragraph [ref=e81]: 98% algodão, 2% elastano.
          - group [ref=e82]:
            - generic [ref=e83] [cursor=pointer]: Como veste
            - paragraph [ref=e84]: Cintura elástica e pernas soltas, com barra no meio da coxa.
    - region [ref=e85]:
      - heading [level=2] [aria-hidden] [ref=e86]: Para combinar
      - list [ref=e87]:
        - listitem [ref=e88]:
          - link [aria-hidden] [ref=e89]:
            - /url: /produto/camiseta-folhas-ao-vento?cor=cream-leaf-teal
            - heading [level=2] [ref=e93]: Camiseta Folhas ao Vento
            - paragraph [ref=e94]: R$ 59,00
          - button [aria-hidden] [ref=e95] [cursor=pointer]
          - group [aria-hidden] [ref=e96]:
            - button [pressed] [ref=e97] [cursor=pointer]
          - generic [ref=e99]: Creme, verde-folha, verde-petróleo
        - listitem [ref=e100]:
          - link [aria-hidden] [ref=e101]:
            - /url: /produto/polo-lisa-do-quintal?cor=cream
            - heading [level=2] [ref=e105]: Polo Lisa do Quintal
            - paragraph [ref=e106]: R$ 79,00
          - button [aria-hidden] [ref=e107] [cursor=pointer]
          - group [aria-hidden] [ref=e108]:
            - button [pressed] [ref=e109] [cursor=pointer]
          - generic [ref=e111]: Creme
        - listitem [ref=e112]:
          - link [aria-hidden] [ref=e113]:
            - /url: /produto/camiseta-pequenas-sementes?cor=cream-butter-leaf
            - heading [level=2] [ref=e117]: Camiseta Pequenas Sementes
            - paragraph [ref=e118]: R$ 59,00
          - button [aria-hidden] [ref=e119] [cursor=pointer]
          - group [aria-hidden] [ref=e120]:
            - button [pressed] [ref=e121] [cursor=pointer]
          - generic [ref=e123]: Creme, amarelo-manteiga, verde-folha
        - listitem [ref=e124]:
          - link [aria-hidden] [ref=e125]:
            - /url: /produto/blusa-jardim-miudo?cor=cream-leaf-teal
            - heading [level=2] [ref=e129]: Blusa Jardim Miúdo
            - paragraph [ref=e130]: R$ 69,00
          - button [aria-hidden] [ref=e131] [cursor=pointer]
          - group [aria-hidden] [ref=e132]:
            - button [pressed] [ref=e133] [cursor=pointer]
          - generic [ref=e135]: Creme, verde-folha, verde-petróleo
  - contentinfo [aria-hidden] [ref=e136]:
    - generic [ref=e137]:
      - generic [ref=e138]:
        - link [ref=e139]:
          - /url: /
        - paragraph [ref=e141]: Roupas para crianças de 2 a 8 anos, entre descobertas no quintal, brincadeiras na rua e histórias em casa.
        - link [ref=e142]:
          - /url: /sobre
          - text: Sobre a Difratelli
      - navigation [ref=e143]:
        - heading [level=2] [ref=e144]: Para brincar
        - link [ref=e145]:
          - /url: /produtos
          - text: Todas as roupas
        - link [ref=e146]:
          - /url: /novidades
          - text: Novidades
        - link [ref=e147]:
          - /url: /meninas
          - text: Meninas
        - link [ref=e148]:
          - /url: /meninos
          - text: Meninos
      - navigation [ref=e149]:
        - heading [level=2] [ref=e150]: Nossas coleções
        - link [ref=e151]:
          - /url: /colecoes
          - text: Coleções
        - link [ref=e152]:
          - /url: /colecoes/quintal-de-descobertas
          - text: Quintal de Descobertas
        - link [ref=e153]:
          - /url: /colecoes/brincadeira-de-rua
          - text: Brincadeira de Rua
        - link [ref=e154]:
          - /url: /colecoes/imaginacao-em-casa
          - text: Imaginação em Casa
  - status [aria-hidden] [ref=e155]
  - alert [ref=e156]
  - dialog [ref=e160]:
    - generic [ref=e161]:
      - heading "Guia de tamanhos" [level=2] [ref=e162]
      - paragraph [ref=e163]: Compare as medidas do corpo da criança com a tabela. As medidas estão em centímetros e servem como referência para escolher o tamanho.
    - button "Fechar guia de tamanhos" [ref=e164] [cursor=pointer]
    - region "Guia de tamanhos" [active] [ref=e165]:
      - table [ref=e166]:
        - caption [ref=e167]: Compare as medidas do corpo da criança com a tabela. As medidas estão em centímetros e servem como referência para escolher o tamanho.
        - rowgroup [ref=e168]:
          - row [ref=e169]:
            - columnheader "Tamanho" [ref=e170]
            - columnheader "Altura" [ref=e171]
            - columnheader "Tórax" [ref=e172]
            - columnheader "Cintura" [ref=e173]
            - columnheader "Quadril" [ref=e174]
        - rowgroup [ref=e175]:
          - row [ref=e176]:
            - rowheader "2" [ref=e177]
            - cell "86–95" [ref=e178]
            - cell "50–54" [ref=e179]
            - cell "48–52" [ref=e180]
            - cell "52–56" [ref=e181]
          - row [ref=e182]:
            - rowheader "4" [ref=e183]
            - cell "96–107" [ref=e184]
            - cell "55–59" [ref=e185]
            - cell "53–56" [ref=e186]
            - cell "57–62" [ref=e187]
          - row [ref=e188]:
            - rowheader "6" [ref=e189]
            - cell "108–119" [ref=e190]
            - cell "60–64" [ref=e191]
            - cell "57–60" [ref=e192]
            - cell "63–68" [ref=e193]
          - row [ref=e194]:
            - rowheader "8" [ref=e195]
            - cell "120–131" [ref=e196]
            - cell "65–69" [ref=e197]
            - cell "61–64" [ref=e198]
            - cell "69–74" [ref=e199]
    - heading "Como medir" [level=3] [ref=e200]
    - generic [ref=e201]:
      - generic [ref=e202]:
        - term [ref=e203]: Altura
        - definition [ref=e204]: Sem sapatos, meça do chão até o topo da cabeça, com a criança em pé.
      - generic [ref=e205]:
        - term [ref=e206]: Tórax
        - definition [ref=e207]: Passe a fita ao redor da parte mais larga do peito, sem apertar.
      - generic [ref=e208]:
        - term [ref=e209]: Cintura
        - definition [ref=e210]: Meça ao redor da cintura natural, com a criança relaxada e sem prender a respiração.
      - generic [ref=e211]:
        - term [ref=e212]: Quadril
        - definition [ref=e213]: Passe a fita ao redor da parte mais larga do quadril, com os pés juntos.
    - paragraph [ref=e214]: Se as medidas ficarem entre dois tamanhos ou indicarem tamanhos diferentes, escolha o maior. Veja também a indicação de como cada peça veste.
    - paragraph [ref=e215]: Se alguma medida passar do intervalo do tamanho 8, a tabela não indica um tamanho adequado para essa medida.
```

# Test source

```ts
  25  |   await page.locator(`[data-product-id="${product.id}"]`).getByRole("link").click();
  26  |   const sizes = page.locator(".size-options:visible");
  27  |   await expect(sizes.locator('[aria-pressed="true"]')).toHaveCount(0);
  28  |   const size = sizes.getByRole("button", { name: "Tamanho 4", exact: true });
  29  |   await size.focus();
  30  |   await page.keyboard.press("Enter");
  31  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  32  |   await size.click();
  33  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  34  |   await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  35  |   const historyLength = await page.evaluate(() => history.length);
  36  |   await page.locator(".detail-colors:visible").getByRole("link", { name: otherColor.name, exact: true }).click();
  37  |   await expect(page).toHaveURL(`${page.url().split("?")[0]}?cor=${otherColor.id}`);
  38  |   expect(await page.evaluate(() => history.length)).toBe(historyLength);
  39  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  40  |   const gallery = page.locator(".product-gallery:visible");
  41  |   await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  42  |   await expect(gallery.locator(".gallery-position")).toHaveText("Foto 1 de 2");
  43  |   await page.getByRole("button", { name: copy.product.nextPhoto, exact: true }).click();
  44  |   await page.evaluate((color) => history.pushState(null, "", `?cor=${color}`), defaultColor.id);
  45  |   await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[0].alt);
  46  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  47  |   await page.goBack();
  48  |   await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, otherColor.id)[0].alt);
  49  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  50  |   await page.goForward();
  51  |   await expect(gallery.locator(".detail-photo img")).toHaveAttribute("alt", photographs(product.id, defaultColor.id)[0].alt);
  52  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  53  |   await page.evaluate(() => history.replaceState(null, "", "?cor=unknown"));
  54  |   await expect(page.locator(".detail-colors:visible [aria-current=true]")).toHaveText(defaultColor.name);
  55  |   await expect(size).toHaveAttribute("aria-pressed", "true");
  56  |   await page.reload();
  57  |   await expect(sizes.locator('[aria-pressed="true"]')).toHaveCount(0);
  58  |   await expect(page).toHaveURL(/cor=unknown$/);
  59  |   await page.goBack();
  60  |   await expect(page).toHaveURL(new RegExp(`cor=${otherColor.id}$`));
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
> 125 |       await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      |                                                                                                       ^ Error: Timeout 5000ms exceeded while waiting on the predicate
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
  161 |   await expect(photo.getByRole("img")).toContainText(copy.common.imageFallback);
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