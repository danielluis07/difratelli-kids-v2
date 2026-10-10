import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Exports explicit placement crops without changing the retained AI originals.
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const generation = JSON.parse(await readFile("docs/content/editorial-generation.json", "utf8"));
// An approved revision is immutable; a new revision requires a fresh review.
let approval;
try {
  approval = JSON.parse(await readFile("docs/content/editorial-approval.json", "utf8"));
} catch (error) { if (error.code !== "ENOENT") throw error; }
if (approval?.status === "approved" && approval.revision === generation.revision) {
  for (const file of approval.files) {
    if (hash(await readFile(file.path)) !== file.sha256) throw new Error(`${file.path}: approved file changed; prepare a new revision for review.`);
  }
  console.log(`Preserved approved editorial revision ${generation.revision}; all approved file hashes match.`);
  process.exit(0);
}
if (generation.records.length !== 8 || new Set(generation.records.map((r) => r.id)).size !== 8) throw new Error("Expected eight distinct editorial photographs.");
await mkdir("assets/originals/editorial", { recursive: true });
await mkdir("public/images/editorial", { recursive: true });
const assets = [];
for (const record of generation.records) {
  const version = record.version ?? 1;
  const originalPath = `assets/originals/editorial/${record.id}-v${version}.png`;
  const sourceBytes = await readFile(record.sourcePath);
  // Refuse to overwrite a retained original with a different generation.
  try {
    if (hash(await readFile(originalPath)) !== hash(sourceBytes)) throw new Error(`${originalPath}: retained original differs.`);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  await copyFile(record.sourcePath, originalPath);
  const metadata = await sharp(sourceBytes).metadata();
  if (!(await sharp(sourceBytes).stats()).isOpaque) throw new Error(`${record.id}: editorial photo must be opaque.`);
  const crops = [];
  for (const variant of record.variants) {
    let cropBytes = sourceBytes, cropMetadata = metadata, derivative = null;
    if (variant.sourcePath) {
      cropBytes = await readFile(variant.sourcePath);
      cropMetadata = await sharp(cropBytes).metadata();
      try {
        if (hash(await readFile(variant.originalPath)) !== hash(cropBytes)) throw new Error(`${variant.originalPath}: retained derivative differs.`);
      } catch (error) { if (error.code !== "ENOENT") throw error; }
      await copyFile(variant.sourcePath, variant.originalPath);
      derivative = { originalPath: variant.originalPath, originalSha256: hash(cropBytes), width: cropMetadata.width, height: cropMetadata.height, bytes: cropBytes.length, prompt: variant.prompt, referencePaths: variant.referencePaths, tool: "built-in image_gen" };
    }
    const [rw, rh] = variant.ratio;
    const unit = Math.floor(Math.min(cropMetadata.width / rw, cropMetadata.height / rh));
    const width = unit * rw, height = unit * rh;
    const left = Math.round((cropMetadata.width - width) * (variant.focusX ?? 0.5));
    const top = Math.round((cropMetadata.height - height) * (variant.focusY ?? 0.5));
    const webPath = `public/images/editorial/${record.id}-${variant.name}-v${version}.webp`;
    const web = await sharp(cropBytes).extract({ left, top, width, height }).webp({ quality: 90 }).toBuffer();
    await writeFile(webPath, web);
    const encoded = await sharp(web).metadata();
    if (encoded.width !== width || encoded.height !== height || width * rh !== height * rw) throw new Error(`${webPath}: crop ratio changed.`);
    crops.push({ name: variant.name, ratio: `${rw}:${rh}`, sourceRect: { left, top, width, height }, derivative, width, height, webPath, src: webPath.replace(/^public/, ""), sha256: hash(web), bytes: web.length, usage: variant.usage, approvalStatus: "pending-human-review" });
  }
  assets.push({ id: `${record.id}-v${version}`, role: record.role, collectionIds: record.collectionIds, modelIds: record.modelIds, originalPath, originalSha256: hash(sourceBytes), width: metadata.width, height: metadata.height, originalBytes: sourceBytes.length, alt: record.alt, usage: record.usage, references: await Promise.all(record.referencePaths.map(async (path) => ({ path, sha256: hash(await readFile(path)) }))), crops, textSafeArea: record.textSafeArea ?? null, approvalStatus: "pending-human-review", technicalStatus: "passed", visualReview: "See editorial-review.md; human approval remains pending." });
  if (record.garmentContext) assets.at(-1).garmentContext = record.garmentContext;
}
await writeFile("docs/content/editorial-manifest.json", JSON.stringify({ revision: generation.revision, sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/28", approvalStatus: "pending-human-review", technicalStatus: "passed", assets }, null, 2) + "\n");

// Both approvals remain separate and bind to the exact reviewed files.
const identity = JSON.parse(await readFile("docs/content/identity-manifest.json", "utf8"));
const approvalRequest = (scope, files, revision = generation.revision) => ({ revision, scope, status: "pending-human-review", reviewer: null, evidence: null, recordedAtUtc: null, requestedCorrections: [], acceptedExceptions: [], files });
await writeFile("docs/content/editorial-approval-request.json", JSON.stringify(approvalRequest("Eight editorial scenes, retained tablet art-direction derivative, all placement crops and Portuguese alt text", [{ path: "docs/content/editorial-manifest.json", sha256: hash(await readFile("docs/content/editorial-manifest.json")) }, ...assets.flatMap((a) => [{ path: a.originalPath, sha256: a.originalSha256 }, ...a.crops.flatMap((c) => [{ path: c.webPath, sha256: c.sha256 }, ...(c.derivative ? [{ path: c.derivative.originalPath, sha256: c.derivative.originalSha256 }] : [])])])]), null, 2) + "\n");
await writeFile("docs/content/identity-approval-request.json", JSON.stringify(approvalRequest("Brown/white wordmarks, three decorative motifs and favicon as editable SVG", [{ path: "docs/content/identity-manifest.json", sha256: hash(await readFile("docs/content/identity-manifest.json")) }, ...identity.assets.map((a) => ({ path: a.path, sha256: a.sha256 }))], identity.revision), null, 2) + "\n");

const tiles = [];
for (const asset of assets) {
  const web = await sharp(asset.crops[0].webPath).resize(400, 300, { fit: "contain", background: "#FAF7F0" }).toBuffer();
  const label = Buffer.from(`<svg width="400" height="34"><rect width="400" height="34" fill="#FAF7F0"/><text x="12" y="23" font-family="sans-serif" font-size="15" fill="#382C25">${asset.id}</text></svg>`);
  tiles.push(await sharp({ create: { width: 400, height: 334, channels: 3, background: "#FAF7F0" } }).composite([{ input: web, top: 0, left: 0 }, { input: label, top: 300, left: 0 }]).png().toBuffer());
}
await sharp({ create: { width: 1600, height: 668, channels: 3, background: "#FAF7F0" } }).composite(tiles.map((input, i) => ({ input, left: (i % 4) * 400, top: Math.floor(i / 4) * 334 }))).webp({ quality: 90 }).toFile("docs/content/editorial-contact-sheet.webp");

const identityTiles = [];
for (const asset of identity.assets) {
  const white = asset.id.includes("white");
  const input = await sharp(asset.path).resize(600, 180, { fit: "contain", background: white ? "#382C25" : "#FAF7F0" }).png().toBuffer();
  const label = Buffer.from(`<svg width="600" height="35"><rect width="600" height="35" fill="${white ? '#382C25' : '#FAF7F0'}"/><text x="16" y="24" font-family="sans-serif" font-size="16" fill="${white ? '#FFFFFF' : '#382C25'}">${asset.id}</text></svg>`);
  identityTiles.push(await sharp({ create: { width: 600, height: 215, channels: 3, background: white ? "#382C25" : "#FAF7F0" } }).composite([{ input, top: 0, left: 0 }, { input: label, top: 180, left: 0 }]).png().toBuffer());
}
await sharp({ create: { width: 1200, height: 645, channels: 3, background: "#FAF7F0" } }).composite(identityTiles.map((input, i) => ({ input, left: (i % 2) * 600, top: Math.floor(i / 2) * 215 }))).webp({ quality: 95 }).toFile("docs/content/identity-contact-sheet.webp");
console.log(`Prepared ${assets.length} originals, ${assets.reduce((n, a) => n + a.crops.length, 0)} crops and ${identity.assets.length} SVGs. Separate human approvals are pending.`);
