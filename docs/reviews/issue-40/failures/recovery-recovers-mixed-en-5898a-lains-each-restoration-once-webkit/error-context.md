# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recovery.spec.ts >> recovers mixed entries, deduplicates, corrects quantities/prices and explains each restoration once
- Location: tests\browser\recovery.spec.ts:42:5

# Error details

```
Error: Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - complementary "Novidades da Difratelli" [ref=e2]:
    - button "Mensagem anterior" [ref=e3] [cursor=pointer]
    - paragraph [ref=e6]:
      - text: Novas combinações para os dias de quintal, rua e casa.
      - link "Detalhes" [ref=e7]:
        - /url: /novidades
    - button "Próxima mensagem" [ref=e8] [cursor=pointer]
    - button "Pausar mensagens" [ref=e11] [cursor=pointer]
  - banner [ref=e15]:
    - link "Pular para o conteúdo" [ref=e16]:
      - /url: "#main-content"
    - generic [ref=e17]:
      - link "Difratelli Kids — Página inicial" [ref=e18]:
        - /url: /
        - img "Difratelli Kids" [ref=e19]
      - navigation "Menu" [ref=e20]:
        - button "Novidades" [ref=e21] [cursor=pointer]
        - button "Meninas" [ref=e22] [cursor=pointer]
        - button "Meninos" [ref=e23] [cursor=pointer]
        - link "Coleções" [ref=e24]:
          - /url: /colecoes
        - link "Sobre a Difratelli" [ref=e25]:
          - /url: /sobre
      - generic [ref=e26]:
        - button "Buscar" [ref=e27] [cursor=pointer]
        - link "Favoritos, 1 produto salvo" [ref=e28]:
          - /url: /favoritos
          - generic [aria-hidden] [ref=e29]: "1"
        - button "Abrir sacola — Sacola, 11 peças" [ref=e30] [cursor=pointer]:
          - generic [aria-hidden] [ref=e31]: "11"
  - main [ref=e32]:
    - generic [ref=e33]:
      - heading "Favoritos" [level=1] [ref=e34]
      - paragraph [ref=e35]: Suas peças salvas, reunidas aqui.
    - generic "Favoritos" [ref=e36]:
      - list [ref=e37]:
        - listitem [ref=e38]:
          - link [ref=e39]:
            - /url: /produto/camiseta-folhas-ao-vento?cor=cream-leaf-teal
            - img "Davi usando Camiseta Folhas ao Vento na cor Creme, verde-folha, verde-petróleo, com a peça inteira visível sobre fundo branco." [ref=e41]
            - heading "Camiseta Folhas ao Vento" [level=2] [ref=e43]
            - paragraph [ref=e44]: R$ 59,00
          - button "Remover Camiseta Folhas ao Vento dos favoritos" [pressed] [ref=e45] [cursor=pointer]
          - 'group "Cor: Camiseta Folhas ao Vento" [ref=e46]':
            - button "Cor Creme, verde-folha, verde-petróleo" [pressed] [ref=e47] [cursor=pointer]
          - generic [ref=e49]: Creme, verde-folha, verde-petróleo
  - contentinfo [ref=e50]:
    - generic [ref=e51]:
      - generic [ref=e52]:
        - link "Página inicial" [ref=e53]:
          - /url: /
          - img "Difratelli Kids" [ref=e54]
        - paragraph [ref=e55]: Roupas para crianças de 2 a 8 anos, entre descobertas no quintal, brincadeiras na rua e histórias em casa.
        - link "Sobre a Difratelli" [ref=e56]:
          - /url: /sobre
      - navigation "Para brincar" [ref=e57]:
        - heading "Para brincar" [level=2] [ref=e58]
        - link "Todas as roupas" [ref=e59]:
          - /url: /produtos
        - link "Novidades" [ref=e60]:
          - /url: /novidades
        - link "Meninas" [ref=e61]:
          - /url: /meninas
        - link "Meninos" [ref=e62]:
          - /url: /meninos
      - navigation "Nossas coleções" [ref=e63]:
        - heading "Nossas coleções" [level=2] [ref=e64]
        - link "Coleções" [ref=e65]:
          - /url: /colecoes
        - link "Quintal de Descobertas" [ref=e66]:
          - /url: /colecoes/quintal-de-descobertas
        - link "Brincadeira de Rua" [ref=e67]:
          - /url: /colecoes/brincadeira-de-rua
        - link "Imaginação em Casa" [ref=e68]:
          - /url: /colecoes/imaginacao-em-casa
  - complementary "Sua sacola · Favoritos":
    - generic:
      - generic [ref=e69]:
        - status [ref=e70]: Algumas escolhas não estão mais disponíveis e foram removidas. Reunimos as escolhas repetidas da mesma peça, cor e tamanho. Ajustamos as quantidades para manter o limite de 10 unidades por escolha. Os preços da sacola foram atualizados para os valores atuais.
        - button "Fechar aviso — Sua sacola" [ref=e71] [cursor=pointer]
      - generic:
        - status
    - generic:
      - generic [ref=e72]:
        - status [ref=e73]: Algumas peças salvas não estão mais disponíveis e foram removidas dos favoritos. Organizamos seus favoritos para mostrar cada peça uma vez.
        - button "Fechar aviso — Favoritos" [ref=e74] [cursor=pointer]
      - generic:
        - status
  - status [ref=e75]
  - alert [ref=e76]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { catalog, copy, formatMoney } from "../../lib/catalog";
  4   | 
  5   | const product = catalog.products[0];
  6   | const selection = { productId: product.id, colorwayId: product.defaultColorwayId, size: 4 };
  7   | const line = { ...selection, quantity: 2, lastSeenUnitPriceCents: product.priceCents };
  8   | const cartSaved = JSON.stringify({ version: 1, lines: [line] });
  9   | const favoritesSaved = JSON.stringify({ version: 1, productIds: [product.id] });
  10  | const path = `/produto/${product.slug}`;
  11  | const cartNotice = (page: Page) => page.locator('.storage-feedback[data-store="cart"]');
  12  | const favoritesNotice = (page: Page) => page.locator('.storage-feedback[data-store="favorites"]');
  13  | 
  14  | async function seed(page: Page, cart = cartSaved, favorites = favoritesSaved, failure?: { operation: "read" | "write"; key: string }) {
  15  |   await page.addInitScript(({ cart, favorites, failure }) => {
  16  |     const get = Storage.prototype.getItem;
  17  |     const set = Storage.prototype.setItem;
  18  |     if (get.call(localStorage, "difratelli.cart") === null) set.call(localStorage, "difratelli.cart", cart);
  19  |     if (get.call(localStorage, "difratelli.favorites") === null) set.call(localStorage, "difratelli.favorites", favorites);
  20  |     Storage.prototype.getItem = function(key) {
  21  |       if (this === localStorage && failure?.operation === "read" && key === failure.key) throw new DOMException("Blocked", "SecurityError");
  22  |       return get.call(this, key);
  23  |     };
  24  |     Storage.prototype.setItem = function(key, value) {
  25  |       if (this === localStorage && failure?.operation === "write" && key === failure.key) throw new DOMException("Full", "QuotaExceededError");
  26  |       return set.call(this, key, value);
  27  |     };
  28  |     // Inspect saved values even when the application-facing read is blocked.
  29  |     Object.assign(window, { readSaved: (key: string) => get.call(localStorage, key) });
  30  |   }, { cart, favorites, failure });
  31  | }
  32  | 
  33  | async function saved(page: Page, key: string) {
  34  |   return page.evaluate(key => (window as unknown as { readSaved(key: string): string | null }).readSaved(key), key);
  35  | }
  36  | 
  37  | async function add(page: Page) {
  38  |   await page.getByRole("button", { name: "Tamanho 4", exact: true }).click();
  39  |   await page.getByRole("button", { name: copy.product.addToCart, exact: true }).click();
  40  | }
  41  | 
  42  | test("recovers mixed entries, deduplicates, corrects quantities/prices and explains each restoration once", async ({ page }, testInfo) => {
  43  |   const cart = JSON.stringify({ version: 1, lines: [
  44  |     line, { ...line, quantity: 12, lastSeenUnitPriceCents: 1 }, { ...line, size: 6, quantity: 1 },
  45  |     { ...line, productId: "obsolete" }, { ...line, colorwayId: "obsolete" }, { ...line, size: 3 },
  46  |     ...[0, -1, 2.5, "2", null].map(quantity => ({ ...line, quantity })), null,
  47  |   ] });
  48  |   const favorites = JSON.stringify({ version: 1, productIds: [product.id, null, "obsolete", product.id] });
  49  |   await seed(page, cart, favorites);
  50  |   await page.goto("/favoritos");
  51  |   await expect(page.locator(".favorites-content .product-card")).toHaveCount(1);
  52  |   await expect(page.locator(".cart-count")).toHaveText("11");
  53  |   await expect(cartNotice(page)).toContainText(copy.recovery.cart.removed);
  54  |   await expect(cartNotice(page)).toContainText(copy.recovery.cart.duplicates);
  55  |   await expect(cartNotice(page)).toContainText(copy.recovery.cart.quantities);
  56  |   await expect(cartNotice(page)).toContainText(copy.recovery.cart.prices);
  57  |   await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites.removed);
  58  |   await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites.deduplicated);
  59  |   expect(await saved(page, "difratelli.cart")).toBe(cart);
  60  |   expect(await saved(page, "difratelli.favorites")).toBe(favorites);
> 61  |   await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      |                                                                                                    ^ Error: Timeout 5000ms exceeded while waiting on the predicate
  62  |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  63  |   if (testInfo.project.name === "chromium" || testInfo.project.name === "mobile-chromium") {
  64  |     await page.screenshot({ path: `docs/reviews/issue-39/recovery-${testInfo.project.name}.png`, fullPage: true });
  65  |   }
  66  |   await cartNotice(page).getByRole("button").click();
  67  |   await favoritesNotice(page).getByRole("button").click();
  68  |   await page.getByRole("button", { name: /Abrir sacola/ }).click();
  69  |   const sheet = page.getByRole("dialog", { name: copy.cart.title });
  70  |   await expect(sheet.locator(".cart-line")).toHaveCount(2);
  71  |   await expect(sheet.locator(".cart-subtotal")).toContainText(formatMoney(11 * product.priceCents));
  72  |   await sheet.getByRole("button", { name: copy.cart.decrease.replace("{product}", product.name) }).first().click();
  73  |   await page.keyboard.press("Escape");
  74  |   await page.locator(".favorites-content .product-link").click();
  75  |   await expect(page).toHaveURL(new RegExp(product.slug), { timeout: 15000 });
  76  |   await add(page);
  77  |   await expect(cartNotice(page).getByRole("button")).toHaveCount(0);
  78  |   await expect(favoritesNotice(page).getByRole("button")).toHaveCount(0);
  79  |   const next = JSON.parse((await saved(page, "difratelli.cart"))!);
  80  |   expect(next.lines).toHaveLength(2);
  81  |   expect(next.lines[0].quantity).toBe(10);
  82  |   expect(next.lines[0].lastSeenUnitPriceCents).toBe(product.priceCents);
  83  |   expect(Object.keys(next)).toEqual(["version", "lines"]);
  84  | });
  85  | 
  86  | for (const [cart, favorites, warning] of [
  87  |   ["{", "{", "invalidStorage"],
  88  |   [JSON.stringify({ version: 1, lines: {} }), JSON.stringify({ version: 1, productIds: null }), "invalidStorage"],
  89  |   [JSON.stringify({ version: 2, lines: [line] }), JSON.stringify({ version: 2, productIds: [product.id] }), "unsupportedStorage"],
  90  | ] as const) {
  91  |   test(`preserves ${warning} envelopes (${cart}) and permits temporary shopping`, async ({ page }) => {
  92  |     await seed(page, cart, favorites);
  93  |     await page.goto(path);
  94  |     await expect(cartNotice(page)).toContainText(copy.recovery.cart[warning]);
  95  |     await expect(favoritesNotice(page)).toContainText(copy.recovery.favorites[warning]);
  96  |     await cartNotice(page).getByRole("button").click();
  97  |     await favoritesNotice(page).getByRole("button").click();
  98  |     await add(page);
  99  |     await expect(page.locator(".cart-count")).toHaveText("1");
  100 |     await page.locator(".detail-favorite:visible").click();
  101 |     await expect(page.locator(".favorites-count").first()).toHaveText("1");
  102 |     await add(page);
  103 |     await expect(page.locator(".cart-count")).toHaveText("2");
  104 |     expect(await saved(page, "difratelli.cart")).toBe(cart);
  105 |     expect(await saved(page, "difratelli.favorites")).toBe(favorites);
  106 |     await expect(page.locator(".storage-notice[data-visible=true]")).toHaveCount(0);
  107 |   });
  108 | }
  109 | 
  110 | for (const key of ["difratelli.cart", "difratelli.favorites"]) {
  111 |   for (const operation of ["read", "write"] as const) {
  112 |     test(`${key} ${operation} failure leaves the other store persistent and warns once`, async ({ page }) => {
  113 |       await seed(page, cartSaved, favoritesSaved, { operation, key });
  114 |       await page.goto(path);
  115 |       const notice = key === "difratelli.cart" ? cartNotice(page) : favoritesNotice(page);
  116 |       const healthyNotice = key === "difratelli.cart" ? favoritesNotice(page) : cartNotice(page);
  117 |       const messages = key === "difratelli.cart" ? copy.recovery.cart : copy.recovery.favorites;
  118 |       await expect(page.getByRole("button", { name: copy.product.addToCart, exact: true })).toBeEnabled({ timeout: 15000 });
  119 |       if (operation === "read") await expect(notice).toContainText(messages.readFailure);
  120 |       await add(page);
  121 |       await page.locator(".detail-favorite:visible").click();
  122 |       if (operation === "write") await expect(notice).toContainText(messages.writeFailure);
  123 |       await expect(healthyNotice.getByRole("button")).toHaveCount(0);
  124 |       await notice.getByRole("button").click();
  125 |       await add(page);
  126 |       await page.locator(".detail-favorite:visible").click();
  127 |       await expect(notice.getByRole("button")).toHaveCount(0);
  128 |       await expect(page.locator(".cart-count")).toHaveText(operation === "read" && key === "difratelli.cart" ? "2" : "4");
  129 |       await expect(page.locator(".favorites-count").first()).toHaveText(operation === "read" && key === "difratelli.favorites" ? "0" : "1");
  130 |       expect(await saved(page, key)).toBe(key === "difratelli.cart" ? cartSaved : favoritesSaved);
  131 |       if (key === "difratelli.cart") {
  132 |         expect(JSON.parse((await saved(page, "difratelli.favorites"))!).productIds).toEqual([product.id]);
  133 |       } else {
  134 |         expect(JSON.parse((await saved(page, "difratelli.cart"))!).lines[0].quantity).toBe(4);
  135 |       }
  136 |       if (operation === "write") {
  137 |         await page.reload();
  138 |         await expect(page.locator(".cart-count")).toHaveText(key === "difratelli.cart" ? "2" : "4");
  139 |         await expect(page.locator(".favorites-count").first()).toHaveText("1");
  140 |       }
  141 |     });
  142 |   }
  143 | }
  144 | 
  145 | test("delayed hydration keeps public content visible, controls pending, and saved data untouched", async ({ page }) => {
  146 |   await seed(page);
  147 |   let release!: () => void;
  148 |   const gate = new Promise<void>(resolve => { release = resolve; });
  149 |   await page.route("**/*.js", async route => { await gate; await route.continue(); });
  150 |   try {
  151 |     await page.goto("/favoritos", { waitUntil: "commit" });
  152 |     await expect(page.getByRole("heading", { name: copy.editorial.pages.favorites.heading })).toBeVisible();
  153 |     await expect(page.locator(".favorites-content")).toHaveText(copy.favorites.pending);
  154 |     await expect(page.getByText(copy.favorites.emptyHeading)).toHaveCount(0);
  155 |     await expect(page.locator(".favorites-count").first()).toHaveText("…");
  156 |     await expect(page.locator(".cart-count")).toHaveText("…");
  157 |     expect(await saved(page, "difratelli.cart")).toBe(cartSaved);
  158 |     expect(await saved(page, "difratelli.favorites")).toBe(favoritesSaved);
  159 |     await page.evaluate((empty) => {
  160 |       Object.assign(window, { sawFalseEmpty: false });
  161 |       new MutationObserver(() => {
```