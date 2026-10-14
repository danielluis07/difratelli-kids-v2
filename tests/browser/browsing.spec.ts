import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { catalog, copy } from "../../lib/catalog";

const cards = (page: Page) => page.locator("main:visible .product-card");
async function openFilters(page: Page, label: string, isMobile: boolean) {
  const trigger = isMobile
    ? page.getByRole("button", { name: copy.browsing.openFilters })
    : page.locator(".desktop-filters:visible").getByRole("button", { name: new RegExp(`^${label}`) });
  await trigger.click();
  return isMobile ? page.getByRole("dialog", { name: copy.browsing.filters }) : page.locator('[data-slot="popover-content"]:visible');
}
async function closeFilters(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-slot="popover-content"]:visible, .filter-sheet:visible')).toHaveCount(0);
}

test("malformed links remain intact until canonical user changes; history and refresh restore controls", async ({ page, isMobile }) => {
  const incoming = "/produtos?categoria=polos&categoria=unknown&categoria=polos&ordem=bad&ordem=preco-asc&tamanho=02&tracking=abc";
  await page.goto(incoming);
  await expect(cards(page)).toHaveCount(2);
  let filters = await openFilters(page, copy.browsing.category, isMobile);
  await expect(filters.getByRole("checkbox", { name: "Polos", exact: true })).toBeChecked();
  await expect(page).toHaveURL(new RegExp(incoming.replace(/[?]/g, "\\?" ) + "$"));
  const shirt = filters.getByRole("checkbox", { name: "Camisetas", exact: true });
  await shirt.focus();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/\/produtos\?categoria=t-shirts&categoria=polos$/);
  await expect(cards(page)).toHaveCount(8);
  await closeFilters(page);
  await page.reload();
  await expect(cards(page)).toHaveCount(8);
  await page.goBack();
  await expect(cards(page)).toHaveCount(2);
  filters = await openFilters(page, copy.browsing.category, isMobile);
  await expect(filters.getByRole("checkbox", { name: "Camisetas", exact: true })).not.toBeChecked();
  await closeFilters(page);
  await page.goForward();
  await expect(cards(page)).toHaveCount(8);
});

