import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { copy } from "../../lib/catalog";

const cards = (page: Page) => page.locator("main:visible .product-card");
async function openSearch(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: copy.navigation.openMenu }).click();
  await page.getByRole("button", { name: copy.navigation.search, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: copy.search.dialogTitle });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("searchbox", { name: copy.search.fieldLabel });
  await expect(input).toBeFocused();
  return { dialog, input };
}

test("header submission preserves spelling, matches every word and commits fresh URL history", async ({ page, isMobile }) => {
  await page.goto("/produtos?categoria=dresses&ordem=preco-desc");
  let search = await openSearch(page, isMobile);
  await expect(search.input).toHaveValue("");
  await search.input.fill("  CAMI  descobértas  ");
  await search.input.press("Enter");
  await expect(page).toHaveURL(/\/busca\?q=CAMI\+descob%C3%A9rtas$/);
  await expect(cards(page)).toHaveCount(3);
  await expect(page.locator("main:visible .search-query")).toHaveText("“CAMI descobértas”");
  await expect(page.getByRole("status")).toHaveText(copy.browsing.resultCount.many.replace("{count}", "3"));
  await page.reload();
  await expect(cards(page)).toHaveCount(3);
  search = await openSearch(page, isMobile);
  await expect(search.input).toHaveValue("CAMI descobértas");
  await search.input.fill("Imaginação em casa");
  await search.dialog.getByRole("button", { name: copy.search.submit, exact: true }).click();
  await expect(cards(page)).toHaveCount(10);
  await page.goBack();
  await expect(cards(page)).toHaveCount(3);
  await page.goForward();
  await expect(cards(page)).toHaveCount(10);
});

test("cancel discards drafts, returns focus and keeps the committed page", async ({ page, isMobile }) => {
  const path = "/busca?q=descobertas&categoria=polos&ordem=preco-desc";
  await page.goto(path);
  const { dialog, input } = await openSearch(page, isMobile);
  await expect(input).toHaveValue("descobertas");
  await expect(input).toHaveAttribute("autocomplete", "off");
  await input.fill("unsubmitted");
  await expect(dialog).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: copy.navigation.search, exact: true })).toBeFocused();
  await expect(page).toHaveURL(new RegExp(path.replace("?", "\\?") + "$"));
  await expect(cards(page)).toHaveCount(1);
  await page.getByRole("button", { name: copy.navigation.search, exact: true }).click();
  await expect(input).toHaveValue("descobertas");
  await dialog.getByRole("button", { name: copy.search.close }).click();
  if (isMobile) await page.keyboard.press("Escape");
  await page.getByRole("button", { name: copy.browsing.clearFilters, exact: true }).click();
  await expect(page).toHaveURL(/\/busca\?q=descobertas$/);
  await expect(cards(page)).toHaveCount(10);
  await page.getByRole("combobox", { name: copy.browsing.sort }).click();
  await page.getByRole("option", { name: copy.browsing.sortOptions.priceDescending, exact: true }).click();
  await expect(page).toHaveURL(/\/busca\?q=descobertas&ordem=preco-desc$/);
  const search = await openSearch(page, isMobile);
  await search.input.fill("descobertas");
  await search.input.press("Enter");
  await expect(page).toHaveURL(/\/busca\?q=descobertas$/);
  await page.locator("footer").getByRole("link", { name: copy.navigation.catalog, exact: true }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(cards(page)).toHaveCount(30);
  const fresh = await openSearch(page, isMobile);
  await expect(fresh.input).toHaveValue("");
});

test("blank and unmatched submissions provide approved recovery", async ({ page, isMobile }) => {
  await page.goto("/busca?q=descobertas&categoria=polos");
  let search = await openSearch(page, isMobile);
  await search.input.fill("   ");
  await search.input.press("Enter");
  await expect(page).toHaveURL(/\/busca$/);
  await expect(page.getByText(copy.search.blankHeading, { exact: true })).toBeVisible();
  await expect(page.getByText(copy.search.blankBody, { exact: true })).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  search = await openSearch(page, isMobile);
  await search.input.fill("cami inexistente");
  await search.dialog.getByRole("button", { name: copy.search.submit, exact: true }).click();
  await expect(page.getByText(copy.search.noResultsHeading.replace("{query}", "cami inexistente"), { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(copy.browsing.resultCount.zero);
  await expect(cards(page)).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('main:visible [data-slot="empty"]').getByRole("link", { name: copy.search.noResultsAction }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(cards(page)).toHaveCount(30);
});
