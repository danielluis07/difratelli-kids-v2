import { expect, it } from "vitest";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkHomepageUnsplashReadiness } from "../../lib/catalog/homepage-unsplash-readiness";

it("accepts the reviewed homepage photographs and retained original banners", async () => {
  expect(await checkHomepageUnsplashReadiness()).toEqual({ valid: true, diagnostics: [] });
});

it("blocks unaccepted imagery, changed mappings and changed export bytes", async () => {
  const root = await mkdtemp(join(tmpdir(), "difratelli-unsplash-"));
  const approvalPath = "docs/content/homepage-unsplash-approval.json";
  const manifestPath = "docs/content/homepage-unsplash-manifest.json";
  const approvalBytes = await readFile(approvalPath);
  const manifestBytes = await readFile(manifestPath);
  const approval = JSON.parse(approvalBytes.toString());
  const manifest = JSON.parse(manifestBytes.toString());
  const paths = [...new Set([approvalPath, "docs/content/homepage-manifest.json", ...approval.files.map((file: { path: string }) => file.path)])] as string[];
  try {
    for (const path of paths) { await mkdir(dirname(join(root, path)), { recursive: true }); await copyFile(path, join(root, path)); }
    await writeFile(join(root, approvalPath), JSON.stringify({ ...approval, status: "pending-user-review" }));
    expect((await checkHomepageUnsplashReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ field: "approval" }));
    await writeFile(join(root, approvalPath), approvalBytes);
    manifest.assets[0].slotIds.pop();
    await writeFile(join(root, manifestPath), JSON.stringify(manifest));
    const changedMapping = await checkHomepageUnsplashReadiness(root);
    expect(changedMapping.diagnostics).toContainEqual(expect.objectContaining({ field: "manifestSha256" }));
    expect(changedMapping.diagnostics).toContainEqual(expect.objectContaining({ field: "slots" }));
    await writeFile(join(root, manifestPath), manifestBytes);
    const cropPath = manifest.assets[0].crops[0].webPath;
    const bytes = await readFile(join(root, cropPath));
    await writeFile(join(root, cropPath), Buffer.concat([bytes, Buffer.from("changed")]));
    expect((await checkHomepageUnsplashReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: cropPath, field: "sha256" }));
  } finally {
    // The only recursive cleanup is the exact temporary directory created above.
    await rm(root, { recursive: true, force: true });
  }
});