test("every filter dimension commits OR selections and AND intersections across responsive controls", async ({ page, isMobile }) => {
  await page.goto("/produtos");
  const choices = [
    [copy.browsing.category, "Polos", "categoria=polos", 2],
    [copy.browsing.size, "4", "tamanho=4", 2],
    [copy.browsing.colorFamily, catalog.colorFamilies.find((family) => family.id === "cream")!.name, "familia=cream", 2],
    [copy.browsing.collection, catalog.collections[0].name, "colecao=collection-001", 1],
    [copy.browsing.audience, catalog.audiences.find((audience) => audience.id === "boys")!.name, "publico=boys", 1],
  ] as const;
  for (const [label, option, param, count] of choices) {
    const filters = await openFilters(page, label, isMobile);
    await filters.getByRole("group", { name: label, exact: true }).getByRole("checkbox", { name: option, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(param));
    await expect(cards(page)).toHaveCount(count);
    await closeFilters(page);
  }
  await expect(cards(page).first()).toHaveAttribute("data-product-id", "product-002");
  await page.getByRole("button", { name: copy.browsing.clearFilters, exact: true }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(cards(page)).toHaveCount(30);
});

test("keyboard sorting changes history and preserves curated price ties", async ({ page }) => {
  await page.goto("/produtos");
  const sort = page.getByRole("combobox", { name: copy.browsing.sort });
  await expect(sort).toBeEnabled();
  await sort.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("option", { name: copy.browsing.sortOptions.priceAscending, exact: true }).click();
  await expect(page).toHaveURL(/ordem=preco-asc$/);
  const ascending = catalog.products.toSorted((a, b) => a.priceCents - b.priceCents || a.curatedRank - b.curatedRank);
  await expect(cards(page).first()).toHaveAttribute("data-product-id", ascending[0].id);
  expect(await cards(page).evaluateAll((elements) => elements.map((element) => element.getAttribute("data-product-id")))).toEqual(ascending.map((product) => product.id));
  await sort.click();
  await page.getByRole("option", { name: copy.browsing.sortOptions.priceDescending, exact: true }).click();
  await expect(page).toHaveURL(/ordem=preco-desc$/);
  const descending = catalog.products.toSorted((a, b) => b.priceCents - a.priceCents || a.curatedRank - b.curatedRank);
  await expect(cards(page).first()).toHaveAttribute("data-product-id", descending[0].id);
  expect(await cards(page).evaluateAll((elements) => elements.map((element) => element.getAttribute("data-product-id")))).toEqual(descending.map((product) => product.id));
  await page.goBack();
  await expect(sort).toContainText(copy.browsing.sortOptions.priceAscending);
  await expect(cards(page).first()).toHaveAttribute("data-product-id", ascending[0].id);
});

test("zero-result reset retains audience, collection and search scopes; navigation starts fresh", async ({ page, isMobile }) => {
  const collection = catalog.collections[0];
  for (const [path, count] of [["/meninas", 18], [`/colecoes/${collection.slug}`, 10], ["/busca?q=descobertas", 10]] as const) {
    await page.goto(`${path}${path.includes("?") ? "&" : "?"}categoria=polos&familia=purple&publico=invalid&colecao=invalid`);
    await expect(page.locator("main:visible").getByRole("status")).toHaveText(copy.browsing.resultCount.zero);
    await expect(cards(page)).toHaveCount(0);
    await page.locator('[data-slot="empty"]:visible').getByRole("button", { name: copy.browsing.clearFilters }).click();
    await expect(page).toHaveURL(new RegExp(`${path.replace("?", "\\?")}$`));
    await expect(cards(page)).toHaveCount(count);
    const filters = await openFilters(page, copy.browsing.category, isMobile);
    if (isMobile) {
      await expect(filters.getByRole("group", { name: copy.browsing.audience, exact: true })).toHaveCount(path.startsWith("/busca") ? 1 : 0);
      await expect(filters.getByRole("group", { name: copy.browsing.collection, exact: true })).toHaveCount(path.startsWith("/colecoes") ? 0 : 1);
    } else {
      await expect(page.locator(".desktop-filters").getByRole("button", { name: copy.browsing.audience, exact: true })).toHaveCount(path.startsWith("/busca") ? 1 : 0);
      await expect(page.locator(".desktop-filters").getByRole("button", { name: copy.browsing.collection, exact: true })).toHaveCount(path.startsWith("/colecoes") ? 0 : 1);
    }
    await closeFilters(page);
  }
  await page.goto("/produtos?categoria=polos&ordem=preco-desc");
  await page.getByRole("contentinfo").getByRole("link", { name: copy.navigation.newArrivals, exact: true }).click();
  await expect(page).toHaveURL(/\/novidades$/);
  await expect(cards(page)).toHaveCount(8);
});

test("open filters have accessible labels and return keyboard focus", async ({ page, isMobile }) => {
  await page.goto("/produtos");
  await openFilters(page, copy.browsing.category, isMobile);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await closeFilters(page);
  await expect(isMobile ? page.getByRole("button", { name: copy.browsing.openFilters }) : page.locator(".desktop-filters").getByRole("button", { name: copy.browsing.category, exact: true })).toBeFocused();
});

test("tablet filters keep the same committed selections when switching to desktop", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/produtos?categoria=polos&tamanho=8&familia=cream&colecao=collection-001&publico=boys");
  const filters = await openFilters(page, copy.browsing.category, true);
  await expect(filters.getByRole("checkbox", { name: "Polos", exact: true })).toBeChecked();
  await expect(filters.getByRole("group", { name: copy.browsing.size, exact: true }).getByRole("checkbox", { name: "8", exact: true })).toBeChecked();
  await closeFilters(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("button", { name: "Categoria (1)", exact: true })).toBeVisible();
  await expect(cards(page)).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("public results remain readable while controls wait for hydration", async ({ page, isMobile }) => {
  let resumeHydration!: () => void;
  const hydrationGate = new Promise<void>((resolve) => { resumeHydration = resolve; });
  await page.route("**/_next/static/chunks/*.js", async (route) => { await hydrationGate; await route.continue(); });
  await page.goto("/produtos?categoria=polos", { waitUntil: "commit" });
  const sort = page.getByRole("combobox", { name: copy.browsing.sort });
  const filters = isMobile ? page.getByRole("button", { name: copy.browsing.openFilters }) : page.getByRole("button", { name: "Categoria (1)", exact: true });
  try {
    await expect(cards(page)).toHaveCount(2);
    await expect(sort).toBeDisabled();
    await expect(filters).toBeDisabled();
  } finally { resumeHydration(); }
  await expect(sort).toBeEnabled();
  await expect(filters).toBeEnabled();
  await sort.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: copy.browsing.sortOptions.priceAscending, exact: true })).toBeVisible();
});
