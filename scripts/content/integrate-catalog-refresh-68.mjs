import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { revision, reviewRoot } from "./catalog-refresh-68-spec.mjs";

const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const json = async path => JSON.parse(await readFile(path, "utf8"));
const save = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
const archive = `${reviewRoot}/before-integration`;
const approvalPath = `${reviewRoot}/approval.json`;
const packageRevision = "issue-68-package-v1";
const changedPaths = ["docs/content/brincadeira-manifest.json", "docs/content/brincadeira-generation.json",
  "docs/content/brincadeira-contact-sheet.webp", "docs/content/brincadeira-photography-review.md",
  "docs/content/package-manifest.json", "docs/content/package-approval.json"];
// These two working files already differed from HEAD before photography work.
// They are not part of this change or of the catalog preservation contract.
const preExistingWorktreePaths = ["AGENTS.md", "next.config.ts"];
const repositoryBaseline = await json(`${reviewRoot}/repository-baseline.json`);
const repositoryHashes = new Map(repositoryBaseline.files.map(file => [file.path, file.sha256]));
async function verifyBaselineFile(file) {
  if (preExistingWorktreePaths.includes(file.path)) return;
  const bytes = await readFile(file.path);
  if (digest(bytes) === file.sha256 || digest(bytes) === repositoryHashes.get(file.path)) return;
  // Git normalizes ordinary source text across Windows/Unix checkouts. Approved
  // content and image bytes remain exact; .gitattributes preserves those files.
  if (!["docs/content/", "assets/", "public/"].some(prefix => file.path.startsWith(prefix)) &&
      (/\.(?:[cm]?[jt]sx?|py|md|css|ya?ml|json|txt)$/.test(file.path) || /(?:^|\/)\.(?:gitignore|prettierignore|npmrc|editorconfig)$/.test(file.path) || file.path === "bun.lock")) {
    const lf = bytes.toString("utf8").replace(/\r\n/g, "\n");
    if (digest(lf) === file.sha256 || digest(lf.replace(/\n/g, "\r\n")) === file.sha256) return;
  }
  assert.fail(`Out-of-scope change: ${file.path}`);
}
const requestPath = `${reviewRoot}/approval-request.json`;
const requestBytes = await readFile(requestPath), request = JSON.parse(requestBytes.toString());
const candidateBytes = await readFile(request.manifestPath), candidates = JSON.parse(candidateBytes.toString());
assert.equal(digest(candidateBytes), request.manifestSha256, "Reviewed candidate manifest changed");
assert.equal(digest(await readFile(request.reviewPath)), request.reviewSha256, "Reviewed HTML changed");
assert.equal(request.revision, revision);
assert.equal(candidates.assets.length, 2);
for (const asset of candidates.assets) {
  assert.equal(asset.productId, "product-020");
  assert.equal(asset.colorwayId, "sky");
  assert.equal(asset.collectionId, "collection-002");
  for (const [path, hash] of [[asset.originalPath, asset.originalSha256], [asset.webPath, asset.webSha256]]) {
    const bytes = await readFile(path), metadata = await sharp(bytes).metadata();
    assert.equal(digest(bytes), hash, `Accepted bytes changed: ${path}`);
    assert.equal(metadata.width, 1086);
    assert.equal(metadata.height, 1448);
    assert((await sharp(bytes).stats()).isOpaque);
  }
  for (const ref of asset.references) assert.equal(digest(await readFile(ref.retainedPath)), ref.sha256);
}
const baseline = await json(`${reviewRoot}/baseline.json`);
const existing = await json("docs/content/brincadeira-manifest.json");
const integrated = existing.revision === revision;
if (!integrated) {
  for (const file of baseline.files) await verifyBaselineFile(file);
  await mkdir(archive, { recursive: true });
  for (const path of changedPaths) await copyFile(path, `${archive}/${path.split("/").at(-1)}`);
}
let approval;
try { approval = await json(approvalPath); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  assert(process.argv.includes("--record-user-acceptance"), "Explicit recorded human acceptance required");
  approval = { revision, status: "approved", implementationAllowed: true,
    sourceIssue: request.sourceIssue, reviewer: "The user in this conversation", recordedAtUtc: new Date().toISOString(),
    evidence: { message: "yes", context: "The user replied yes to the presented issue-68-catalog-v1 review and the explicit question: 'Issue #68 requires your acceptance before integration. Approve the proposed pair?' This accepts the two product-020 / sky photographs and their exact original/WebP exports and authorizes their integration." },
    scope: "Only the two reviewed product-020 / sky photographs and exports; all 82 retained photographs preserve their previous exact-file approvals. No assortment or editorial changes.",
    approvalRequestPath: requestPath, approvalRequestSha256: digest(requestBytes),
    reviewedManifestPath: request.manifestPath, reviewedManifestSha256: request.manifestSha256,
    reviewedHtmlPath: request.reviewPath, reviewedHtmlSha256: request.reviewSha256,
    assets: request.assets, retainedAssets: request.retainedAssets, requestedCorrections: [],
  };
  await save(approvalPath, approval);
}
assert.equal(approval.status, "approved");
assert.equal(approval.implementationAllowed, true);
assert.equal(approval.approvalRequestSha256, digest(requestBytes));
assert.deepEqual(approval.assets, candidates.assets);
const accepted = candidates.assets.map(asset => ({ ...asset, approvalStatus: "approved", approvalSource: approvalPath }));
const previous = await json(`${archive}/brincadeira-manifest.json`);
const replace = asset => accepted.find(a => a.replacesAssetId === asset.id) ?? asset;
const manifest = { ...previous, revision, previousRevision: previous.revision,
  scope: "Ten products, fourteen colorways and 28 approved photographs. Two product-020 / sky photographs accepted for issue #68; 26 retained photographs preserve their prior approvals.",
  photographyApprovalSource: approvalPath, assets: previous.assets.map(replace) };
