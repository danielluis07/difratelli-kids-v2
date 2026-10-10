import { expect, it } from "vitest";
import { copyFile, mkdir, mkdtemp, readFile, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkContentReadiness } from "../../lib/catalog/readiness";

it("verifies the complete package against actual approved bytes and raster metadata", async () => {
  expect(await checkContentReadiness()).toEqual({ valid: true, diagnostics: [] });
});

it("blocks readiness with record/field diagnostics for a changed catalog and missing assets", async () => {
  // This isolated fixture deliberately contains no public/original assets.
  // Approval files and source records are small copies; approved files are never edited.
  const root = await mkdtemp(join(tmpdir(), "difratelli-content-"));
  const dir = join(root, "docs", "content");
  await mkdir(dir, { recursive: true });
  const names = ["package-manifest.json", "package-approval.json", "package-review.html", "package-approval-request.json",
    "catalog-proposal.json", "copy-proposal.json", "cast-manifest.json", "quintal-manifest.json", "brincadeira-manifest.json", "imaginacao-manifest.json", "editorial-manifest.json", "identity-manifest.json"];
  try {
    for (const name of names) await copyFile(join("docs", "content", name), join(dir, name));
    const catalog = JSON.parse(await readFile(join(dir, "catalog-proposal.json"), "utf8"));
    catalog.products[0].priceCents = -1;
    await writeFile(join(dir, "catalog-proposal.json"), JSON.stringify(catalog));
    const result = await checkContentReadiness(root);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ record: "product-001", field: "priceCents" }));
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ record: "public/images/catalog/product-001-cream-leaf-teal-model-v2.webp", field: "path" }));
    const approval = JSON.parse(await readFile(join(dir, "package-approval.json"), "utf8"));
    approval.implementationAllowed = false;
    await writeFile(join(dir, "package-approval.json"), JSON.stringify(approval));
    expect((await checkContentReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: "package", field: "approval" }));
  } finally {
    // Nonrecursive cleanup only touches the known fixture files.
    for (const name of names) await unlink(join(dir, name)).catch(() => {});
    await rmdir(dir);
    await rmdir(join(root, "docs"));
    await rmdir(root);
  }
});
