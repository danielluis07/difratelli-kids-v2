import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { chromium } from "@playwright/test";

// A separate review revision: never mutate approved content or runtime selection.
const prefix = "docs/content/hero-color-refresh";
const read = async path => JSON.parse(await readFile(path, "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const json = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + "\n");
const generation = await read(`${prefix}-generation.json`);
const base = await read("docs/content/homepage-manifest.json");
const refresh = await read("docs/content/homepage-image-refresh-manifest.json");
const copy = await read("docs/content/homepage-copy-proposal.json");
const files = new Set([`${prefix}-generation.json`, "scripts/content/prepare-hero-color-refresh.mjs"]);
try {
  const decision = await read(`${prefix}-approval.json`);
  assert.notEqual(decision.status, "approved", "Approved review is immutable; create a new revision.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
for (const path of ["docs/content/homepage-approval.json", "docs/content/homepage-image-refresh-approval.json", "docs/content/cast-approval.json"]) {
  const approval = await read(path);
  files.add(path);
  assert.equal(approval.status, "approved", path);
  const approvedFiles = approval.files ?? approval.assets.flatMap(a => [{ path: a.originalPath, sha256: a.originalSha256 }, { path: a.webPath, sha256: a.webSha256 }]);
  for (const file of approvedFiles) assert.equal(hash(await readFile(file.path)), file.sha256, `Approved file changed: ${file.path}`);
}
await mkdir("assets/originals/homepage/issue-66", { recursive: true });
await mkdir("public/images/homepage/issue-66", { recursive: true });
// Retain all edit inputs first so generation order never affects provenance.
for (const record of generation.records) {
  const path = `assets/originals/homepage/issue-66/${record.id}.png`;
  let bytes;
  try { bytes = await readFile(record.sourcePath); } catch (error) { if (error.code !== "ENOENT") throw error; bytes = await readFile(path); }
  try { assert.equal(hash(await readFile(path)), hash(bytes), `Retained original differs: ${path}`); } catch (error) { if (error.code !== "ENOENT") throw error; await writeFile(path, bytes); }
  files.add(path);
}
const assets = [];
for (const record of generation.records.filter(r => r.selected)) {
  const originalPath = `assets/originals/homepage/issue-66/${record.id}.png`;
  let bytes;
  try { bytes = await readFile(record.sourcePath); } catch (error) { if (error.code !== "ENOENT") throw error; bytes = await readFile(originalPath); }
  try { assert.equal(hash(await readFile(originalPath)), hash(bytes), `Retained original differs: ${originalPath}`); } catch (error) { if (error.code !== "ENOENT") throw error; await writeFile(originalPath, bytes); }
  const { width, height } = await sharp(bytes).metadata();
  assert((await sharp(bytes).stats()).isOpaque, originalPath);
  const asset = { id: record.id, slot: record.slot, originalPath, originalSha256: hash(bytes), width, height, originalBytes: bytes.length,
    alt: record.alt, modelIds: record.modelIds, productColorways: record.productColorways,
    references: [], crops: [], approvalStatus: "pending-human-review" };
  files.add(originalPath);
  for (const path of record.refs) { asset.references.push({ path, sha256: hash(await readFile(path)) }); files.add(path); }
  for (const { name, ratio, top } of record.crops) {
    const unit = Math.floor(Math.min(width / ratio[0], height / ratio[1]));
    const w = unit * ratio[0], h = unit * ratio[1];
    const sourceRect = { left: Math.round((width - w) / 2), top: top ?? Math.round((height - h) / 2), width: w, height: h };
    assert(sourceRect.top >= 0 && sourceRect.top + h <= height, "Crop must stay inside native source");
    const webPath = `public/images/homepage/issue-66/${record.id}-${name}.webp`;
    const web = await sharp(bytes).extract(sourceRect).webp({ quality: 90 }).toBuffer();
    await writeFile(webPath, web);
    const measured = await sharp(web).metadata();
    assert.equal(measured.width, w); assert.equal(measured.height, h);
    asset.crops.push({ name, ratio: ratio.join(":"), sourceRect, width: w, height: h, webPath, src: webPath.replace(/^public/, ""), sha256: hash(web), bytes: web.length });
    files.add(webPath);
  }
  assets.push(asset);
}
const current = id => {
  const replacement = refresh.integration.replacements.find(r => r.replacesAssetIds.includes(id));
  return replacement ? refresh.assets.find(a => a.id === replacement.assetId) : base.assets.find(a => a.id === id);
};
const candidate = slot => assets.find(a => a.slot === slot);
const drafts = await Promise.all(generation.records.filter(r => !r.selected).map(async record => {
  const originalPath = `assets/originals/homepage/issue-66/${record.id}.png`;
  const bytes = await readFile(originalPath), measured = await sharp(bytes).metadata();
  return { id: record.id, originalPath, originalSha256: hash(bytes), width: measured.width, height: measured.height, originalBytes: bytes.length, disposition: "rejected-framing", reason: record.reason };
}));
const pick = (a, name) => a.crops.find(c => c.name === name) ?? a.crops[0];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const src = c => `../../${c.webPath}`;
const img = (a, name) => { const c = pick(a, name); return `<img src="${src(c)}" width="${c.width}" height="${c.height}" alt="${esc(a.alt)}">`; };
const left = candidate("hero-left-wide"), compact = candidate("hero-left"), right = candidate("hero-right");
assert(left && compact && right, "Complete hero set required");
const manifest = { revision: generation.revision, sourceIssue: generation.sourceIssue, approvalStatus: "pending-human-review", implementationAllowed: false, assets, drafts,
  integration: { implementationAllowed: false, responsiveSelection: { "0-479": "hero-left/portrait", "480-767": "hero-left/narrow", "768-1023": "hero-left-tablet/tablet", "1024-1279": "hero-left/narrow + hero-right/narrow", "1280+": "hero-left-wide/desktop + hero-right-wide/desktop" }, replacements: [
    { assetId: left.id, replacesAssetIds: ["hero-left-wide", "hero-left-tablet"], cropMapping: { "hero-left-wide": "desktop", "hero-left-tablet": "tablet" } },
    { assetId: compact.id, replacesAssetIds: ["hero-left"], cropMapping: { portrait: "portrait", narrow: "narrow" } },
    { assetId: right.id, replacesAssetIds: ["hero-right-wide", "hero-right"], supersedesAssetId: "hero-right-clothes-v2", cropMapping: { "hero-right-wide": "desktop", "hero-right/narrow": "narrow" } },
  ] } };
await json(`${prefix}-manifest.json`, manifest); files.add(`${prefix}-manifest.json`);
const sources = `<source media="(max-width:479px)" srcset="${src(pick(compact, "portrait"))}"><source media="(max-width:767px)" srcset="${src(pick(compact, "narrow"))}"><source media="(max-width:1023px)" srcset="${src(pick(left, "tablet"))}"><source media="(max-width:1279px)" srcset="${src(pick(compact, "narrow"))}">`;
const hero = `<section class="editorial-hero" aria-labelledby="hero-heading"><div class="hero-panel hero-left"><picture>${sources}${img(left, "desktop")}</picture><div class="hero-copy" lang="pt-BR"><p class="editorial-eyebrow">${esc(copy.hero.eyebrow)}</p><h1 id="hero-heading">${esc(copy.hero.heading)}</h1><div class="hero-actions">${copy.hero.actions.map(a => `<a href="${esc(a.href)}">${esc(a.label)}</a>`).join("")}</div></div></div><div class="hero-panel hero-right"><picture><source media="(max-width:1279px)" srcset="${src(pick(right, "narrow"))}">${img(right, "desktop")}</picture></div></section>`;
const neighbors = ["quote-garments", "editorial-quintal", "look-quintal", "look-brincadeira", "look-imaginacao"];
const context = neighbors.map(id => { const a = current(id); return `<article><h3>${id}</h3>${img(a)}<p>Retained for context; separate refresh review in #67 / #68.</p></article>`; }).join("");
const categories = ["category-t-shirts", "category-polos", "category-matching-sets", "category-dresses"];
const inventory = assets.map(a => `<article><h3>${a.id}</h3>${a.crops.map(c => `<figure>${img(a, c.name)}<figcaption>${c.name}: ${c.width} × ${c.height}; ${c.ratio}</figcaption></figure>`).join("")}<p>${esc(a.alt)}</p></article>`).join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue 66 — colorful hero review v1</title><style>
@font-face{font-family:Fraunces;font-weight:100 900;src:url('../../assets/identity/fonts/Fraunces-variable.ttf')}@font-face{font-family:DM Sans;font-weight:100 900;src:url('../../assets/identity/fonts/DM-Sans-variable.ttf')}
*{box-sizing:border-box}body{margin:0;background:#FAF7F0;color:#382C25;font:16px 'DM Sans',sans-serif}h1,h2,h3{font-family:Fraunces,serif;font-weight:500}body{line-height:1.5}.hero-copy p{margin:0}p{line-height:1.5}img{display:block;width:100%;height:auto}a{color:inherit}.note{padding:24px}.note p{max-width:90ch}.editorial-hero{display:grid;grid-template-columns:1fr}.hero-panel{position:relative;display:grid;min-width:0;min-height:600px}.hero-panel>picture{grid-area:1/1;position:absolute;inset:0}.hero-panel img{width:100%;height:100%;object-fit:cover;object-position:center top}.hero-left::after{content:"";grid-area:1/1;position:absolute;inset:0;background:linear-gradient(0deg,rgba(35,25,18,.88),rgba(35,25,18,.08) 85%);pointer-events:none}.hero-right{display:none}.hero-copy{grid-area:1/1;align-self:end;position:relative;z-index:1;padding:32px 24px;color:white;max-width:600px}.editorial-eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.1em;line-height:1.5}.hero-copy h1{font-size:48px;font-weight:500;line-height:1.02;max-width:10ch;margin:18px 0 28px;text-wrap:initial}.hero-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:470px}.hero-actions a{border:1px solid white;padding:14px 6px;min-height:48px;display:flex;align-items:center;justify-content:center;font-size:13px;text-align:center;background:rgba(35,25,18,.32);text-decoration:none}.context,.inventory,.comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;padding:24px}.context article,.inventory article{min-width:0}figure{margin:16px 0}.inventory img{max-width:640px}.strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:24px}h2{padding:0 24px}h3{overflow-wrap:anywhere}
@media(min-width:768px){.hero-panel{min-height:560px}.hero-copy{padding:40px 32px}.hero-copy h1{font-size:64px}.hero-actions a{font-size:14px}.hero-left::after{background:linear-gradient(90deg,rgba(35,25,18,.78),rgba(35,25,18,.42) 52%,transparent 85%)}}
@media(min-width:1024px){.editorial-hero{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-panel{min-height:640px}.hero-right{display:grid}.hero-copy{padding:48px clamp(24px,3vw,56px)}.hero-copy h1{font-size:clamp(64px,4.7vw,90px)}}
@media(max-width:767px){.context,.inventory,.comparison{grid-template-columns:1fr}.strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style></head><body><div class="note"><h1>Hero proposal — issue #66</h1><p>Pending exact-file human acceptance. Existing headline, actions, typography, gradient and responsive split reproduced from the storefront. Shopping destinations are shown as their existing relative paths; this file is a visual review, not a storefront route.</p><p>Replace both hero treatments; preserve all current approvals and neighboring images. #67 proposes keeping the botanical dress quote as a calm pause and changing the collection feature to outdoor discovery. #68 proposes distinct discovery, street play and indoor imagination scenes. Those sets have no new accepted assets yet; the current neighbors below are the comparison baseline. Reserve this blue court, ball play and hanging-clothes treatment for the hero.</p></div>${hero}<h2>Current approved hero sources — comparison</h2><div class="comparison">${img(current("hero-left-wide"))}${img(current("hero-right-wide"))}</div><h2>Current category images retained</h2><div class="strip">${categories.map(id => img(current(id))).join("")}</div><h2>Retained neighboring panels — page sequence</h2><div class="context">${context}</div><h2>Exact proposed responsive crops</h2><div class="inventory">${inventory}</div></body></html>`;
await writeFile(`${prefix}-review.html`, html); files.add(`${prefix}-review.html`);
for (const id of [...neighbors, ...categories, "hero-left-wide", "hero-left-tablet", "hero-left", "hero-right-wide"]) {
  const a = current(id); for (const c of a.crops) files.add(c.webPath);
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const width of [390, 480, 768, 1024, 1279, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1080 }, reducedMotion: "reduce" });
    await page.goto(pathToFileURL(resolve(`${prefix}-review.html`)).href);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
    assert.equal(await page.locator(".editorial-hero img:visible").count(), width >= 1024 ? 2 : 1);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    for (const selector of [".hero-copy", ".hero-actions"]) {
      const r = await page.locator(selector).boundingBox(), panel = await page.locator(".hero-left").boundingBox();
      assert(r.x >= panel.x && r.x + r.width <= panel.x + panel.width + 1 && r.y >= panel.y && r.y + r.height <= panel.y + panel.height + 1, `${selector} outside panel at ${width}`);
    }
    const selected = await page.locator(".editorial-hero img").evaluateAll(images => images.map(i => i.currentSrc.split("/").pop()));
    const expectedLeft = width < 480 ? pick(compact, "portrait") : width < 768 ? pick(compact, "narrow") : width < 1024 ? pick(left, "tablet") : width < 1280 ? pick(compact, "narrow") : pick(left, "desktop");
    assert.equal(selected[0], expectedLeft.webPath.split("/").pop());
    if (width >= 1024) assert.equal(selected[1], pick(right, width < 1280 ? "narrow" : "desktop").webPath.split("/").pop());
    const path = `${prefix}-hero-${width}.png`;
    await page.locator(".editorial-hero").screenshot({ path }); files.add(path);
    // Sample the underlying rendered background at every text-character box.
    // This includes the unchanged overlay gradient and action backgrounds.
    const boxes = await page.locator(".hero-copy").evaluate(root => {
      const hero = root.closest(".editorial-hero").getBoundingClientRect();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const boxes = []; let node;
      while ((node = walker.nextNode())) for (let i = 0; i < node.textContent.length; i++) {
        if (!node.textContent[i].trim()) continue;
        const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
        for (const r of range.getClientRects()) boxes.push({ x: r.x - hero.x, y: r.y - hero.y, width: r.width, height: r.height, large: Boolean(node.parentElement.closest("h1")) });
      }
      return boxes;
    });
    await page.locator(".hero-copy").evaluate(el => { el.style.color = "transparent"; });
    const underlying = await page.locator(".editorial-hero").screenshot();
    await page.locator(".hero-copy").evaluate(el => { el.style.color = ""; });
    const { data, info } = await sharp(underlying).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const linear = n => { const s = n / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; };
    const contrast = { heading: 21, smallText: 21 };
    for (const box of boxes) for (let y = Math.max(0, Math.floor(box.y)); y < Math.min(info.height, Math.ceil(box.y + box.height)); y++) for (let x = Math.max(0, Math.floor(box.x)); x < Math.min(info.width, Math.ceil(box.x + box.width)); x++) {
      const offset = (y * info.width + x) * info.channels;
      const luminance = .2126 * linear(data[offset]) + .7152 * linear(data[offset + 1]) + .0722 * linear(data[offset + 2]);
      const key = box.large ? "heading" : "smallText";
      contrast[key] = Math.min(contrast[key], 1.05 / (luminance + .05));
    }
    assert(contrast.heading >= 3 && contrast.smallText >= 4.5, `Overlay contrast at ${width}: ${JSON.stringify(contrast)}`);
    if ([390, 768, 1440].includes(width)) { const path = `${prefix}-context-${width}.png`; await page.screenshot({ path, fullPage: true }); files.add(path); }
    results.push({ width, selected, imageDecoding: "passed", splitAndCopyBounds: "passed", overflow: "none", minimumOverlayContrast: contrast });
    await page.close();
  }
} finally { await browser.close(); }
await json(`${prefix}-checks.json`, { revision: generation.revision, status: "passed", checks: results, visualAcceptance: "pending-human-review", limitation: "Static review reproduces hero CSS; runtime checks and integration remain gated on exact human acceptance." });
files.add(`${prefix}-checks.json`);
files.add(`${prefix}-review.md`);
const bound = await Promise.all([...files].sort().map(async path => ({ path, sha256: hash(await readFile(path)) })));
await json(`${prefix}-approval-request.json`, { revision: generation.revision, sourceIssue: generation.sourceIssue, status: "pending-human-review", implementationAllowed: false, reviewer: null, evidence: null, reviewPath: `${prefix}-review.html`, manifestPath: `${prefix}-manifest.json`, files: bound });
await json(`${prefix}-approval.json`, { revision: generation.revision, status: "pending-human-review", implementationAllowed: false, reviewer: null, evidence: null, scope: "Exact hero originals and six responsive crops only; integration and runtime verification follow acceptance.", approvalRequestSha256: hash(await readFile(`${prefix}-approval-request.json`)) });
console.log(`Hero review ready: ${assets.length} assets, ${bound.length} hash-bound files, ${results.length} viewport checks. Storefront selection unchanged.`);