const oldGeneration = await json(`${archive}/brincadeira-generation.json`);
const generation = await json(`${reviewRoot}/generation.json`);
const selectedRecords = generation.records.map(record => ({ ...record, approvalStatus: "approved", approvalSource: approvalPath }));
const batchGeneration = { ...oldGeneration, revision, previousRevision: oldGeneration.revision, sourceIssue: request.sourceIssue,
  approvalStatus: "approved", status: "approved", scope: manifest.scope, photographyApprovalSource: approvalPath,
  previousGenerationSnapshot: `${archive}/brincadeira-generation.json`,
  records: oldGeneration.records.map(record => selectedRecords.find(r => r.productId === record.productId && r.colorwayId === record.colorwayId && r.role === record.role) ?? record) };
if (!integrated) {
  await save("docs/content/brincadeira-manifest.json", manifest);
  await save("docs/content/brincadeira-generation.json", batchGeneration);
  const tiles = [];
  for (const [index, asset] of manifest.assets.entries()) {
    const left = index % 4 * 300, top = Math.floor(index / 4) * 440;
    tiles.push({ input: await sharp(asset.webPath).resize(300, 400).png().toBuffer(), left, top });
    tiles.push({ input: Buffer.from(`<svg width="300" height="40"><rect width="300" height="40" fill="white"/><text x="8" y="24" font-family="Arial" font-size="11">${asset.productId} / ${asset.colorwayId} / ${asset.role}</text></svg>`), left, top: top + 400 });
  }
  await sharp({ create: { width: 1200, height: 3080, channels: 3, background: "white" } }).composite(tiles).webp({ quality: 90 }).toFile("docs/content/brincadeira-contact-sheet.webp");
  const rows = manifest.assets.filter(a => a.role === "model").map(model => {
    const isolated = manifest.assets.find(a => a.productId === model.productId && a.colorwayId === model.colorwayId && a.role === "isolated");
    return `| ${model.productId} | ${model.colorwayId} | [Model](../../${model.webPath}) | [Isolated](../../${isolated.webPath}) | ${model.approvalSource} |`;
  });
  await writeFile("docs/content/brincadeira-photography-review.md", `# Brincadeira photography — issue #68\n\nRevision: \`${revision}\`. ${manifest.scope}\n\nThe user replied “yes” to the exact reviewed pair. [Acceptance](catalog-refresh-68/approval.json) records evidence and all original/export hashes. [Historical batch](catalog-refresh-68/before-integration/brincadeira-manifest.json) and all prior originals/approvals remain retained. The [immutable review](catalog-refresh-68/review.md) records the audit and discarded attempts.\n\n![Current collection photographs](brincadeira-contact-sheet.webp)\n\n| Product | Colorway | Worn | Isolated | Approval source |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
  const oldPackage = await json(`${archive}/package-manifest.json`), oldApproval = await json(`${archive}/package-approval.json`);
  assert.equal(digest(await readFile(`${archive}/package-manifest.json`)), oldApproval.manifestSha256);
  const pkg = { ...oldPackage, revision: packageRevision, previousRevision: oldPackage.revision, sourceIssue: request.sourceIssue,
    approvalStatus: "approved", implementationAllowed: true,
    catalogAssets: oldPackage.catalogAssets.map(replace),
    precedingApprovals: [...oldPackage.precedingApprovals, { path: approvalPath, record: approval }],
    acceptedRevisions: [...oldPackage.acceptedRevisions, "Issue #68 exact-file photography acceptance replaces product-020 / sky only; the other 82 photographs and all assortment/editorial records retain prior approval."],
  };
  const files = new Map(pkg.files.map(file => [file.path, file]));
  for (const path of ["docs/content/brincadeira-manifest.json", "docs/content/brincadeira-generation.json", approvalPath, requestPath, request.manifestPath,
    ...accepted.flatMap(a => [a.originalPath, a.webPath])]) {
    const bytes = await readFile(path);
    files.set(path, { path, sha256: digest(bytes), bytes: bytes.length });
  }
  pkg.files = [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
  await save("docs/content/package-manifest.json", pkg);
  await save("docs/content/package-approval.json", { revision: packageRevision, status: "approved", implementationAllowed: true,
    manifestPath: "docs/content/package-manifest.json", manifestSha256: digest(await readFile("docs/content/package-manifest.json")),
    reviewPath: request.reviewPath, reviewSha256: request.reviewSha256, approvalRequestPath: requestPath, approvalRequestSha256: digest(requestBytes),
    reviewer: approval.reviewer, recordedAtUtc: approval.recordedAtUtc, evidence: approval.evidence,
    scope: "Derived package integration: previously accepted complete package plus the two explicitly accepted issue #68 photographs. No new assortment, copy, cast or editorial acceptance is claimed.",
    previousApprovalPath: `${archive}/package-approval.json`, previousManifestPath: `${archive}/package-manifest.json`,
    previousManifestSha256: oldApproval.manifestSha256, photographyApprovalSource: approvalPath,
    remainingGates: ["Release approval"] });
}
// Preserve all content, allowing the integration records and their preparation
// entry point/byte-preservation attributes. Ordinary source may use Git EOLs.
for (const file of baseline.files.filter(f => !changedPaths.includes(f.path) && !["scripts/content/prepare-brincadeira.mjs", ".gitattributes"].includes(f.path))) await verifyBaselineFile(file);
assert.deepEqual(await json("docs/content/brincadeira-manifest.json"), manifest);
assert.deepEqual(await json("docs/content/brincadeira-generation.json"), batchGeneration);
const pkg = await json("docs/content/package-manifest.json"), previousPackage = await json(`${archive}/package-manifest.json`);
for (const field of ["catalog", "copy", "cast", "editorial", "identity", "counts"]) assert.deepEqual(pkg[field], previousPackage[field], `Out-of-scope package change: ${field}`);
assert.deepEqual(pkg.catalogAssets, previousPackage.catalogAssets.map(replace));
for (const asset of request.retainedAssets) for (const [path, hash] of [[asset.originalPath, asset.originalSha256], [asset.webPath, asset.webSha256]]) assert.equal(digest(await readFile(path)), hash);
console.log("Accepted pair integrated: 2 updated, 82 retained; reviewed bytes, previous approvals, assortment and all editorial files preserved.");
