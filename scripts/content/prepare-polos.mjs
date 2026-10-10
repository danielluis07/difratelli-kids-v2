import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";

// Run from the repository root. Retains the approved baseline, applies only the
// agreed assortment changes and prepares exact files for human content review.
const revision = "issue-51-polos-v1";
const archive = "docs/content/catalog-revisions/pre-issue-51";
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const save = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const exists = async (path) => {
  try { await readFile(path); return true; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
};
const sourceIssue = "https://github.com/danielluis07/difratelli-kids-v2/issues/51";
const changedIds = ["product-002", "product-011"];
const snapshotNames = ["catalog-proposal.json", "approval.json", "review.md", "cast-manifest.json",
  ...["quintal", "brincadeira"].flatMap((name) => [
    `${name}-manifest.json`, `${name}-generation.json`, `${name}-approval.json`,
    `${name}-photography-review.md`, `${name}-contact-sheet.webp`,
  ])];
await mkdir(archive, { recursive: true });
// Never overwrite historical evidence, even when resuming an interrupted run.
for (const name of snapshotNames) {
  if (!await exists(`${archive}/${name}`)) await copyFile(`docs/content/${name}`, `${archive}/${name}`);
}
const baseline = await json(`${archive}/catalog-proposal.json`);
const oldApproval = await json(`${archive}/approval.json`);
assert.equal(oldApproval.status, "approved");
for (const file of oldApproval.files) {
  const path = file.path.endsWith("catalog-proposal.json") ? `${archive}/catalog-proposal.json` : file.path;
  assert.equal(hash(await readFile(path)), file.approvedSha256, `Historical approved hash: ${path}`);
}
const expectedCatalog = structuredClone(baseline);
expectedCatalog.revision = revision;
expectedCatalog.approvalStatus = "pending-human-review";
expectedCatalog.sourceIssue = sourceIssue;
expectedCatalog.previousRevision = baseline.revision;
expectedCatalog.assortmentApprovalSource = "docs/content/polo-assortment-approval.json";
expectedCatalog.categories.find((category) => category.id === "t-shirts").expectedCount = 6;
expectedCatalog.categories.splice(1, 0, { id: "polos", name: "Polos", expectedCount: 2, priceRangeCents: [7900, 7900] });
const definitions = [
  { id: "product-002", slug: "polo-lisa-do-quintal", name: "Polo Lisa do Quintal", pattern: "plain",
    colorwayId: "cream", colorwayName: "Creme", familyIds: ["cream"],
    colors: [{ name: "Creme", hex: "#F3EBDD" }],
    description: "Polo creme em piquê de algodão, com gola dobrada e dois botões no mesmo tom, para combinar com as descobertas do dia.",
    print: "Solid cream #F3EBDD throughout; no print, drawings, embroidery, logos or graphics.",
    placement: "Cream body, sleeves, collar and short center-front placket; two tonal cream buttons." },
  { id: "product-011", slug: "polo-listrada-da-rua", name: "Polo Listrada da Rua", pattern: "striped",
    colorwayId: "cream-sky", colorwayName: "Creme e azul-céu", familyIds: ["cream", "blue"],
    colors: [{ name: "Creme", hex: "#F3EBDD" }, { name: "Azul-céu", hex: "#A9CCE0" }],
    description: "Listras finas creme e azul-céu acompanham esta polo em piquê de algodão, com gola creme lisa e dois botões no mesmo tom.",
    print: "Narrow equal-width horizontal cream #F3EBDD and sky-blue #A9CCE0 stripes, approximately 6 mm per band, repeating across body and sleeves; no graphic motifs.",
    placement: "Cream and sky-blue striped body and sleeves; solid cream folded collar and short center-front placket; two tonal cream buttons." },
];
for (const definition of definitions) {
  const product = expectedCatalog.products.find((entry) => entry.id === definition.id);
  Object.assign(product, { slug: definition.slug, name: definition.name, categoryId: "polos",
    pattern: definition.pattern, priceCents: 7900, defaultColorwayId: definition.colorwayId,
    description: definition.description, composition: "100% algodão.",
    fitGuidance: "Modelagem reta e confortável, com mangas curtas e comprimento até o quadril.",
    colorways: [{ id: definition.colorwayId, name: definition.colorwayName, swatch: "#F3EBDD",
      colorFamilyIds: definition.familyIds, garmentColors: definition.colors }],
    garmentBrief: { language: "en", fabric: "100% cotton pique knit",
      silhouette: "Relaxed straight short-sleeve polo, hip length, soft folded collar and short center-front placket with exactly two tonal cream buttons; plain sleeve hems.",
      print: definition.print, colorPlacement: definition.placement,
      finishing: "Tonal stitching; no pockets, logos, slogans, embroidery, decorative graphics or contrasting trim. Preserve construction across sizes and both photograph roles.",
      contents: "One garment sold individually." } });
}
expectedCatalog.merchandising.homepage.categoryTiles.splice(1, 0, {
  categoryId: "polos", label: "Polos", productId: "product-002", href: "/produtos?categoria=polos", colorwayId: "cream",
});
const current = await json("docs/content/catalog-proposal.json");
if (current.revision !== revision) {
  assert.deepEqual(current, baseline, "Initial source must be the approved baseline.");
  await save("docs/content/catalog-proposal.json", expectedCatalog);
} else {
  // Final exact-file approval may change this flag, but no unreviewed content.
  assert.deepEqual({ ...current, approvalStatus: "pending-human-review" }, expectedCatalog, "Catalog differs from the approved assortment scope.");
}
const catalog = await json("docs/content/catalog-proposal.json");
if (!await exists("docs/content/polo-assortment-approval.json")) {
  await save("docs/content/polo-assortment-approval.json", {
    revision, status: "approved", sourceIssue, reviewer: "The user in this conversation",
    recordedAtUtc: new Date().toISOString(),
    evidence: "The user agreed to separate solid and striped products, two replacements and narrow horizontal stripes, then replied 'agree on all' to the exact replacements, colors, dedicated Polos category, fabric, fit, sizes and prices; subsequently confirmed implementation with 'yes'.",
    scope: "Assortment and garment direction only; exact Portuguese copy, four generated photographs and revised file hashes still require human review.",
    products: definitions.map((definition) => ({ productId: definition.id,
      replacesName: baseline.products.find((product) => product.id === definition.id).name,
      collectionId: baseline.products.find((product) => product.id === definition.id).collectionId,
      pattern: definition.pattern, colorwayId: definition.colorwayId, colors: definition.colors,
      priceCents: 7900, sizes: [2, 4, 6, 8], fabric: "100% cotton pique", fit: "Relaxed straight, short sleeves, two tonal buttons, no logos or contrasting trim" })),
    totals: { products: 30, colorways: 42, catalogPhotographs: 84, categories: 8 },
  });
}
assert.equal((await json("docs/content/polo-assortment-approval.json")).status, "approved");
assert.equal(catalog.products.length, 30);
assert.equal(catalog.products.reduce((count, product) => count + product.colorways.length, 0), 42);
for (const category of catalog.categories) assert.equal(catalog.products.filter((p) => p.categoryId === category.id).length, category.expectedCount);
assert.equal(new Set(catalog.products.map((p) => p.slug)).size, 30);
const productIds = new Set(catalog.products.map((product) => product.id));
assert.equal(productIds.size, 30);
for (const collection of catalog.collections) {
  const products = catalog.products.filter((product) => product.collectionId === collection.id);
  assert.equal(products.length, 10);
  assert.deepEqual(products.map((product) => product.id), collection.productIds);
  for (const [audience, count] of [["girls", 4], ["boys", 4], ["both", 2]]) assert.equal(products.filter((p) => p.audienceId === audience).length, count);
}
for (const product of catalog.products) {
  assert.deepEqual(product.sizes, [2, 4, 6, 8]);
  assert.equal(product.initialSize, null);
  assert(product.colorways.some((colorway) => colorway.id === product.defaultColorwayId));
  for (const id of product.coordinatingProductIds) assert(productIds.has(id));
}
for (const tile of catalog.merchandising.homepage.categoryTiles) {
  const product = catalog.products.find((p) => p.id === tile.productId);
  assert.equal(product.categoryId, tile.categoryId);
  assert(product.colorways.some((c) => c.id === tile.colorwayId));
}
const generation = await json("docs/content/polo-generation.json");
assert.equal(generation.records.length, 4);
const cast = await json("docs/content/cast-proposal.json");
const castApproval = await json("docs/content/cast-approval.json");
const editorial = await json("docs/content/editorial-manifest.json");
const assets = [];
const expectedPairs = new Set(changedIds.flatMap((id) => {
  const product = catalog.products.find((p) => p.id === id);
  return ["model", "isolated"].map((role) => `${id}/${product.defaultColorwayId}/${role}`);
}));
const visualApproval = await exists("docs/content/polo-approval.json") ? await json("docs/content/polo-approval.json") : null;
for (const record of generation.records) {
  assert(expectedPairs.delete(`${record.productId}/${record.colorwayId}/${record.role}`), "Unknown or duplicate polo association.");
  const product = catalog.products.find((p) => p.id === record.productId);
  const model = cast.models.find((m) => m.productIds.includes(product.id));
  const reference = castApproval.assets.find((asset) => asset.modelId === model.id);
  assert.equal(record.photographedSize, model.photographedSize);
  assert(record.prompt && record.alt && record.originalPath.startsWith("assets/originals/catalog/"));
  assert.equal(hash(await readFile(reference.originalPath)), reference.originalSha256);
  if (record.role === "model") {
    assert.equal(record.modelId, model.id);
    assert(record.referencePaths.includes(reference.originalPath));
  } else {
    assert.equal(record.modelId, null);
    const worn = generation.records.find((r) => r.productId === record.productId && r.role === "model");
    assert(record.referencePaths.includes(worn.originalPath));
  }
  const original = await readFile(record.originalPath);
  const metadata = await sharp(original).metadata();
  const collectionName = product.collectionId === "collection-001" ? "quintal" : "brincadeira";
  const resolution = (await json(`${archive}/${collectionName}-manifest.json`)).resolutionAcceptance;
  assert.equal(metadata.width * 4, metadata.height * 3);
  assert(metadata.width >= resolution.minimumWidth && metadata.height >= resolution.minimumHeight, "Native dimensions below accepted collection minimum.");
  assert((await sharp(original).stats()).isOpaque);
  const originalSha256 = hash(original);
  if (record.originalSha256) assert.equal(originalSha256, record.originalSha256, "Selected original changed.");
  const webPath = record.originalPath.replace("assets/originals/", "public/images/").replace(/\.png$/, ".webp");
  const web = await sharp(original).webp({ quality: 90 }).toBuffer();
  const encoded = await sharp(web).metadata();
  assert.equal(encoded.width, metadata.width);
  assert.equal(encoded.height, metadata.height);
  await writeFile(webPath, web);
  const webSha256 = hash(web);
  const approved = visualApproval?.status === "approved" && visualApproval.assets?.some((a) =>
    a.originalPath === record.originalPath && a.originalSha256 === originalSha256 && a.webPath === webPath && a.webSha256 === webSha256);
  record.originalSha256 = originalSha256;
  record.width = metadata.width;
  record.height = metadata.height;
  record.approvalStatus = approved ? "approved" : "pending-human-review";
  const references = [];
  for (const path of record.referencePaths) references.push({ inputPath: path, retainedPath: path, sha256: hash(await readFile(path)) });
  assets.push({ id: record.originalPath.split("/").at(-1).replace(/\.png$/, ""),
    productId: product.id, collectionId: product.collectionId, colorwayId: record.colorwayId,
    modelId: record.modelId, photographedSize: record.photographedSize, role: record.role,
    galleryOrder: record.role === "model" ? 1 : 2, approvalStatus: record.approvalStatus,
    approvalSource: approved ? "docs/content/polo-approval.json" : null, technicalStatus: "passed",
    originalPath: record.originalPath, originalSha256, webPath, webSha256,
    width: metadata.width, height: metadata.height, webWidth: encoded.width, webHeight: encoded.height,
    originalBytes: original.length, webBytes: web.length, references, crop: "full-frame",
    usage: record.role === "model" ? ["product-card-default", "product-gallery", "batch-review"] : ["product-card-hover-focus", "product-gallery", "batch-review"], alt: record.alt });
}
assert.equal(expectedPairs.size, 0);
generation.status = assets.every((asset) => asset.approvalStatus === "approved") ? "approved" : "pending-human-review";
await save("docs/content/polo-generation.json", generation);
await save("docs/content/polo-manifest.json", { revision, sourceIssue, technicalStatus: "passed", approvalStatus: generation.status, assets });

async function contactSheet(path, selected, columns = 4) {
  const tiles = [];
  for (const [index, asset] of selected.entries()) {
    const x = index % columns * 300, y = Math.floor(index / columns) * 440;
    tiles.push({ input: await sharp(asset.webPath).resize(300, 400).png().toBuffer(), left: x, top: y });
    const label = `${asset.productId} / ${asset.colorwayId} / ${asset.role}`;
    tiles.push({ input: Buffer.from(`<svg width="300" height="40"><rect width="300" height="40" fill="white"/><text x="8" y="24" font-family="Arial" font-size="11" fill="#352820">${label}</text></svg>`), left: x, top: y + 400 });
  }
  await sharp({ create: { width: columns * 300, height: Math.ceil(selected.length / columns) * 440, channels: 3, background: "white" } }).composite(tiles).webp({ quality: 90 }).toFile(path);
}
for (const name of ["quintal", "brincadeira"]) {
  const manifest = await json(`${archive}/${name}-manifest.json`);
  const oldBatchApproval = await json(`${archive}/${name}-approval.json`);
  // reviewedManifestSha256 predates the approval flags in the delivered manifest.
  // The approval's exact original/WebP hashes bind the approved photographs.
  for (const asset of manifest.assets) assert(oldBatchApproval.assets.some((approved) =>
    approved.originalPath === asset.originalPath && approved.originalSha256 === asset.originalSha256 &&
    approved.webPath === asset.webPath && approved.webSha256 === asset.webSha256), "Historical photograph lacks matching approval hashes.");
  const collectionProducts = catalog.products.filter((product) => product.collectionId === manifest.collectionId);
  manifest.assets = manifest.assets.flatMap((asset) => changedIds.includes(asset.productId)
    ? assets.filter((replacement) => replacement.productId === asset.productId && replacement.role === asset.role) : [asset]);
  const associations = new Set(collectionProducts.flatMap((p) => p.colorways.flatMap((c) => ["model", "isolated"].map((role) => `${p.id}/${c.id}/${role}`))));
  assert.equal(manifest.assets.length, 28);
  for (const asset of manifest.assets) {
    assert(associations.delete(`${asset.productId}/${asset.colorwayId}/${asset.role}`));
    assert.equal(hash(await readFile(asset.originalPath)), asset.originalSha256);
    assert.equal(hash(await readFile(asset.webPath)), asset.webSha256);
  }
  assert.equal(associations.size, 0);
  manifest.previousRevision = manifest.revision;
  manifest.revision = revision;
  manifest.approvalStatus = manifest.assets.every((a) => a.approvalStatus === "approved") ? "approved" : "pending-human-review";
  manifest.previousApprovalSnapshot = `${archive}/${name}-approval.json`;
  manifest.scope = manifest.approvalStatus === "approved"
    ? "Ten products and fourteen colorways, 28 approved active photographs. Prior approval covers 26 unchanged images; the replacement polo pair is approved in docs/content/polo-approval.json."
    : "Ten products and fourteen colorways, 28 active photographs. Prior approval covers 26 unchanged images; the replacement polo pair requires its own exact-file human approval.";
  await save(`docs/content/${name}-manifest.json`, manifest);
  const batchGeneration = await json(`${archive}/${name}-generation.json`);
  batchGeneration.previousRevision = batchGeneration.revision;
  batchGeneration.revision = revision;
  batchGeneration.sourceIssue = sourceIssue;
  batchGeneration.status = manifest.approvalStatus;
  batchGeneration.approvalStatus = manifest.approvalStatus;
  batchGeneration.scope = manifest.scope;
  batchGeneration.remainingGates = manifest.approvalStatus === "approved"
    ? ["Complete content, integration and release approvals"]
    : ["Exact polo pair and revised catalog human approval", "Complete content, integration and release approvals"];
  batchGeneration.records = batchGeneration.records.flatMap((record) => changedIds.includes(record.productId)
    ? generation.records.filter((replacement) => replacement.productId === record.productId && replacement.role === record.role) : [record]);
  await save(`docs/content/${name}-generation.json`, batchGeneration);
  await contactSheet(`docs/content/${name}-contact-sheet.webp`, manifest.assets);
  const rows = manifest.assets.filter((a) => a.role === "model").map((asset) => {
    const isolated = manifest.assets.find((a) => a.productId === asset.productId && a.colorwayId === asset.colorwayId && a.role === "isolated");
    const product = catalog.products.find((p) => p.id === asset.productId);
    return `| ${product.id} — ${product.name} | ${asset.colorwayId} | [Model](../../${asset.webPath}) | [Isolated](../../${isolated.webPath}) | ${asset.approvalStatus} |`;
  });
  await writeFile(`docs/content/${name}-photography-review.md`, `# ${name} photography — issue #51 revision\n\nRevision: \`${revision}\`. ${manifest.scope}\n\nSee [polo review](polo-review.md) for the replacement assortment and exact approval request. Earlier review and approval evidence is retained in [the historical snapshot](catalog-revisions/pre-issue-51/${name}-approval.json).\n\n![Current collection photographs](${name}-contact-sheet.webp)\n\n| Product | Colorway | Worn | Isolated | Approval |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
}
const activeAssociations = new Set(catalog.products.flatMap((p) => p.colorways.flatMap((c) =>
  ["model", "isolated"].map((role) => `${p.id}/${c.id}/${role}`))));
assert.equal(activeAssociations.size, 84);
for (const name of ["quintal", "brincadeira", "imaginacao"]) {
  const manifest = await json(`docs/content/${name}-manifest.json`);
  for (const asset of manifest.assets) {
    assert(activeAssociations.delete(`${asset.productId}/${asset.colorwayId}/${asset.role}`), "Unknown or duplicate active catalog photograph.");
    assert.equal(hash(await readFile(asset.originalPath)), asset.originalSha256);
    assert.equal(hash(await readFile(asset.webPath)), asset.webSha256);
  }
}
assert.equal(activeAssociations.size, 0, "Incomplete active catalog photography.");
const castManifest = await json(`${archive}/cast-manifest.json`);
castManifest.catalogRevision = revision;
castManifest.assignmentRevisionSource = "docs/content/polo-assortment-approval.json";
for (const asset of castManifest.assets) for (const assignment of asset.colorwayAssignments) {
  if (changedIds.includes(assignment.productId)) assignment.colorwayIds = catalog.products.find((p) => p.id === assignment.productId).colorways.map((c) => c.id);
}
await save("docs/content/cast-manifest.json", castManifest);
// Editorial originals and every delivered crop must remain byte-identical.
for (const asset of editorial.assets) {
  if (asset.originalSha256) assert.equal(hash(await readFile(asset.originalPath)), asset.originalSha256);
  for (const crop of asset.crops ?? []) {
    if (crop.sha256) assert.equal(hash(await readFile(crop.webPath)), crop.sha256);
  }
}
await contactSheet("docs/content/polo-contact-sheet.webp", assets);
const cards = definitions.map((definition) => {
  const product = catalog.products.find((p) => p.id === definition.id);
  const photos = assets.filter((a) => a.productId === product.id);
  return `<section><h2>${product.name}</h2><p>${product.description}</p><p>R$ 79,00 · Tamanhos 2, 4, 6 e 8 · ${product.composition}</p><p>${product.fitGuidance}</p><div class="photos">${photos.map((asset) => `<figure><a href="../../${asset.webPath}"><img src="../../${asset.webPath}" width="${asset.width}" height="${asset.height}" alt="${asset.alt}"></a><figcaption>${asset.role === "model" ? "Model" : "Isolated"} · ${asset.width} × ${asset.height} · <a href="../../${asset.originalPath}">Original PNG</a></figcaption></figure>`).join("")}</div></section>`;
}).join("");
const reviewStatus = generation.status === "approved" && catalog.approvalStatus === "approved"
  ? "Exact copy and photographs approved by the user."
  : "Exact copy and photographs pending human review.";
await writeFile("docs/content/polo-review.html", `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue #51 polo review</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:1100px;margin:auto;padding:24px;color:#352820;background:#faf8f4}section{margin:32px 0}h1,h2{line-height:1.2}.photos{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{width:100%;height:auto;background:white}a{color:#245e64}figcaption{font-size:14px}@media(max-width:600px){.photos{grid-template-columns:1fr}}</style><main><h1>Two replacement polos — issue #51</h1><p>Revision: ${revision}. ${reviewStatus} Click each photograph to inspect the full WebP; originals and complete provenance are retained.</p><p>30 products · 42 colorways · 84 active catalog photographs · 6 T-shirts and 2 polos. Earlier editorial imagery remains unchanged.</p>${cards}<p><a href="polo-approval-request.json">Exact revision and asset hashes</a> · <a href="polo-generation.json">Built-in imagegen prompts and references</a> · <a href="polo-review.md">Assortment and approval scope</a></p></main></html>\n`);
const contentHash = hash(await readFile("docs/content/catalog-proposal.json"));
const files = ["catalog-proposal.json", "polo-manifest.json", "quintal-manifest.json", "brincadeira-manifest.json", "cast-manifest.json"];
const requestFiles = [];
for (const name of files) requestFiles.push({ path: `docs/content/${name}`, reviewedSha256: hash(await readFile(`docs/content/${name}`)) });
if (!visualApproval) await save("docs/content/polo-approval-request.json", { revision, status: generation.status,
  sourceIssue, scope: "Exact Portuguese polo names, copy and garment briefs, revised catalog/category tile and cast colorway associations, four exact polo photographs and both revised collection selections. Original editorial imagery remains unchanged.",
  files: requestFiles, assets, remainingGates: ["Human approval of this exact revision", "Complete content, integration and release approval"] });
if ((await json("docs/content/approval.json")).revision !== revision) {
  await save("docs/content/approval.json", { revision, status: "pending-human-review", sourceIssue,
    previousApprovalSnapshot: `${archive}/approval.json`, assortmentApprovalSource: "docs/content/polo-assortment-approval.json",
    scope: "Revised catalog content. Earlier approval remains valid for unchanged copy and historical catalog; assortment approval does not approve exact revised files or photographs.",
    files: [{ path: "docs/content/catalog-proposal.json", reviewedSha256: contentHash },
      oldApproval.files.find((file) => file.path.endsWith("copy-proposal.json"))],
    remainingGates: ["Exact revised catalog and polo photographs require human review", "Complete content, integration and release approvals"] });
}
console.log("Verified 30 products, 42 colorways, eight category totals, four native original/WebP pairs, all 84 active catalog photographs, approved child references, retained approval hashes and unchanged editorial assets. Polo review status: " + generation.status);
