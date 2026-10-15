import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Independent sourcing review. Never changes the storefront's approved selection.
const prefix = "docs/content/quote-feature-unsplash";
const read = async path => JSON.parse(await readFile(path, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const json = (path, value) => writeFile(path, JSON.stringify(value, null, 2) + "\n");
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const local = path => `../../${path}`;
const notes = [
  { title: "Watering the vegetable garden", fit: "Strongest direct match to outdoor discovery: a real watering activity, garden beds and a closer environmental view.", limitation: "Dark foliage and the large watering can occupy the current right-hand copy area. Existing dark overlay text needs a placement/contrast review before integration.", alt: "Criança rega uma horta com um regador de metal, cercada por canteiros e plantas." },
  { title: "Gardening together", fit: "Two children engaged in a shared task; pink and blue dresses add silhouettes and color, with a wider view than the quote.", limitation: "Both children must remain in the crop. The child on the right conflicts with the current copy zone; a garden sign is visible in the original.", alt: "Duas crianças com vestidos rosa e azul cuidam de um canteiro no jardim." },
  { title: "Discovering spring blossoms", fit: "Strongest color candidate: pink blossoms, red tulips and a bright dress connect immediately to the botanical collection story.", limitation: "A closer, quieter activity than A or B. The original already frames the lower dress out; dark tree/foliage fills the current right-hand copy zone.", alt: "Criança com vestido colorido toca flores rosadas em um jardim com tulipas." },
  { title: "Running through the garden", fit: "Most movement and widest framing; a solid peach dress balances the printed garments and the retained quote.", limitation: "Weaker connection to gardening. The runner is on the right, where the existing overlay sits; repositioning the subject would require a different source or an explicitly reviewed layout decision.", alt: "Criança com vestido pêssego corre por uma área gramada cercada de árvores." },
];
const manifest = await read(`${prefix}-manifest.json`);
assert.equal(manifest.status, "pending-human-review", "Create a new revision after approval.");
for (const [index, asset] of manifest.candidates.entries()) {
  Object.assign(asset, notes[index]);
  const original = await readFile(asset.originalPath);
  assert.equal(hash(original), asset.sha256, asset.originalPath);
  const measured = await sharp(original).metadata();
  assert.equal(measured.width, asset.width);
  assert.equal(measured.height, asset.height);
  asset.crops = [];
  for (const [name, ratio, maxWidth] of [["desktop", [16, 9], 1600], ["compact", [4, 3], 1200]]) {
    const unit = Math.floor(Math.min(asset.width / ratio[0], asset.height / ratio[1]));
    const width = unit * ratio[0], height = unit * ratio[1];
    const left = asset.label === "D" ? asset.width - width : asset.label === "C" ? 0 : Math.floor((asset.width - width) / 2);
    const top = asset.label === "D" ? Math.floor((asset.height - height) / 2) : 0;
    const sourceRect = { left, top, width, height };
    const path = `assets/references/homepage/issue-67-unsplash/${asset.id}-${name}.webp`;
    const bytes = await sharp(original).extract(sourceRect).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
    await writeFile(path, bytes);
    const encoded = await sharp(bytes).metadata();
    asset.crops.push({ name, ratio: ratio.join(":"), sourceRect, path, width: encoded.width, height: encoded.height, sha256: hash(bytes), bytes: bytes.length, status: "pending-human-review" });
  }
}
const base = await read("docs/content/homepage-manifest.json");
const refresh = await read("docs/content/homepage-image-refresh-manifest.json");
const hero = await read("docs/content/hero-color-refresh-manifest.json");
const integration = await read("docs/content/hero-color-refresh-integration.json");
const current = id => {
  const h = hero.integration.replacements.find(r => integration.activeAssetIds.includes(r.assetId) && r.replacesAssetIds.includes(id));
  if (h) return hero.assets.find(a => a.id === h.assetId);
  const r = refresh.integration.replacements.find(r => r.replacesAssetIds.includes(id));
  return r ? refresh.assets.find(a => a.id === r.assetId) : base.assets.find(a => a.id === id);
};
const neighbors = ["hero-left-wide", "hero-right-wide", "quote-garments", "look-quintal"].map(id => ({ id, asset: current(id) }));
manifest.retainedContext = neighbors.map(({ id, asset }) => ({ slot: id, assetId: asset.id, originalPath: asset.originalPath, originalSha256: asset.originalSha256, crops: asset.crops }));
const image = (path, alt) => `<img src="${local(path)}" alt="${esc(alt)}" loading="lazy">`;
const cards = manifest.candidates.map(a => `<article id="candidate-${a.label}"><h2>${a.label} · ${esc(a.title)}</h2><p>${esc(a.fit)}</p><p><strong>Integration constraint:</strong> ${esc(a.limitation)}</p><p>Photo by <a href="${a.href}">${esc(a.name)} on Unsplash</a> · free Unsplash License · downloaded original ${a.width} × ${a.height}</p><div class="crops"><figure>${image(a.crops[0].path, a.alt)}<figcaption>Desktop · 16:9 · ${a.crops[0].width} × ${a.crops[0].height}</figcaption></figure><figure>${image(a.crops[1].path, a.alt)}<figcaption>Compact · 4:3 · ${a.crops[1].width} × ${a.crops[1].height}</figcaption></figure></div><p><a href="${local(a.originalPath)}">Full downloaded original</a></p></article>`).join("");
await writeFile(`${prefix}-review.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue 67 · Unsplash candidate review</title><style>*{box-sizing:border-box}body{margin:0;background:#faf7f0;color:#382c25;font:16px/1.6 system-ui,sans-serif}main{max-width:1440px;margin:auto;padding:24px}h1,h2{line-height:1.2}a{color:#246b63}img{display:block;width:100%;height:auto}figure{margin:0}figcaption{font-size:14px;margin-top:8px}.context{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.context img{aspect-ratio:4/3;object-fit:contain;background:#eee8de}.crops{display:grid;grid-template-columns:1.5fr 1fr;gap:24px}article{margin-top:48px;border-top:1px solid #d8cfc3;padding-top:24px}p{max-width:95ch}@media(max-width:767px){.crops{grid-template-columns:1fr}.context{grid-template-columns:1fr 1fr}main{padding:16px}}</style></head><body><main><h1>Quote + collection feature · Unsplash candidates</h1><p>Pending candidate approval. The owner's new instruction changes editorial sourcing to Unsplash; catalog and individual product-page garment photography remain generated. This review does not integrate any replacement or approve a copy/layout change.</p><p>Retain the approved botanical-dress quote and both of its crops. Replace only the collection-feature linen arrangement with one outdoor scene. Unsplash children and clothes are editorial mood imagery, not the recurring generated cast or exact catalog garments. No child here is attributed to the fictional Bia quote.</p><p>A is the strongest gardening match; C is the strongest color choice. All four need an exact overlay review after selection: these are photographic crop proposals, not claims that current overlay contrast or shopping integration has passed. Existing Portuguese copy and destinations remain unchanged.</p><nav>${manifest.candidates.map(a => `<a href="#candidate-${a.label}">${a.label} · ${esc(a.title)}</a>`).join(" · ")}</nav><h2>Current approved neighbors</h2><div class="context">${neighbors.map(({ id, asset }) => `<figure>${image(asset.crops[0].webPath, asset.alt)}<figcaption>${esc(id)} · ${esc(asset.id)}</figcaption></figure>`).join("")}</div>${cards}</main></body></html>`);
const tiles = await Promise.all(manifest.candidates.map(async (a, index) => {
  const svg = Buffer.from(`<svg width="640" height="44"><rect width="640" height="44" fill="#faf7f0"/><text x="16" y="29" font-family="Arial" font-size="21" fill="#382c25">${a.label} · ${esc(a.title)}</text></svg>`);
  return [{ input: await sharp(a.crops[0].path).resize(640, 360).toBuffer(), left: (index % 2) * 640, top: Math.floor(index / 2) * 404 }, { input: svg, left: (index % 2) * 640, top: Math.floor(index / 2) * 404 + 360 }];
}));
await sharp({ create: { width: 1280, height: 808, channels: 3, background: "#faf7f0" } }).composite(tiles.flat()).webp({ quality: 90 }).toFile(`${prefix}-contact-sheet.webp`);
await json(`${prefix}-manifest.json`, manifest);
console.log("Prepared four sourced originals, eight crop previews, retained neighbors and labelled contact sheet. Approval pending; storefront unchanged.");
