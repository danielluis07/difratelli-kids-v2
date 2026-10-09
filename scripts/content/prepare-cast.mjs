import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

// Run from the repository root: bun scripts/content/prepare-cast.mjs
// Originals and generation records must already exist. This script never
// generates identities, changes approval decisions, or overwrites originals.
const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const proposal = await readJson("docs/content/cast-proposal.json");
const catalog = await readJson("docs/content/catalog-proposal.json");
const generation = await readJson("docs/content/cast-generation.json");
const fail = (message) => { throw new Error(message); };
const hash = (data) => createHash("sha256").update(data).digest("hex");

if (proposal.models.length !== 8) fail("Cast must contain eight models.");
for (const audience of ["girls", "boys"]) {
  if (proposal.models.filter((model) => model.audienceId === audience).length !== 4) {
    fail(`Cast must contain four ${audience}.`);
  }
}
const productIds = new Set(catalog.products.map((product) => product.id));
const assigned = new Set();
const modelIds = new Set();
for (const model of proposal.models) {
  if (modelIds.has(model.id)) fail(`Duplicate model: ${model.id}`);
  modelIds.add(model.id);
  if (!Number.isInteger(model.age) || model.age < 2 || model.age > 8) fail(`${model.id}: invalid age`);
  if (!catalog.products.every((product) => product.sizes.includes(model.photographedSize))) fail(`${model.id}: invalid size`);
  for (const id of model.productIds) {
    if (!productIds.has(id) || assigned.has(id)) fail(`${model.id}: unknown or duplicate product ${id}`);
    const product = catalog.products.find((entry) => entry.id === id);
    if (product.audienceId !== "both" && product.audienceId !== model.audienceId) fail(`${id}: audience mismatch`);
    assigned.add(id);
  }
}
if (assigned.size !== productIds.size) fail("Assignments must cover the complete catalog.");
if (generation.records.length !== 8 || new Set(generation.records.map((entry) => entry.modelId)).size !== 8) fail("Generation records must cover eight unique models.");

await mkdir(resolve(root, "public/images/cast"), { recursive: true });
const assets = [];
const tiles = [];
for (const [index, model] of proposal.models.entries()) {
  const record = generation.records.find((entry) => entry.modelId === model.id);
  if (!record) fail(`${model.id}: missing generation record`);
  const original = await readFile(resolve(root, record.originalPath));
  const source = await sharp(original).metadata();
  if (source.width * 4 !== source.height * 3) fail(`${model.id}: casting reference must be 3:4`);
  const referenceVersion = record.referenceVersion ?? 1;
  const webPath = `public/images/cast/${model.id}-reference-v${referenceVersion}.webp`;
  const web = await sharp(original).webp({ quality: 90 }).toBuffer();
  await writeFile(resolve(root, webPath), web);
  const encoded = await sharp(web).metadata();
  if (encoded.width !== source.width || encoded.height !== source.height) fail(`${model.id}: export changed dimensions`);
  const products = catalog.products.filter((product) => model.productIds.includes(product.id));
  assets.push({
    id: `${model.id}-reference-v${referenceVersion}`, modelId: model.id, role: "cast-reference",
    approvalStatus: model.approvalStatus, originalPath: record.originalPath,
    originalSha256: hash(original), webPath, webSha256: hash(web),
    width: source.width, height: source.height,
    crop: "full-frame", usage: ["cast-review", "identity-reference"],
    alt: `Referência de ${model.name}, modelo infantil fictício de ${model.age} anos, com camiseta creme e short verde-petróleo sobre fundo branco.`,
    productIds: model.productIds,
    collectionIds: [...new Set(products.map((product) => product.collectionId))],
    colorwayAssignments: products.map((product) => ({ productId: product.id, colorwayIds: product.colorways.map((colorway) => colorway.id) })),
  });
  const tile = await sharp(web).resize(300, 400).png().toBuffer();
  tiles.push({ input: tile, left: (index % 4) * 300, top: Math.floor(index / 4) * 400 });
}
const manifest = {
  revision: proposal.revision, approvalStatus: proposal.approvalStatus,
  scope: "Cast references only; no catalog photographs or sample-pair approval.",
  assets,
};
await writeFile(resolve(root, "docs/content/cast-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await sharp({ create: { width: 1200, height: 800, channels: 3, background: "white" } })
  .composite(tiles).webp({ quality: 90 }).toFile(resolve(root, "docs/content/cast-contact-sheet.webp"));
console.log(`Prepared ${assets.length} cast references; verified 30 product and ${assets.reduce((total, asset) => total + asset.colorwayAssignments.reduce((count, product) => count + product.colorwayIds.length, 0), 0)} colorway assignments. Cast approval status: ${proposal.approvalStatus}.`);
