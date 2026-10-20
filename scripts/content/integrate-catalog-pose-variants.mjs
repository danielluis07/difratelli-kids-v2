import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const root = "docs/content/catalog-pose-variants";
const archive = `${root}/before-integration`;
const approvalPath = `${root}/approval.json`;
const revision = "catalog-pose-variants-v1";
const packageRevision = "catalog-pose-variants-package-v1";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const json = async path => JSON.parse(await readFile(path, "utf8"));
const save = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
const specs = [
  { productId: "product-020", colorwayId: "sky", stem: "product-020-sky-hands-in-pockets-v1",
    alt: "Noah usando Calça Passos na Rua azul-céu, com as duas mãos nos bolsos e a peça inteira visível sobre fundo branco." },
  { productId: "product-024", colorwayId: "peach-teal-cream", stem: "product-024-peach-gentle-turn-v1",
    alt: "Iara usando Vestido Histórias de Estrelas pêssego com estrelas creme e verde-petróleo, em um giro suave sobre fundo branco." },
  { productId: "product-027", colorwayId: "lilac", stem: "product-027-lilac-relaxed-three-quarter-v1",
    alt: "Bia usando Blusa Cor de História lilás, em pose de três quartos com uma mão na cintura sobre fundo branco." },
];

const currentPackage = await json("docs/content/package-manifest.json");
if (currentPackage.revision === packageRevision) {
  console.log("Approved pose variants are already integrated.");
  process.exit(0);
}
const previousApproval = await json("docs/content/package-approval.json");
assert.equal(digest(await readFile("docs/content/package-manifest.json")), previousApproval.manifestSha256);
const changedPaths = ["docs/content/package-manifest.json", "docs/content/package-approval.json",
  ...["brincadeira", "imaginacao"].flatMap(name => [
    `docs/content/${name}-manifest.json`, `docs/content/${name}-photography-review.md`, `docs/content/${name}-contact-sheet.webp`,
  ])];
await mkdir(archive, { recursive: true });
await mkdir("public/images/catalog-pose-variants", { recursive: true });
// Exclusive copies prevent overwriting the historical package on a partial rerun.
for (const path of changedPaths) {
  try { await copyFile(path, `${archive}/${path.split("/").at(-1)}`, 1); }
  catch (error) { if (error.code !== "EEXIST") throw error; }
}
const previousPackage = await json(`${archive}/package-manifest.json`);
assert.deepEqual(previousPackage, currentPackage, "Restore the archived package before retrying a partial integration");
const accepted = [];
for (const spec of specs) {
  const previous = previousPackage.catalogAssets.find(a => a.productId === spec.productId && a.colorwayId === spec.colorwayId && a.role === "model");
  assert(previous, `Missing current photograph: ${spec.productId}`);
  const originalPath = `assets/originals/catalog-pose-variants/${spec.stem}.png`;
  const webPath = `public/images/catalog-pose-variants/${spec.stem}.webp`;
  const original = await readFile(originalPath);
  const meta = await sharp(original).metadata();
  assert.equal(meta.width * 4, meta.height * 3);
  assert(meta.width >= 1086 && meta.height >= 1448);
  assert((await sharp(original).stats()).isOpaque);
  const web = await sharp(original).webp({ quality: 90, effort: 6 }).toBuffer();
  await writeFile(webPath, web);
  accepted.push({ ...previous, id: spec.stem, originalPath, webPath,
    originalSha256: digest(original), webSha256: digest(web), originalBytes: original.length, webBytes: web.length,
    width: meta.width, height: meta.height, webWidth: meta.width, webHeight: meta.height,
    approvalStatus: "approved", approvalSource: approvalPath, technicalStatus: "passed", alt: spec.alt,
    replacesAssetId: previous.id,
    references: [...previous.references, { inputPath: previous.originalPath, retainedPath: previous.originalPath, sha256: previous.originalSha256 }],
  });
}
const approval = { revision, status: "approved", implementationAllowed: true,
  reviewer: "The user in this conversation", recordedAtUtc: new Date().toISOString(),
  evidence: { message: "approved. you can replace some of the images with the new poses",
    context: "The user approved the three presented pose previews after requesting hands in pockets for the boy and discarding his walking version. Integration uses these exact PNGs and deterministic WebP exports." },
  scope: "Three model photographs only: product-020/sky hands in pockets, product-024/peach-teal-cream gentle turn, product-027/lilac relaxed three-quarter stance. The other 81 catalog photographs retain their prior approvals.",
  assets: accepted, discarded: ["product-020-sky-walking-step-v1.png"] };
