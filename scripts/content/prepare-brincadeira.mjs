import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Run from the repository root. This exports retained originals and measures
// every file; it never generates photographs or invents human approvals.
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const fail = (message) => { throw new Error(message); };
const generation = await readJson("docs/content/brincadeira-generation.json");
const catalog = await readJson("docs/content/catalog-proposal.json");
const contentApproval = await readJson("docs/content/approval.json");
const cast = await readJson("docs/content/cast-proposal.json");
const castApproval = await readJson("docs/content/cast-approval.json");
const resolution = await readJson("docs/content/brincadeira-resolution-acceptance.json");
if (resolution.status !== "accepted" || resolution.collectionId !== "collection-002" || resolution.minimumWidth !== 1086 || resolution.minimumHeight !== 1448) {
  fail("Missing explicit Brincadeira native-resolution acceptance.");
}
for (const file of contentApproval.files) {
  if (hash(await readFile(file.path)) !== file.approvedSha256) fail(`${file.path}: approved content hash changed.`);
}
let batchApproval = null;
try {
  batchApproval = await readJson("docs/content/brincadeira-approval.json");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const products = catalog.products.filter((product) => product.collectionId === "collection-002");
if (products.length !== 10 || products.reduce((count, product) => count + product.colorways.length, 0) !== 14) {
  fail("Brincadeira requires ten products and fourteen colorways.");
}
if (generation.records.length !== 28) fail("Brincadeira requires exactly 28 selected photographs.");
const expected = new Set(products.flatMap((product) => product.colorways.flatMap((colorway) =>
  ["model", "isolated"].map((role) => `${product.id}/${colorway.id}/${role}`))));
if (contentApproval.status !== "approved" || castApproval.status !== "approved") fail("Approved catalog and cast are required.");
const assets = [];
await mkdir("public/images/catalog", { recursive: true });
for (const record of generation.records) {
  const key = `${record.productId}/${record.colorwayId}/${record.role}`;
  if (!expected.delete(key)) fail(`${key}: unknown or duplicate association.`);
  const product = products.find((product) => product.id === record.productId);
  const model = cast.models.find((model) => model.productIds.includes(product.id));
  const reference = castApproval.assets.find((asset) => asset.modelId === model.id);
  if (record.photographedSize !== model.photographedSize || !product.sizes.includes(record.photographedSize)) fail(`${key}: wrong photographed size.`);
  if (record.role === "model" && (record.modelId !== model.id || !record.referencePaths.includes(reference.originalPath))) fail(`${key}: wrong child reference.`);
  if (hash(await readFile(reference.originalPath)) !== reference.originalSha256) fail(`${key}: approved child reference changed.`);
  if (record.role === "isolated") {
    const worn = generation.records.find((entry) => entry.productId === record.productId && entry.colorwayId === record.colorwayId && entry.role === "model");
    if (!record.referencePaths.includes(worn.originalPath)) fail(`${key}: isolated image must reference exact selected worn image.`);
  }
  if (!record.prompt || !record.alt || !record.originalPath.startsWith("assets/originals/catalog/")) fail(`${key}: missing provenance, alt or original path.`);
  const original = await readFile(record.originalPath);
  const source = await sharp(original).metadata();
  if (source.width * 4 !== source.height * 3 || source.width < resolution.minimumWidth || source.height < resolution.minimumHeight) fail(`${key}: invalid native dimensions.`);
  if (!(await sharp(original).stats()).isOpaque) fail(`${key}: catalog background must be opaque.`);
  const webPath = record.originalPath.replace("assets/originals/", "public/images/").replace(/\.png$/, ".webp");
  const web = await sharp(original).webp({ quality: 90 }).toBuffer();
  const encoded = await sharp(web).metadata();
  if (source.width !== encoded.width || source.height !== encoded.height) fail(`${key}: WebP changed dimensions.`);
  const originalSha256 = hash(original), webSha256 = hash(web);
  if (record.originalSha256 !== originalSha256) fail(`${key}: selected original hash changed since generation.`);
  const approvalMatches = (approval) => approval?.status === "approved" && approval.assets?.some((asset) =>
    asset.originalPath === record.originalPath && asset.originalSha256 === originalSha256 && asset.webPath === webPath && asset.webSha256 === webSha256);
  const approved = approvalMatches(batchApproval);
  await writeFile(webPath, web);
  const references = [];
  for (const path of record.referencePaths) {
    const retainedPath = path;
    references.push({ inputPath: path, retainedPath, sha256: hash(await readFile(retainedPath)) });
  }
  assets.push({
    id: record.originalPath.split("/").at(-1).replace(/\.png$/, ""),
    productId: record.productId, collectionId: product.collectionId, colorwayId: record.colorwayId,
    modelId: record.modelId, photographedSize: record.photographedSize, role: record.role,
    galleryOrder: record.role === "model" ? 1 : 2,
    approvalStatus: approved ? "approved" : "pending-human-review",
    approvalSource: approved ? "docs/content/brincadeira-approval.json" : null,
    technicalStatus: "passed", originalPath: record.originalPath, originalSha256, webPath, webSha256,
    width: source.width, height: source.height, webWidth: encoded.width, webHeight: encoded.height,
    originalBytes: original.length, webBytes: web.length, references, crop: "full-frame",
    usage: record.role === "model" ? ["product-card-default", "product-gallery", "batch-review"] : ["product-card-hover-focus", "product-gallery", "batch-review"],
    alt: record.alt,
  });
}
if (expected.size) fail("Missing required photograph associations.");
const originals = (await readdir("assets/originals/catalog")).filter((file) => file.endsWith(".png") && file.match(/^product-01[1-9]-|^product-020-/));
const exports = (await readdir("public/images/catalog")).filter((file) => file.endsWith(".webp") && file.match(/^product-01[1-9]-|^product-020-/));
if (originals.length !== 28 || exports.length !== 28) fail("Selected Brincadeira folders must contain exactly 28 originals and 28 exports.");
const manifest = {
  revision: generation.revision, collectionId: "collection-002", technicalStatus: "passed",
  approvalStatus: assets.every((asset) => asset.approvalStatus === "approved") ? "approved" : "pending-human-review",
  scope: "All ten Brincadeira products and fourteen colorways, model first and isolated second. Complete-content and release gates are separate.",
  resolutionAcceptance: resolution, assets,
};
await writeFile("docs/content/brincadeira-manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
const tiles = [];
for (const [index, asset] of assets.entries()) {
  const x = (index % 4) * 300, y = Math.floor(index / 4) * 440;
  tiles.push({ input: await sharp(asset.webPath).resize(300, 400).png().toBuffer(), left: x, top: y });
  const label = `${asset.productId} / ${asset.colorwayId} / ${asset.role}`;
  const caption = Buffer.from(`<svg width="300" height="40"><rect width="300" height="40" fill="white"/><text x="8" y="24" font-family="Arial" font-size="11" fill="#352820">${label}</text></svg>`);
  tiles.push({ input: caption, left: x, top: y + 400 });
}
await sharp({ create: { width: 1200, height: 3080, channels: 3, background: "white" } })
  .composite(tiles).webp({ quality: 90 }).toFile("docs/content/brincadeira-contact-sheet.webp");
console.log(`Verified ${products.length} products, 14 colorways, ${assets.length} original/WebP pairs, exact native 3:4, opacity, references, hashes and alt text. ${assets.filter((asset) => asset.approvalStatus === "approved").length} photographs approved; ${assets.filter((asset) => asset.approvalStatus !== "approved").length} pending human review.`);
