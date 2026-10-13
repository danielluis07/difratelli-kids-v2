import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";

const json = async path => JSON.parse(await readFile(path, "utf8"));
const hash = async path => createHash("sha256").update(await readFile(path)).digest("hex");
const manifest = await json("docs/content/homepage-manifest.json");
const proposal = await json("docs/content/homepage-copy-proposal.json");
const request = await json("docs/content/homepage-approval-request.json");
const catalog = await json("docs/content/catalog-proposal.json");
assert.equal(manifest.revision, proposal.revision);
assert.equal(manifest.revision, request.revision);
assert.equal(manifest.approvalStatus, "pending-human-review");
assert.equal(proposal.approvalStatus, "pending-human-review");
assert.equal(request.status, "pending-human-review");
assert.equal(manifest.implementationAllowed, false);
assert.equal(request.implementationAllowed, false);
assert.equal(new Set(manifest.assets.map(a => a.id)).size, 25);
assert.equal(manifest.assets.filter(a => a.role === "category-tile").length, 8);
assert.equal(manifest.assets.filter(a => a.role === "social-photo").length, 7);
assert.equal(manifest.castCoverage.length, 8);
const boundPaths = new Set(request.files.map(f => f.path));
for (const f of request.files) assert.equal(await hash(f.path), f.sha256, f.path);
for (const a of manifest.assets) {
  assert(boundPaths.has(a.originalPath), a.originalPath);
  assert.equal(await hash(a.originalPath), a.originalSha256, a.id);
  const original = await sharp(a.originalPath).metadata();
  assert.equal(original.width, a.width, a.id);
  assert.equal(original.height, a.height, a.id);
  assert((await sharp(a.originalPath).stats()).isOpaque, a.id);
  for (const reference of a.references) assert.equal(await hash(reference.path), reference.sha256, reference.path);
  for (const crop of a.crops) {
    assert(boundPaths.has(crop.webPath), crop.webPath);
    assert.equal(await hash(crop.webPath), crop.sha256, crop.webPath);
    const encoded = await sharp(crop.webPath).metadata();
    assert.equal(encoded.width, crop.width, crop.webPath);
    assert.equal(encoded.height, crop.height, crop.webPath);
    const [w, h] = crop.ratio.split(":").map(Number);
    assert.equal(crop.width * h, crop.height * w, crop.webPath);
    assert(crop.sourceRect.left + crop.width <= a.width, crop.webPath);
    assert(crop.sourceRect.top + crop.height <= a.height, crop.webPath);
    assert.equal(crop.approvalStatus, "pending-human-review");
  }
}
for (const tab of proposal.shopTheLook.tabs) {
  const a = manifest.assets.find(a => a.id === tab.imageId);
  assert.deepEqual(a.productIds, tab.products.map(p => p.productId));
  for (const entry of tab.products) {
    const p = catalog.products.find(p => p.id === entry.productId);
    assert.equal(p.collectionId, tab.collectionId);
    assert(p.colorways.some(c => c.id === entry.colorwayId));
  }
}
let decision;
try { decision = await json("docs/content/homepage-approval.json"); } catch (error) { if (error.code !== "ENOENT") throw error; }
console.log(`Immutable homepage review verified: ${manifest.assets.length} assets, 8 categories, 3 looks, 7 social crops, ${request.files.length} file hashes. Human decision: ${decision?.status ?? "pending"}.`);
