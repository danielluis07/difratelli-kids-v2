import { expect, test } from "@playwright/test";
import { catalog, copy } from "../../lib/catalog";
import { readFile } from "node:fs/promises";

const blockingDiagnostics = /instant-shell-url-data|blocking-prerender|Next\.js encountered URL data|hydration-mismatch|hydration failed|A tree hydrated/i;

test("public pages have no blocking URL-data diagnostics", async ({ page, context }) => {
  const diagnostics: string[] = [];
  // Keep cold image optimization out of this development-only diagnostic check.
  // CDP blocking preserves browser caching: Playwright routing disables caching,
  // which also bypasses Next's development prerender validation.
  const network = await context.newCDPSession(page);
  await network.send("Network.enable");
  await network.send("Network.setBlockedURLs", { urls: ["*/_next/image?*"] });
  page.on("console", (message) => {
    if (blockingDiagnostics.test(message.text())) diagnostics.push(message.text().split("\n")[0]);
  });
  const paths = [
    `/produto/${catalog.products[0].slug}`, `/colecoes/${catalog.collections[0].slug}`,
    "/", "/produtos", "/novidades", "/meninas", "/meninos", "/colecoes", "/sobre", "/busca", "/favoritos",
    ...catalog.products.map(({ slug }) => `/produto/${slug}`),
    ...catalog.collections.map(({ slug }) => `/colecoes/${slug}`),
  ];
  for (const path of new Set(paths)) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(diagnostics, `Development diagnostics on ${path}`).toEqual([]);
    const developmentLog = await readFile(".next/dev/logs/next-development.log", "utf8");
    expect(developmentLog, `Server development diagnostics on ${path}`).not.toMatch(blockingDiagnostics);
  }
  await page.goto("/produtos");
  const product = catalog.products.find((product) => product.colorways.length === 2)!;
  await page.locator(`main [data-product-id="${product.id}"]`).getByRole("link").click();
  await expect(page).toHaveURL(/\/produto\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name);
  const color = product.colorways.find((color) => color.id !== product.defaultColorwayId)!;
  await page.locator(".detail-colors:visible").getByRole("link", { name: color.name, exact: true }).click();
  await expect(page.locator(".product-information strong:visible")).toHaveText(color.name);
  await page.getByRole("contentinfo").getByRole("link", { name: copy.navigation.collections, exact: true }).click();
  await page.getByRole("main").getByRole("link", { name: catalog.collections[0].name, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(catalog.collections[0].name);
  await page.waitForLoadState("networkidle");
  expect(diagnostics, "Development diagnostics during storefront navigation").toEqual([]);
  expect(await readFile(".next/dev/logs/next-development.log", "utf8")).not.toMatch(blockingDiagnostics);
});
