import { expect, it } from "vitest";
import { copyFile, mkdir, mkdtemp, readFile, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkHomepageReadiness } from "../../lib/catalog/homepage-readiness";

it("accepts the exact approved homepage files while keeping the original review immutable", async () => {
  expect(await checkHomepageReadiness()).toEqual({ valid: true, diagnostics: [] });
});

it("rejects pending and mismatched approval evidence before storefront integration", async () => {
  const root = await mkdtemp(join(tmpdir(), "difratelli-homepage-"));
  const dir = join(root, "docs", "content");
  const names = ["homepage-manifest.json", "homepage-approval.json", "homepage-approval-request.json", "homepage-image-refresh-manifest.json", "homepage-image-refresh-approval.json", "homepage-image-refresh-approval-request.json"];
  await mkdir(dir, { recursive: true });
  try {
    for (const name of names) await copyFile(join("docs", "content", name), join(dir, name));
    const decision = JSON.parse(await readFile(join(dir, "homepage-approval.json"), "utf8"));
    await writeFile(join(dir, "homepage-approval.json"), JSON.stringify({ ...decision, status: "pending-human-review" }));
    expect((await checkHomepageReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: "homepage", field: "approval" }));
    await writeFile(join(dir, "homepage-approval.json"), JSON.stringify({ ...decision, revision: "another-review", approvalRequestSha256: "0".repeat(64) }));
    const result = await checkHomepageReadiness(root);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ record: "homepage", field: "revision" }));
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ record: "homepage", field: "approvalRequestSha256" }));
    await writeFile(join(dir, "homepage-approval.json"), JSON.stringify(decision));
    const refreshDecision = JSON.parse(await readFile(join(dir, "homepage-image-refresh-approval.json"), "utf8"));
    await writeFile(join(dir, "homepage-image-refresh-approval.json"), JSON.stringify({ ...refreshDecision, status: "pending-human-review" }));
    expect((await checkHomepageReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: "homepage-image-refresh", field: "approval" }));
    await writeFile(join(dir, "homepage-image-refresh-approval.json"), JSON.stringify({ ...refreshDecision, approvalRequestSha256: "0".repeat(64) }));
    expect((await checkHomepageReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: "homepage-image-refresh", field: "approvalRequestSha256" }));
  } finally {
    for (const name of names) await unlink(join(dir, name));
    await rmdir(dir); await rmdir(join(root, "docs")); await rmdir(root);
  }
});
