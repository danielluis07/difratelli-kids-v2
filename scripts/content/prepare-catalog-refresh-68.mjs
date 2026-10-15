import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { revision, reviewRoot, selections } from "./catalog-refresh-68-spec.mjs";

const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const json = async path => JSON.parse(await readFile(path, "utf8"));
const save = async (name, value) => writeFile(`${reviewRoot}/${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
await mkdir(reviewRoot, { recursive: true });
try {
  const acceptance = await json(`${reviewRoot}/approval.json`);
  assert.notEqual(acceptance.status, "approved", "Accepted review artifacts are immutable. Create a new revision for further changes.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
const catalog = await json("docs/content/catalog-proposal.json");
const cast = await json("docs/content/cast-approval.json");
const collections = await Promise.all(["quintal", "brincadeira", "imaginacao"].map(async name => ({
  name, path: `docs/content/${name}-manifest.json`, manifest: await json(`docs/content/${name}-manifest.json`),
})));
const approvals = await Promise.all(["quintal", "brincadeira", "imaginacao", "catalog-sample", "polo"].map(async name => ({
  path: `docs/content/${name}-approval.json`, approval: await json(`docs/content/${name}-approval.json`),
})));
const selected = asset => selections.find(s => s.productId === asset.productId && s.colorwayId === asset.colorwayId);
const replacementCount = selections.length * 2;
const assets = collections.flatMap(c => c.manifest.assets.map(asset => ({ ...asset, manifestPath: c.path })));
assert.equal(assets.length, 84);
assert.equal(catalog.products.length, 30);
assert.equal(catalog.products.flatMap(p => p.colorways).length, 42);

// Snapshot existing tracked files before generation. The review adds files only.
if (process.argv.includes("--baseline")) {
  const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const files = [];
  for (const path of paths) files.push({ path, sha256: digest(await readFile(path)) });
  await save("baseline", { revision, recordedAtUtc: new Date().toISOString(), files });
}
const baseline = await json(`${reviewRoot}/baseline.json`);
for (const file of baseline.files) assert.equal(digest(await readFile(file.path)), file.sha256, `Existing file changed: ${file.path}`);

const rows = [];
for (const asset of assets) {
  const original = await readFile(asset.originalPath), web = await readFile(asset.webPath);
  assert.equal(digest(original), asset.originalSha256, asset.id);
  assert.equal(digest(web), asset.webSha256, asset.id);
  const matches = approvals.filter(({ approval }) => approval.status === "approved" && approval.assets.some(a =>
    a.originalPath === asset.originalPath && a.originalSha256 === digest(original) && a.webPath === asset.webPath && a.webSha256 === digest(web)));
  assert(matches.length, `Missing exact separate approval: ${asset.id}`);
  const source = await sharp(original).metadata(), encoded = await sharp(web).metadata();
  assert.equal(source.width * 4, source.height * 3, asset.id);
  assert(source.width >= 1086 && source.height >= 1448, asset.id);
  assert.equal(source.width, encoded.width, asset.id);
  assert.equal(source.height, encoded.height, asset.id);
  assert((await sharp(original).stats()).isOpaque, asset.id);
  const product = catalog.products.find(p => p.id === asset.productId);
  assert(product?.colorways.some(c => c.id === asset.colorwayId), asset.id);
  assert(product.sizes.includes(asset.photographedSize), asset.id);
  assert.equal(asset.galleryOrder, asset.role === "model" ? 1 : 2, asset.id);
  const assignment = cast.assets.find(a => a.productIds.includes(asset.productId));
  assert(assignment, asset.id);
  if (asset.role === "model") {
    assert.equal(asset.modelId, assignment.modelId, asset.id);
    assert(asset.references.some(r => r.retainedPath === assignment.originalPath && r.sha256 === assignment.originalSha256), asset.id);
  } else {
    const worn = assets.find(a => a.productId === asset.productId && a.colorwayId === asset.colorwayId && a.role === "model");
    assert(asset.references.some(r => r.retainedPath === worn.originalPath && r.sha256 === worn.originalSha256), asset.id);
  }
  for (const ref of asset.references) assert.equal(digest(await readFile(ref.retainedPath)), ref.sha256, asset.id);
  const selection = selected(asset);
  rows.push({ ...asset, verifiedApprovalSources: matches.map(m => m.path), decision: selection ? "propose-replacement" : "retain",
    reason: selection?.reason ?? ((asset.productId === "product-009" && asset.colorwayId === "leaf") || (asset.productId === "product-029" && asset.colorwayId === "teal")
      ? "Retain after unsuccessful retakes: the new isolation attempts did not sufficiently improve the already approved pair. Its previously accepted faint fly-like detail remains bound to the existing exact hashes. Rejected attempts are retained in generation.json."
      : "Retain: contact-sheet review found no priority correction to silhouette, printed motif/color relationships, set completeness, framing or model/isolated continuity. Existing exact-file approval remains valid."),
    measuredDimensions: { width: source.width, height: source.height },
    acceptedExceptions: matches.flatMap(m => (m.approval.acceptedExceptions ?? []).filter(e => e.assetIds?.includes(asset.id))),
  });
}
await save("audit", { revision, sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/68", status: "agent-audited",
  method: "Visual review of all three active collection contact sheets, full-size inspection of selected trouser photos and assigned cast references, and exact-byte checks of all 84 active original/export pairs and their input references. Human acceptance remains separate.",
  approvalPolicy: "Separate approvals bind exact files. Historical pending fields and superseded product-002/product-011 photos do not revoke later polo or package approvals.",
  resolutionSources: ["docs/content/catalog-sample-approval.json", "docs/content/brincadeira-resolution-acceptance.json", "docs/content/imaginacao-resolution-acceptance.json"],
  counts: { products: 30, colorways: 42, photographs: 84, retained: 84 - replacementCount, proposedReplacements: replacementCount },
  protectedFilesVerified: baseline.files.length, assets: rows,
});
if (process.argv.includes("--baseline") || process.argv.includes("--audit-only")) {
  console.log(`Audited 84 approved photographs: ${84 - replacementCount} retain, ${replacementCount} proposed replacements; existing tracked files unchanged.`);
  process.exit(0);
}
const requests = await json(`${reviewRoot}/requests.json`);
const generation = await json(`${reviewRoot}/generation.json`);
assert.equal(requests.records.length, replacementCount);
const proposed = [];
for (const record of requests.records) {
  const output = generation.records.find(g => g.originalPath === record.originalPath);
  assert(output, `No retained tool output: ${record.originalPath}`);
  assert.equal(output.prompt, record.prompt, "Generation prompt differs from request");
  assert.deepEqual(output.referencePaths, record.referencePaths);
  const original = await readFile(record.originalPath), meta = await sharp(original).metadata();
  assert.equal(digest(original), output.originalSha256);
  assert.equal(meta.width * 4, meta.height * 3, `Native output is not exact 3:4: ${record.originalPath}`);
  assert(meta.width >= 1086 && meta.height >= 1448, `Native output is undersized: ${record.originalPath}`);
  assert((await sharp(original).stats()).isOpaque);
  const previous = assets.find(a => a.productId === record.productId && a.colorwayId === record.colorwayId && a.role === record.role);
  assert(previous);
  const refs = [];
  for (const path of record.referencePaths) refs.push({ inputPath: path, retainedPath: path, sha256: digest(await readFile(path)) });
  if (record.role === "model") {
    const identity = cast.assets.find(a => a.modelId === record.modelId);
    assert(identity.productIds.includes(record.productId));
    assert(refs.some(r => r.inputPath === identity.originalPath && r.sha256 === identity.originalSha256));
  } else {
    const worn = proposed.find(a => a.productId === record.productId && a.colorwayId === record.colorwayId && a.role === "model");
    assert(worn, "Generate and validate worn photograph first");
    assert(refs.some(r => r.inputPath === worn.originalPath && r.sha256 === worn.originalSha256));
  }
  // Full-frame conversion only. No enlargement, cropping or background repair.
  const web = await sharp(original).webp({ quality: 90 }).toBuffer();
  const encoded = await sharp(web).metadata();
  assert.equal(encoded.width, meta.width);
  assert.equal(encoded.height, meta.height);
  await writeFile(record.webPath, web);
  proposed.push({ id: record.originalPath.split("/").at(-1).replace(/\.png$/, ""),
    productId: record.productId, collectionId: record.collectionId, colorwayId: record.colorwayId,
    modelId: record.modelId, assignedModelId: record.assignedModelId, photographedSize: record.photographedSize,
    role: record.role, galleryOrder: record.galleryOrder, originalPath: record.originalPath, originalSha256: digest(original),
    webPath: record.webPath, webSha256: digest(web), originalBytes: original.length, webBytes: web.length,
    width: meta.width, height: meta.height, webWidth: encoded.width, webHeight: encoded.height,
    approvalStatus: "pending-human-review", approvalSource: null, technicalStatus: "passed", references: refs,
    crop: "full-frame", usage: previous.usage, alt: record.alt, replacesAssetId: previous.id,
  });
}
const manifest = { revision, approvalStatus: "pending-human-review", integrated: false,
  scope: `${replacementCount} proposed photographs only; ${84 - replacementCount} retained photographs keep their existing approvals. No editorial changes.`, assets: proposed };
await save("manifest", manifest);
const pairs = [];
for (const product of catalog.products) for (const colorway of product.colorways) {
  const current = rows.filter(a => a.productId === product.id && a.colorwayId === colorway.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
  const replacement = proposed.filter(a => a.productId === product.id && a.colorwayId === colorway.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
  assert.equal(current.length, 2);
  pairs.push({ product, colorway, current, replacement });
}
const xml = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const href = asset => `../../../${asset.webPath}`;
const photo = (asset, label) => `<figure><a href="${href(asset)}"><img src="${href(asset)}" alt="${xml(asset.alt)}" width="${asset.width}" height="${asset.height}" loading="lazy"></a><figcaption>${label}<br><code>${asset.id}</code></figcaption></figure>`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue 68 catalog photography review</title><style>
*{box-sizing:border-box}body{margin:0;padding:24px;color:#302b28;background:#f7f5f1;font:16px/1.5 system-ui}main{max-width:1440px;margin:auto}h1{font-size:clamp(24px,4vw,40px)}h2{font-size:22px}a{color:#235d55}section{padding:20px 0;border-top:1px solid #b7b3ab}.photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}figure{margin:0;background:white}img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:contain}figcaption{padding:10px;font-size:13px;overflow-wrap:anywhere}.retained .photos{grid-template-columns:repeat(2,minmax(0,1fr));max-width:640px}.pending{background:#fff0cf;padding:16px;border:1px solid #977524}.checks{max-width:85ch}code{font-size:11px}@media(max-width:767px){body{padding:16px}.photos{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}figcaption{padding:8px}}
</style><main><h1>Catalog photography · issue #68</h1><p class="pending"><strong>Pending human acceptance; candidates are not integrated.</strong> Review ${replacementCount} replacement files for ${selections.length} colorway. All three collections were audited. The other ${84 - replacementCount} photographs retain their exact approvals. Click any photograph for its full-resolution WebP.</p><p><a href="approval-request.json">Exact files and SHA-256 hashes</a> · <a href="audit.json">All 84 audit decisions and approval sources</a> · <a href="generation.json">Exact generation prompts and references</a> · <a href="manifest.json">Candidate metadata and Portuguese alt text</a></p><div class="checks"><p>Check garment silhouette, matte twill, color, visible elastic waist, two pockets, straight ankle-length legs, no fly, natural anatomy and complete framing. Compare the new model photograph with its isolated counterpart. Studio shadows may be soft neutral gray; backgrounds must be opaque white.</p><p>Previous accepted exceptions remain approved for retained files, including both product-009 isolated colorways, product-018/product-019 shorts and product-029 teal isolated. Leaf-green and teal retakes were discarded because they did not provide a sufficient improvement. This review does not alter garment definitions or prior acceptance. No assortment or editorial change is proposed.</p><p>View at 390px, 768px and 1440px. Actual storefront card/gallery previews and browser results are linked from <a href="review.md">the review report</a>. Accept or request corrections for the exact ${replacementCount} files in the approval request.</p></div><h2>Proposed replacements</h2>${pairs.filter(p => p.replacement.length).map(p => `<section><h2>${xml(p.product.name)} · ${xml(p.colorway.name)}</h2><p>${xml(selected(p.current[0]).reason)}</p><div class="photos">${p.current.map(a => photo(a, `Current approved · ${a.role}`)).join("")}${p.replacement.map(a => photo(a, `Proposed · ${a.role} · pending acceptance`)).join("")}</div></section>`).join("")}<h2>Retained catalog photographs</h2>${pairs.filter(p => !p.replacement.length).map(p => `<section class="retained"><h2>${xml(p.product.name)} · ${xml(p.colorway.name)}</h2><p>${xml(p.product.id)} · ${xml(p.colorway.id)} · retain both approved files</p><div class="photos">${p.current.map(a => photo(a, a.role)).join("")}</div></section>`).join("")}</main></html>`;
await writeFile(`${reviewRoot}/review.html`, html);
const tiles = [];
for (const [row, s] of selections.entries()) {
  const images = [...rows.filter(a => a.productId === s.productId && a.colorwayId === s.colorwayId), ...proposed.filter(a => a.productId === s.productId && a.colorwayId === s.colorwayId)];
  for (const [col, asset] of images.entries()) {
    tiles.push({ input: await sharp(asset.webPath).resize(300, 400).png().toBuffer(), left: col * 300, top: row * 440 });
    tiles.push({ input: Buffer.from(`<svg width="300" height="40"><rect width="300" height="40" fill="white"/><text x="8" y="23" font-family="Arial" font-size="12">${col < 2 ? "Current" : "Proposed"}: ${asset.productId} ${asset.colorwayId} ${asset.role}</text></svg>`), left: col * 300, top: row * 440 + 400 });
  }
}
await sharp({ create: { width: 1200, height: selections.length * 440, channels: 3, background: "white" } }).composite(tiles).webp({ quality: 90 }).toFile(`${reviewRoot}/contact-sheet.webp`);
await save("approval-request", { revision, status: "pending-human-review", integrated: false,
  requiredDecision: `Accept these exact ${replacementCount} original/WebP file pairs or identify corrections by product/colorway/role. No agent inspection constitutes human acceptance.`,
  sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/68", manifestPath: `${reviewRoot}/manifest.json`,
  manifestSha256: digest(await readFile(`${reviewRoot}/manifest.json`)), reviewPath: `${reviewRoot}/review.html`, reviewSha256: digest(Buffer.from(html)),
  assets: proposed, retainedAssets: rows.filter(a => a.decision === "retain").map(a => ({ id: a.id, originalPath: a.originalPath, originalSha256: a.originalSha256, webPath: a.webPath, webSha256: a.webSha256, approvalSources: a.verifiedApprovalSources })),
  remainingGates: ["Explicit human acceptance of exact candidate files and exports", "Approved integration into active manifests and complete-package readiness without revoking retained-file approvals", "Post-integration storefront and repository verification"],
});
console.log(`Prepared ${replacementCount} native 3:4, opaque, quality-90 full-frame candidate exports; all 84 existing approved photos and tracked files unchanged. Human acceptance pending.`);
