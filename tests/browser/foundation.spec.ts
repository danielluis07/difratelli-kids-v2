import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("serves approved Portuguese copy, metadata and an accessible public shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Um dia inteiro para brincar");
  await expect(page).toHaveTitle("Difratelli Kids | Roupas para brincar");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("serves approved identity and optimized catalog imagery from production", async ({ request }) => {
  const svg = await request.get("/identity/favicon-v1.svg");
  expect(svg.ok()).toBe(true);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  const image = await request.get("/_next/image?url=%2Fimages%2Fcatalog%2Fproduct-001-cream-leaf-teal-model-v2.webp&w=640&q=75");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/");
  expect((await image.body()).length).toBeGreaterThan(0);
});
