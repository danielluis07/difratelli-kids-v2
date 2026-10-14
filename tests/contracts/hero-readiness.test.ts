import { expect, it } from "vitest";
import { copyFile, mkdir, mkdtemp, readFile, unlink, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkHeroReadiness } from "../../lib/catalog/hero-readiness";

it("accepts the exact approved hero package", async () => {
  expect(await checkHeroReadiness()).toEqual({ valid: true, diagnostics: [] });
});

it("rejects pending hero acceptance, changed review evidence and changed crop bytes", async () => {
  const root = await mkdtemp(join(tmpdir(), "difratelli-hero-"));
  const prefix = "docs/content/hero-color-refresh";
  const decision = JSON.parse(await readFile(`${prefix}-approval.json`, "utf8"));
  const integrationDecision = JSON.parse(await readFile(`${prefix}-integration-approval.json`, "utf8"));
  const paths = [...new Set([`${prefix}-approval.json`, `${prefix}-approval-request.json`, `${prefix}-integration-approval.json`, ...decision.files.map((file: { path: string }) => file.path), ...integrationDecision.files.map((file: { path: string }) => file.path)])] as string[];
  try {
    for (const path of paths) { await mkdir(dirname(join(root, path)), { recursive: true }); await copyFile(path, join(root, path)); }
    const approvalPath = join(root, `${prefix}-approval.json`);
    await writeFile(approvalPath, JSON.stringify({ ...decision, status: "pending-human-review" }));
    expect((await checkHeroReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ field: "approval" }));
    await writeFile(approvalPath, JSON.stringify({ ...decision, approvalRequestSha256: "0".repeat(64) }));
    expect((await checkHeroReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ field: "approvalRequestSha256" }));
    await writeFile(approvalPath, JSON.stringify(decision));
    const integrationPath = join(root, `${prefix}-integration-approval.json`);
    await writeFile(integrationPath, JSON.stringify({ ...integrationDecision, status: "pending-human-review" }));
    expect((await checkHeroReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ field: "integrationApproval" }));
    await writeFile(integrationPath, JSON.stringify(integrationDecision));
    const manifest = JSON.parse(await readFile(join(root, `${prefix}-manifest.json`), "utf8"));
    const cropPath = manifest.assets[0].crops[0].webPath;
    const bytes = await readFile(join(root, cropPath));
    await writeFile(join(root, cropPath), Buffer.concat([bytes, Buffer.from("changed")]));
    expect((await checkHeroReadiness(root)).diagnostics).toContainEqual(expect.objectContaining({ record: cropPath, field: "sha256" }));
  } finally {
    for (const path of paths) await unlink(join(root, path));
    const directories = new Set<string>();
    for (const path of paths) { let dir = dirname(path); while (dir !== ".") { directories.add(dir); dir = dirname(dir); } }
    for (const dir of [...directories].sort((a, b) => b.length - a.length)) await rmdir(join(root, dir));
    await rmdir(root);
  }
});
