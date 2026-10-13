import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";

const revision = "issue-34-content-v1";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const generation = JSON.parse(await readFile("docs/content/homepage-generation.json", "utf8"));
const editorial = JSON.parse(await readFile("docs/content/editorial-manifest.json", "utf8"));
const catalog = JSON.parse(await readFile("docs/content/catalog-proposal.json", "utf8"));
const cast = JSON.parse(await readFile("docs/content/cast-manifest.json", "utf8"));
await mkdir("assets/originals/homepage", { recursive: true });
await mkdir("public/images/homepage", { recursive: true });

// Never replace approved bytes or a retained source with a different generation.
try {
  const approval = JSON.parse(await readFile("docs/content/homepage-approval.json", "utf8"));
  if (approval.status === "approved" && approval.revision === revision) {
    for (const file of approval.files) {
      if (hash(await readFile(file.path)) !== file.sha256) throw new Error(`Approved file changed: ${file.path}`);
    }
    console.log("Preserved approved homepage content; hashes match.");
    process.exit(0);
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }

const specs = {
  "category-t-shirts": ["Lia no quintal com camiseta creme estampada com sementes e brotos e short verde-petróleo.", "product-003", "model-001"],
  "category-polos": ["Miguel no pátio com polo lisa creme e short verde-petróleo.", "product-002", "model-005"],
  "category-tops": ["Bia no jardim com blusa creme estampada com folhas e besouros e short verde-petróleo.", "product-004", "model-002"],
  "category-shorts": ["Lia no pátio com short verde-folha e camiseta creme.", "product-007", "model-001"],
  "category-trousers": ["Theo no caminho do jardim com calça verde-folha e camiseta creme.", "product-009", "model-007"],
  "category-matching-sets": ["Davi no quintal com conjunto de camiseta creme estampada e short verde-petróleo.", "product-006", "model-006"],
  "category-light-layers": ["Noah no jardim com casaco leve verde-petróleo sobre camiseta creme.", "product-010", "model-008"],
  "category-dresses": ["Iara no pátio com vestido azul-claro estampado com riscos de giz creme e coral.", "product-014", "model-004"],
  "hero-left-wide": ["Bia observa uma folha no quintal com vestido creme de folhas verdes e amarelas; a parede clara ocupa o lado esquerdo.", "product-005", "model-002"],
  "hero-right-wide": ["Davi observa um besourinho no jardim, com polo lisa creme e short areia.", "product-002", "model-006"],
  "look-quintal": ["Camiseta de folhas, polo creme e shorts verde-folha e verde-petróleo sobre tecido claro.", ["product-001", "product-002", "product-007", "product-008"]],
  "look-brincadeira": ["Polo listrada, camiseta com riscos de giz e shorts azul-claro e coral sobre tecido claro.", ["product-011", "product-012", "product-018", "product-019"]],
  "look-imaginacao": ["Camisetas de blocos e estrelas, short pêssego e calça lilás sobre tecido claro.", ["product-021", "product-022", "product-028", "product-030"]],
  "quote-garments": ["Vestido creme com folhas verdes e amarelas sobre tecido claro, com espaço livre à esquerda.", "product-005"],
  "editorial-quintal": ["Peças creme e verdes de Quintal de Descobertas sobre tecido claro, com espaço livre à direita.", ["product-001", "product-002", "product-007", "product-008"]],
};
const assets = [];
async function crop(asset, name, ratio, focusX = 0.5, focusY = 0.5) {
  const bytes = await readFile(asset.originalPath);
  const unit = Math.floor(Math.min(asset.width / ratio[0], asset.height / ratio[1]));
  const width = unit * ratio[0], height = unit * ratio[1];
  const sourceRect = { left: Math.round((asset.width - width) * focusX), top: Math.round((asset.height - height) * focusY), width, height };
  const webPath = `public/images/homepage/${asset.id}-${name}-v1.webp`;
  const web = await sharp(bytes).extract(sourceRect).webp({ quality: 90 }).toBuffer();
  await writeFile(webPath, web);
  const measured = await sharp(web).metadata();
  if (measured.width !== width || measured.height !== height) throw new Error(`Crop dimensions changed: ${webPath}`);
  asset.crops.push({ name, ratio: ratio.join(":"), sourceRect, width, height, webPath, src: webPath.replace(/^public/, ""), sha256: hash(web), bytes: web.length, usage: [asset.role], approvalStatus: "pending-human-review" });
}
for (const record of generation.records) {
  const originalPath = `assets/originals/homepage/${record.id}-v1.png`;
  let bytes;
  try { bytes = await readFile(originalPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
  if (!bytes) { await copyFile(record.sourcePath, originalPath); bytes = await readFile(originalPath); }
  try {
    if (hash(await readFile(record.sourcePath)) !== hash(bytes)) throw new Error(`Retained original differs: ${originalPath}`);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  // Retained originals allow reproduction without the producer's output folder.
  const metadata = await sharp(bytes).metadata();
  if (!(await sharp(bytes).stats()).isOpaque) throw new Error(`Non-opaque photo: ${record.id}`);
  const [alt, products, model] = specs[record.id];
  const productIds = Array.isArray(products) ? products : [products];
  const role = record.id.startsWith("category-") ? "category-tile" : record.id.startsWith("look-") ? "shop-the-look" : record.id;
  const asset = { id: record.id, role, productIds, modelIds: model ? [model] : [], collectionIds: [...new Set(productIds.map(id => catalog.products.find(p => p.id === id).collectionId))], originalPath, originalSha256: hash(bytes), width: metadata.width, height: metadata.height, originalBytes: bytes.length, alt, usage: [role], references: await Promise.all(record.referencePaths.map(async path => ({ path, sha256: hash(await readFile(path)) }))), crops: [], approvalStatus: "pending-human-review", technicalStatus: "passed" };
  if (record.id.startsWith("hero-")) {
    await crop(asset, "desktop", [3, 2]);
    asset.garmentContext = "Approved editorial wardrobe continuity; not a catalog product representation or reassignment.";
    asset.textSafeArea = record.id === "hero-left-wide" ? { desktop: "left 60%; use localized dark gradient for white copy" } : null;
  }
  else if (role === "category-tile") await crop(asset, "portrait", [3, 4]);
  else if (role === "shop-the-look") await crop(asset, "landscape", [4, 3]);
  else { await crop(asset, "desktop", [16, 9]); await crop(asset, "compact", [4, 3], role === "quote-garments" ? 1 : 0); }
  if (role === "quote-garments") asset.textSafeArea = { desktop: "left 40%", compact: "place copy below photograph" };
  if (role === "editorial-quintal") asset.textSafeArea = { desktop: "right 38%", compact: "place copy below photograph" };
  assets.push(asset);
}

async function reuse(id, role, sourceId, variants) {
  const source = editorial.assets.find(a => a.id === sourceId);
  if (!source || source.approvalStatus !== "approved") throw new Error(`Unapproved reuse: ${sourceId}`);
  const asset = { ...source, id, role, usage: [role], references: [{ path: source.originalPath, sha256: source.originalSha256 }], reuse: { sourceManifest: "docs/content/editorial-manifest.json", sourceId, sourceApproval: "docs/content/editorial-approval.json" }, crops: [], approvalStatus: "pending-human-review" };
  for (const v of variants) await crop(asset, ...v);
  assets.push(asset);
}
// Reuse original photographs; every new crop remains subject to this review.
await reuse("hero-left", "homepage-hero-left", "hero-left-v2", [["narrow", [4, 5], 0.5, 0], ["portrait", [3, 4], 0.9, 0]]);
await reuse("hero-left-tablet", "homepage-hero-tablet", "hero-left-v2", []);
// The approved wide tablet derivative preserves the subject at intermediate widths.
const tablet = assets.at(-1);
const tabletSource = editorial.assets.find(a => a.id === "hero-left-v2").crops.find(c => c.name === "tablet").derivative;
if (tabletSource) {
  tablet.originalPath = tabletSource.originalPath;
  tablet.originalSha256 = tabletSource.originalSha256;
  tablet.width = tabletSource.width; tablet.height = tabletSource.height;
  tablet.originalBytes = (await readFile(tablet.originalPath)).length;
  tablet.references = [{ path: tabletSource.originalPath, sha256: tabletSource.originalSha256 }];
  tablet.crops = []; await crop(tablet, "tablet", [2, 1]);
}
await reuse("hero-right", "homepage-hero-right", "hero-right-v3", [["narrow", [4, 5], 0.5, 0]]);
const socialSources = ["hero-left-v2", "hero-right-v3", "collection-quintal-v2", "collection-brincadeira-v2", "collection-imaginacao-v2", "brand-opening-v2", "brand-play-v2"];
for (const [i, id] of socialSources.entries()) await reuse(`social-${i + 1}`, "social-photo", id, [["square", [1, 1], 0.5, i === 1 ? 0 : 0.2]]);

const manifest = { revision, sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/34", approvalStatus: "pending-human-review", implementationAllowed: false, technicalStatus: "passed", assets, existingPageAssets: editorial.assets.filter(a => a.role === "collection" || a.role.startsWith("brand-")).map(a => ({ id: a.id, manifest: "docs/content/editorial-manifest.json", approval: "docs/content/editorial-approval.json", originalSha256: a.originalSha256 })), castCoverage: [...new Set(assets.flatMap(a => a.modelIds))].sort() };
if (cast.assets.some(a => !manifest.castCoverage.includes(a.modelId))) throw new Error("Missing cast identity in content package.");
await writeFile("docs/content/homepage-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
const thumbs = await Promise.all(assets.map(async (a, i) => ({ input: await sharp(a.crops[0].webPath).resize(240, 240, { fit: "contain", background: "#FAF7F0" }).toBuffer(), left: (i % 5) * 240, top: Math.floor(i / 5) * 240 })));
await sharp({ create: { width: 1200, height: Math.ceil(assets.length / 5) * 240, channels: 3, background: "#FAF7F0" } }).composite(thumbs).webp({ quality: 90 }).toFile("docs/content/homepage-contact-sheet.webp");
console.log(`Prepared ${assets.length} assets and ${assets.reduce((n, a) => n + a.crops.length, 0)} WebP crops; approval pending.`);
