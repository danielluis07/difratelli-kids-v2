import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const revision = "issue-29-package-v1";
const root = "docs/content/";
const read = async (name) => JSON.parse(await readFile(root + name + ".json", "utf8"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const catalog = await read("catalog-proposal");
const copy = await read("copy-proposal");
const cast = await read("cast-manifest");
const batches = await Promise.all(["quintal", "brincadeira", "imaginacao"].map((name) => read(name + "-manifest")));
const editorial = await read("editorial-manifest");
const identity = await read("identity-manifest");
const photos = batches.flatMap((batch) => batch.assets);
const approvals = ["approval", "cast-approval", "catalog-sample-approval", "quintal-approval", "brincadeira-approval", "imaginacao-approval", "polo-assortment-approval", "polo-approval", "editorial-approval", "identity-approval"];
const files = new Map();
async function inspect(path, expectedHash) {
  const bytes = await readFile(path);
  const sha256 = digest(bytes);
  if (expectedHash) assert.equal(sha256, expectedHash, `Approved bytes changed: ${path}`);
  files.set(path, { path, sha256, bytes: bytes.length });
  return bytes;
}
for (const name of ["catalog-proposal", "copy-proposal", "cast-manifest", "quintal-manifest", "brincadeira-manifest", "imaginacao-manifest", "editorial-manifest", "identity-manifest", ...approvals]) await inspect(root + name + ".json");
const approvalRecords = [];
for (const name of approvals) {
  const record = await read(name);
  assert.equal(record.status ?? record.approvalStatus, "approved", name);
  approvalRecords.push({ path: root + name + ".json", record });
}
for (const source of [catalog, copy, cast, ...batches, editorial, identity]) assert.equal(source.approvalStatus, "approved");
const unique = (items, field) => assert.equal(new Set(items.map((item) => item[field])).size, items.length, `Duplicate ${field}`);
unique(catalog.products, "id"); unique(catalog.products, "slug"); unique(photos, "id");
assert.equal(catalog.products.length, 30);
assert.equal(catalog.products.flatMap((p) => p.colorways).length, 42);
assert.equal(photos.length, 84); assert.equal(editorial.assets.length, 8); assert.equal(identity.assets.length, 6); assert.equal(cast.assets.length, 8);
const products = new Map(catalog.products.map((p) => [p.id, p]));
const models = new Set(cast.assets.map((a) => a.modelId));
for (const category of catalog.categories) assert.equal(catalog.products.filter((p) => p.categoryId === category.id).length, category.expectedCount, category.id);
for (const collection of catalog.collections) {
  const members = catalog.products.filter((p) => p.collectionId === collection.id);
  assert.equal(members.length, 10);
  assert.deepEqual(new Set(collection.productIds), new Set(members.map((p) => p.id)));
  for (const [audience, count] of [["girls", 4], ["boys", 4], ["both", 2]]) assert.equal(members.filter((p) => p.audienceId === audience).length, count);
}
for (const product of catalog.products) {
  const category = catalog.categories.find((c) => c.id === product.categoryId);
  assert(category, product.id); assert(Number.isInteger(product.priceCents) && product.priceCents >= category.priceRangeCents[0] && product.priceCents <= category.priceRangeCents[1], product.id);
  assert.deepEqual(product.sizes, [2, 4, 6, 8]); assert.equal(product.initialSize, null);
  assert(product.colorways.some((c) => c.id === product.defaultColorwayId));
  for (const id of product.coordinatingProductIds) assert.equal(products.get(id)?.collectionId, product.collectionId);
  if (product.categoryId === "matching-sets") assert.equal(product.includedPieces.length, 2, product.id);
  for (const colorway of product.colorways) {
    const pair = photos.filter((a) => a.productId === product.id && a.colorwayId === colorway.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
    assert.deepEqual(pair.map((a) => [a.role, a.galleryOrder]), [["model", 1], ["isolated", 2]], `${product.id}/${colorway.id}`);
    assert.equal(pair[0].collectionId, product.collectionId); assert(models.has(pair[0].modelId));
  }
}
function references(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (key === "productIds" || key === "curatedProductIds" || key === "newArrivalProductIds") for (const id of entry) assert(products.has(id), id);
    if (key === "productId") assert(products.has(entry), entry);
    references(entry);
  }
}
references(catalog.merchandising);
assert.equal(catalog.merchandising.newArrivalProductIds.length, 8);
for (const section of Object.values(catalog.merchandising.homepage)) if (section.productIds) assert.equal(section.productIds.length, 4);
for (const tile of catalog.merchandising.homepage.categoryTiles) assert(products.get(tile.productId).colorways.some((c) => c.id === tile.colorwayId));
for (const asset of [...photos, ...cast.assets, ...editorial.assets]) {
  assert.equal(asset.approvalStatus, "approved"); assert(asset.alt && asset.usage.length);
  const original = await inspect(asset.originalPath, asset.originalSha256);
  const meta = await sharp(original).metadata();
  assert.equal(meta.width, asset.width, asset.id); assert.equal(meta.height, asset.height, asset.id);
  if (asset.webPath) {
    const web = await sharp(await inspect(asset.webPath, asset.webSha256)).metadata();
    assert.equal(web.format, "webp"); assert.equal(web.width, asset.webWidth ?? asset.width); assert.equal(web.height, asset.webHeight ?? asset.height);
  }
  if (asset.productId) {
    assert(products.get(asset.productId)?.colorways.some((c) => c.id === asset.colorwayId));
    assert.equal(asset.width * 4, asset.height * 3);
    assert(asset.width >= 1086 && asset.height >= 1448);
    const record = approvalRecords.find((a) => a.path === asset.approvalSource)?.record;
    assert(record, asset.approvalSource);
    const approved = record.assets?.find((a) => a.id === asset.id) ?? record.files?.find((f) => f.path === asset.originalPath);
    assert(approved, `Missing exact approval: ${asset.id}`);
    assert.equal(approved.originalSha256 ?? approved.sha256, asset.originalSha256);
  }
  for (const id of asset.modelIds ?? []) assert(models.has(id), id);
  for (const crop of asset.crops ?? []) {
    assert.equal(crop.approvalStatus, "approved");
    const meta = await sharp(await inspect(crop.webPath, crop.sha256)).metadata();
    assert.equal(meta.width, crop.width); assert.equal(meta.height, crop.height); assert.equal(meta.format, "webp");
    if (crop.derivative) await inspect(crop.derivative.originalPath, crop.derivative.originalSha256);
  }
}
for (const asset of [...identity.assets, ...identity.fonts]) await inspect(asset.path, asset.sha256);
for (const file of (await read("approval")).files) await inspect(file.path, file.approvedSha256);
for (const name of ["editorial-approval", "identity-approval"]) for (const file of (await read(name)).files) await inspect(file.path, file.sha256);
const manifest = {
  revision, sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/29",
  approvalStatus: "pending-human-review", implementationAllowed: false,
  catalog, copy, cast, catalogAssets: photos, editorial, identity,
  precedingApprovals: approvalRecords,
  acceptedRevisions: ["Issue #51 supersedes two T-shirts with polos and adds the Polos category.", "Collection-specific native 1086 × 1448 acceptance and exact garment exceptions remain scoped to their existing approval records.", "Editorial garments remain as approved; catalog integration was explicitly deferred by the user."],
  counts: { products: 30, colorways: 42, catalogPhotographs: 84, editorialScenes: 8, identitySvgAssets: 6, castIdentities: 8 },
  files: [...files.values()].sort((a, b) => a.path.localeCompare(b.path)),
};
const bytes = JSON.stringify(manifest, null, 2) + "\n";
// Preserve the reviewed revision: approved inputs must never be regenerated
// under the same revision after a change.
let existingApproval;
try { existingApproval = await read("package-approval"); }
catch (error) { if (error.code !== "ENOENT") throw error; }
if (existingApproval) {
  assert.equal(existingApproval.status, "approved");
  assert.equal(existingApproval.revision, revision);
  assert.equal(existingApproval.manifestSha256, digest(bytes), "Approved package changed; prepare a new revision for human review.");
}
await writeFile(root + "package-manifest.json", bytes);
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const link = (path, label) => `<a href="../../${escape(path)}">${escape(label)}</a>`;
let review = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Complete content package review</title><style>body{max-width:1200px;margin:32px auto;padding:16px;background:#faf7f0;color:#382c25;font:16px system-ui}a{color:#246b63}section{border-top:1px solid #ccc;padding:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:700px}img{width:100%;height:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere}figure{margin:0}summary{cursor:pointer}figcaption{font-size:14px}h1,h2{line-height:1.2}</style><main><h1>Complete production package</h1><p>Revision ${revision} · pending your complete-package approval. 30 products, 42 colorways, 84 catalog photographs, eight editorial scenes, six SVG assets. All component approvals are retained. Storefront implementation remains gated.</p><p>${link(root + "package-manifest.json", "Complete manifest")} · ${link(root + "editorial-review.html", "Responsive editorial placement review")} · ${link(root + "identity-review.html", "Identity review")}</p><h2>Accepted revisions and exceptions</h2><ul>${manifest.acceptedRevisions.map((s) => `<li>${escape(s)}</li>`).join("")}</ul><details><summary>Preceding approvals and exact exceptions</summary><pre>${escape(JSON.stringify(approvalRecords, null, 2))}</pre></details><h2>Merchandising</h2><pre lang="pt-BR">${escape(JSON.stringify(catalog.merchandising, null, 2))}</pre><h2>Approved copy and size guidance</h2><details><summary>Inspect every copy field, including size guidance</summary><pre lang="pt-BR">${escape(JSON.stringify(copy, null, 2))}</pre></details><h2>Catalog · model first, isolated second</h2>`;
for (const p of catalog.products) {
  review += `<section><h3 lang="pt-BR">${escape(p.name)} · ${(p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</h3><p>${escape(p.id)} · ${escape(p.categoryId)} · ${escape(p.audienceId)} · ${escape(p.collectionId)}</p><p lang="pt-BR">${escape(p.description)} ${escape(p.composition)} ${escape(p.fitGuidance)}</p>`;
  if (p.includedPieces.length) review += `<p lang="pt-BR">${escape(p.includedPieces.join(" + "))}</p>`;
  for (const c of p.colorways) {
    const pair = photos.filter((a) => a.productId === p.id && a.colorwayId === c.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
    review += `<h4 lang="pt-BR">${escape(c.name)}</h4><div class="pair">${pair.map((a) => `<figure><a href="../../${escape(a.webPath)}"><img loading="lazy" width="${a.webWidth}" height="${a.webHeight}" src="../../${escape(a.webPath)}" alt="${escape(a.alt)}"></a><figcaption>${escape(a.role)} · ${escape(a.modelId ?? "no child")} · ${a.width} × ${a.height} · ${link(a.originalPath, "Original")}<p lang="pt-BR">${escape(a.alt)}</p></figcaption></figure>`).join("")}</div>`;
  }
  review += `</section>`;
}
review += `<h2>Editorial scenes and all placement crops</h2>`;
for (const a of editorial.assets) review += `<section><h3>${escape(a.id)}</h3><p lang="pt-BR">${escape(a.alt)}</p><p>${link(a.originalPath, "Original")} · ${escape(a.usage.join(", "))}</p>${a.crops.map((c) => `<figure><img loading="lazy" width="${c.width}" height="${c.height}" src="../../${escape(c.webPath)}" alt="${escape(a.alt)}"><figcaption>${escape(c.name)} · ${c.width} × ${c.height} · ${escape(c.usage.join(", "))}</figcaption></figure>`).join("")}</section>`;
review += `<h2>SVG identity assets</h2>${identity.assets.map((a) => `<p>${link(a.path, a.id)}</p>`).join("")}</main></html>\n`;
if (existingApproval) assert.equal(existingApproval.reviewSha256, digest(review), "Approved review changed; prepare a new revision for human review.");
await writeFile(root + "package-review.html", review);
await writeFile(root + "package-approval-request.json", JSON.stringify({ revision, status: "pending-human-review", manifestPath: root + "package-manifest.json", manifestSha256: digest(bytes), reviewPath: root + "package-review.html", reviewSha256: digest(review), reviewer: null, evidence: null, implementationAllowed: false, remainingGates: ["Complete-package human approval", "Storefront integration acceptance", "Release approval"] }, null, 2) + "\n");
console.log(`${revision}: validated ${files.size} files; 30 products, 42 colorways, 84 catalog photographs, eight editorial scenes, six SVG assets. ${existingApproval ? "Human package approval verified." : "Human package approval pending."}`);
