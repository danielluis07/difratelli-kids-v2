import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";

const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const read = async path => JSON.parse(await readFile(path, "utf8"));
const generationPath = "docs/content/homepage-image-refresh-generation.json";
const generation = await read(generationPath);
const base = await read("docs/content/homepage-manifest.json");
const baseApproval = await read("docs/content/homepage-approval.json");
const copy = await read("docs/content/homepage-copy-proposal.json");
const catalog = await read("docs/content/catalog-proposal.json");
assert.equal(generation.records.length, 5);
assert.equal(baseApproval.status, "approved");
for (const file of baseApproval.files) assert.equal(digest(await readFile(file.path)), file.sha256, `Approved base changed: ${file.path}`);
try {
  const decision = await read("docs/content/homepage-image-refresh-approval.json");
  if (decision.status === "approved") {
    for (const file of decision.files) assert.equal(digest(await readFile(file.path)), file.sha256, file.path);
    console.log("Preserved the approved image refresh; hashes match.");
    process.exit(0);
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }
await mkdir("assets/originals/homepage", { recursive: true });
await mkdir("public/images/homepage", { recursive: true });
async function retain(sourcePath, originalPath) {
  let bytes;
  try { bytes = await readFile(originalPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
  if (!bytes) { bytes = await readFile(sourcePath); await writeFile(originalPath, bytes); }
  try { assert.equal(digest(await readFile(sourcePath)), digest(bytes), `Retained original differs: ${originalPath}`); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const metadata = await sharp(bytes).metadata();
  assert((await sharp(bytes).stats()).isOpaque, originalPath);
  return { originalPath, originalSha256: digest(bytes), width: metadata.width, height: metadata.height, originalBytes: bytes.length };
}
async function crop(original, id, name, ratio) {
  const unit = Math.floor(Math.min(original.width / ratio[0], original.height / ratio[1]));
  const width = unit * ratio[0], height = unit * ratio[1];
  const sourceRect = { left: Math.round((original.width - width) / 2), top: Math.round((original.height - height) / 2), width, height };
  const webPath = `public/images/homepage/${id}-${name}.webp`;
  const web = await sharp(original.originalPath).extract(sourceRect).webp({ quality: 90 }).toBuffer();
  await writeFile(webPath, web);
  const measured = await sharp(web).metadata();
  assert.equal(measured.width, width); assert.equal(measured.height, height);
  return { name, ratio: ratio.join(":"), sourceRect, width, height, webPath, src: webPath.replace(/^public/, ""), sha256: digest(web), bytes: web.length, approvalStatus: "pending-human-review" };
}
const assets = [];
for (const record of generation.records) {
  const original = await retain(record.sourcePath, `assets/originals/homepage/${record.id}.png`);
  const isHero = record.slot === "hero-right";
  const asset = { id: record.id, slot: record.slot, role: isHero ? "homepage-hero-right" : "category-tile", ...original, alt: record.alt, modelIds: record.modelIds, productIds: record.productIds, usage: [record.slot], references: await Promise.all(record.refs.map(async path => ({ path, sha256: digest(await readFile(path)) }))), crops: [], approvalStatus: "pending-human-review" };
  asset.crops.push(await crop(original, record.id, isHero ? "desktop" : "portrait", isHero ? [3, 2] : [3, 4]));
  if (isHero) {
    const narrow = await retain(record.narrow.sourcePath, "assets/originals/homepage/hero-right-clothes-narrow-v2.png");
    const narrowCrop = await crop(narrow, record.id, "narrow", [4, 5]);
    narrowCrop.derivative = narrow;
    asset.crops.push(narrowCrop);
    // Keep the actual edit input as provenance, without treating it as selected content.
    await retain(record.discardedVariants[0].sourcePath, "assets/originals/homepage/hero-right-clothes-close-draft-v2.png");
  }
  assets.push(asset);
}
const integration = { revision: generation.revision, parentRevision: generation.parentRevision, implementationAllowed: false, replacements: assets.map(a => ({ assetId: a.id, slot: a.slot, replacesAssetIds: a.slot === "hero-right" ? ["hero-right-wide", "hero-right"] : [a.slot], cropMapping: a.slot === "hero-right" ? { "hero-right-wide": "desktop", "hero-right/narrow": "narrow" } : { default: "portrait" }, href: a.slot === "hero-right" ? null : `/produtos?categoria=${a.slot.replace("category-", "")}` })) };
const manifestPath = "docs/content/homepage-image-refresh-manifest.json";
const manifest = { revision: generation.revision, parentRevision: generation.parentRevision, sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/34", approvalStatus: "pending-human-review", implementationAllowed: false, technicalStatus: "passed", assets, integration };
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
const src = path => `../../${path}`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const photo = (asset, name = asset.crops[0].name) => { const c = asset.crops.find(c => c.name === name); return `<img src="${src(c.webPath)}" width="${c.width}" height="${c.height}" alt="${esc(asset.alt)}">`; };
const left = base.assets.find(a => a.id === "hero-left-wide");
const leftNarrow = base.assets.find(a => a.id === "hero-left");
const tablet = base.assets.find(a => a.id === "hero-left-tablet");
const right = assets.find(a => a.slot === "hero-right");
const picture = `<picture><source media="(max-width:479px)" srcset="${src(leftNarrow.crops.find(c => c.name === "portrait").webPath)}"><source media="(max-width:1023px)" srcset="${src(tablet.crops[0].webPath)}"><source media="(max-width:1279px)" srcset="${src(leftNarrow.crops.find(c => c.name === "narrow").webPath)}">${photo(left)}</picture>`;
const tiles = catalog.categories.map(category => {
  const replacement = assets.find(a => a.slot === `category-${category.id}`);
  const a = replacement ?? base.assets.find(a => a.id === `category-${category.id}`);
  return `<li data-category="${category.id}"><div class="category-photo">${photo(a)}</div><p lang="pt-BR">${esc(category.name)}</p><small>${replacement ? "Replacement" : "Approved image retained"}</small></li>`;
}).join("");
const reviewPath = "docs/content/homepage-image-refresh-review.html";
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Homepage image refresh v2 — review</title><style>
@font-face{font-family:Fraunces;src:url('../../assets/identity/fonts/Fraunces-variable.ttf')}@font-face{font-family:DM Sans;src:url('../../assets/identity/fonts/DM-Sans-variable.ttf')}
*{box-sizing:border-box}body{margin:0;background:#FAF7F0;color:#382C25;font:16px 'DM Sans',sans-serif}h1,h2,h3{font-family:Fraunces,serif}p{line-height:1.5}a{color:#246B63}img{display:block;width:100%;height:auto}.note{padding:24px;background:#eee5d5}.note h1{font-size:30px;margin:0 0 16px}.note p{max-width:90ch}.wordmark{padding:16px}.wordmark img{width:168px;height:62px;margin:auto}.hero{display:grid;grid-template-columns:1fr 1fr}.hero-panel{position:relative;display:grid;min-width:0;min-height:640px}.hero-panel>picture{position:absolute;inset:0}.hero img{width:100%;height:100%;object-fit:cover;object-position:50% 0}.hero-left:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(35,25,18,.78),rgba(35,25,18,.42) 52%,transparent 85%)}.hero-copy{grid-area:1/1;align-self:end;position:relative;z-index:1;padding:48px clamp(24px,3vw,56px);max-width:600px;color:white}.hero-copy h2{font-size:clamp(64px,4.7vw,90px);line-height:1.02;max-width:10ch;margin:18px 0 28px}.eyebrow{font-size:12px;letter-spacing:.1em;text-transform:uppercase}.actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:470px}.actions span{border:1px solid white;padding:14px 6px;min-height:48px;text-align:center;font-size:14px;background:rgba(35,25,18,.32)}.categories{margin:64px 0}.category-track{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 48px)/3.3);gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:48px;padding:4px 48px 16px;list-style:none;margin:0}.category-track li{min-width:0;scroll-snap-align:start}.category-photo{aspect-ratio:3/4}.category-track p{font-size:20px;text-decoration:underline;text-underline-offset:6px;margin:12px 0}.controls{display:flex;justify-content:flex-end;gap:12px;padding:16px 48px}.controls button{min-width:48px;min-height:48px;background:#FAF7F0;border:1px solid #d8cfc3;color:#382C25;font-size:20px;cursor:pointer}.heading{padding:0 24px}.inventory{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;padding:24px}.inventory article{min-width:0}.inventory h3{overflow-wrap:anywhere}.inventory small{display:block;overflow-wrap:anywhere;margin-top:8px}.inventory .hero-narrow{max-width:600px}.category-track:focus-visible,button:focus-visible{outline:2px solid #246B63;outline-offset:2px}
@media(max-width:1023px){.hero{grid-template-columns:1fr}.hero-right{display:none}.hero-panel{min-height:560px}.hero-copy{padding:40px 32px}.hero-copy h2{font-size:64px}.category-track{grid-auto-columns:42%;padding-inline:32px;scroll-padding-inline:32px}.controls{padding-inline:32px}}
@media(max-width:767px){.hero-panel{min-height:600px}.hero-copy{padding:32px 24px}.hero-copy h2{font-size:48px}.actions span{font-size:13px}.hero-left:after{background:linear-gradient(0deg,rgba(35,25,18,.88),rgba(35,25,18,.08) 85%)}.category-track{grid-auto-columns:75%;padding-inline:16px;gap:16px;scroll-padding-inline:16px}.controls{padding-inline:16px}.inventory{grid-template-columns:1fr;padding:16px}}
</style></head><body><div class="note"><h1>Five requested image replacements — pending review</h1><p>The proposed hero uses clothes only on the right. Four category tiles change: Camisetas → park run; Polos → city and sunglasses; Conjuntos → clothes on a balcony; Vestidos → two smiling children and blue sky. This preview shows the replacement slots; the other four tiles retain their approved photographs.</p><p>The selected images and exact crops require human approval under the photography standard. The existing storefront and its 80 approved file hashes remain unchanged. Full-size selected crops appear below, including the hero's narrow variant for desktop widths 1024–1279px.</p><a href="#selected">Inspect selected images</a> · <a href="homepage-image-refresh-contact-sheet.webp">Contact sheet</a></div><header class="wordmark"><img src="../../public/identity/wordmark-brown-v1.svg" width="168" height="62" alt="Difratelli Kids"></header><main><section class="hero" lang="pt-BR"><div class="hero-panel hero-left">${picture}<div class="hero-copy"><p class="eyebrow">${esc(copy.hero.eyebrow)}</p><h2>${esc(copy.hero.heading)}</h2><div class="actions">${copy.hero.actions.map(a => `<span>${esc(a.label)}</span>`).join("")}</div></div></div><div class="hero-panel hero-right"><picture><source media="(max-width:1279px)" srcset="${src(right.crops.find(c => c.name === "narrow").webPath)}">${photo(right, "desktop")}</picture></div></section><section class="categories"><h2 class="heading">Eight homepage tiles — four replacements</h2><div class="controls"><button aria-label="Anterior" onclick="moveTiles(-1)">←</button><button aria-label="Próximo" onclick="moveTiles(1)">→</button></div><ul class="category-track" tabindex="0" aria-label="Category image review">${tiles}</ul></section><section id="selected"><h2 class="heading">Selected photographs and crops</h2><div class="inventory">${assets.map(a => `<article><h3>${esc(a.id)}</h3>${photo(a)}<small>${esc(a.alt)}</small><small>Original: ${a.width} × ${a.height} · ${a.originalSha256}</small>${a.crops.map(c => `<small>${c.name}: ${c.width} × ${c.height}, ${c.ratio} · ${c.sha256}</small>`).join("")}${a.slot === "hero-right" ? `<h3>Narrow hero — 4:5</h3><div class="hero-narrow">${photo(a, "narrow")}</div>` : ""}</article>`).join("")}</div></section></main><script>function moveTiles(direction){const list=document.querySelector('.category-track');list.scrollBy({left:direction*(list.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(list).columnGap)),behavior:'smooth'})}</script></body></html>`;
await writeFile(reviewPath, html);
const thumbnails = await Promise.all(assets.map(async (a, i) => ({ input: await sharp(a.crops[0].webPath).resize(300, 400, { fit: "contain", background: "#FAF7F0" }).toBuffer(), left: i * 300, top: 0 })));
const sheetPath = "docs/content/homepage-image-refresh-contact-sheet.webp";
await sharp({ create: { width: 1500, height: 400, channels: 3, background: "#FAF7F0" } }).composite(thumbnails).webp({ quality: 90 }).toFile(sheetPath);
const paths = new Set([generationPath, manifestPath, reviewPath, sheetPath]);
paths.add("docs/content/homepage-image-refresh-review.md");
for (const width of [390, 768, 1024, 1440, 1920]) {
  const path = `docs/content/homepage-image-refresh-hero-${width}.png`;
  try { await readFile(path); paths.add(path); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
for (const a of assets) { paths.add(a.originalPath); a.references.forEach(r => paths.add(r.path)); for (const c of a.crops) { paths.add(c.webPath); if (c.derivative) paths.add(c.derivative.originalPath); } }
const files = await Promise.all([...paths].sort().map(async path => ({ path, sha256: digest(await readFile(path)) })));
await writeFile("docs/content/homepage-image-refresh-approval-request.json", JSON.stringify({ revision: generation.revision, parentRevision: generation.parentRevision, status: "pending-human-review", implementationAllowed: false, reviewPath, manifestPath, reviewer: null, evidence: null, files }, null, 2) + "\n");
console.log(`Prepared ${assets.length} replacement scenes, ${assets.reduce((n, a) => n + a.crops.length, 0)} crops and ${files.length} review-bound file hashes; existing approval unchanged.`);