await save(approvalPath, approval);
const replace = asset => accepted.find(a => a.replacesAssetId === asset.id) ?? asset;
for (const name of ["brincadeira", "imaginacao"]) {
  const path = `docs/content/${name}-manifest.json`;
  const old = await json(`${archive}/${name}-manifest.json`);
  const updated = { ...old, revision: `${revision}-${name}`, previousRevision: old.revision,
    photographyApprovalSource: approvalPath, assets: old.assets.map(replace) };
  await save(path, updated);
  const reviewPath = `docs/content/${name}-photography-review.md`;
  let review = await readFile(`${archive}/${name}-photography-review.md`, "utf8");
  for (const asset of accepted) {
    const previous = old.assets.find(a => a.id === asset.replacesAssetId);
    if (previous) review = review.replaceAll(previous.webPath, asset.webPath);
  }
  review += `\n## Approved pose update\n\nRevision: \`${updated.revision}\`. [User approval](catalog-pose-variants/approval.json) replaces only this collection's selected model photographs. Current assets are listed in the collection manifest; previous review and manifests are retained in [the archive](catalog-pose-variants/before-integration/).\n`;
  await writeFile(reviewPath, review);
  const tiles = [];
  for (const [index, asset] of updated.assets.entries()) {
    const left = index % 4 * 300, top = Math.floor(index / 4) * 440;
    tiles.push({ input: await sharp(asset.webPath).resize(300, 400).png().toBuffer(), left, top });
    tiles.push({ input: Buffer.from(`<svg width="300" height="40"><rect width="300" height="40" fill="white"/><text x="8" y="24" font-family="Arial" font-size="11">${asset.productId} / ${asset.colorwayId} / ${asset.role}</text></svg>`), left, top: top + 400 });
  }
  await sharp({ create: { width: 1200, height: Math.ceil(updated.assets.length / 4) * 440, channels: 3, background: "white" } })
    .composite(tiles).webp({ quality: 90 }).toFile(`docs/content/${name}-contact-sheet.webp`);
}
const reviewPath = `${root}/review.md`;
await writeFile(reviewPath, `# Approved catalog poses\n\n${approval.scope}\n\nApproval: “${approval.evidence.message}”\n\n${accepted.map(a => `- ${a.productId} / ${a.colorwayId}: [WebP](../../../${a.webPath}) · [Approved original](../../../${a.originalPath})`).join("\n")}\n\nThe walking preview was discarded. PNG originals are unchanged; WebP exports preserve full native dimensions. Previous originals and approval evidence remain retained. Product cards and galleries consume the updated collection manifests.\n`);
const pkg = { ...previousPackage, revision: packageRevision, previousRevision: previousPackage.revision,
  approvalStatus: "approved", implementationAllowed: true, catalogAssets: previousPackage.catalogAssets.map(replace),
  precedingApprovals: [...previousPackage.precedingApprovals, { path: approvalPath, record: approval }],
  acceptedRevisions: [...previousPackage.acceptedRevisions, approval.scope] };
const files = new Map(pkg.files.map(file => [file.path, file]));
const retainedPaths = [approvalPath, reviewPath, ...changedPaths.filter(p => !p.includes("package-")),
  ...accepted.flatMap(a => [a.originalPath, a.webPath]), ...changedPaths.map(p => `${archive}/${p.split("/").at(-1)}`)];
for (const path of retainedPaths) {
  const bytes = await readFile(path);
  files.set(path, { path, sha256: digest(bytes), bytes: bytes.length });
}
pkg.files = [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
for (const field of ["catalog", "copy", "cast", "editorial", "identity", "counts"]) assert.deepEqual(pkg[field], previousPackage[field]);
assert.equal(pkg.catalogAssets.filter((a, i) => a.id !== previousPackage.catalogAssets[i].id).length, 3);
await save("docs/content/package-manifest.json", pkg);
await save("docs/content/package-approval.json", { revision: packageRevision, status: "approved", implementationAllowed: true,
  manifestPath: "docs/content/package-manifest.json", manifestSha256: digest(await readFile("docs/content/package-manifest.json")),
  reviewPath, reviewSha256: digest(await readFile(reviewPath)), approvalRequestPath: approvalPath,
  approvalRequestSha256: digest(await readFile(approvalPath)), reviewer: approval.reviewer,
  recordedAtUtc: approval.recordedAtUtc, evidence: approval.evidence, scope: approval.scope,
  previousApprovalPath: `${archive}/package-approval.json`, previousManifestPath: `${archive}/package-manifest.json`,
  previousManifestSha256: previousApproval.manifestSha256, photographyApprovalSource: approvalPath,
  remainingGates: previousApproval.remainingGates });
console.log("Integrated 3 approved poses; retained 81 catalog photographs and previous approval history.");
