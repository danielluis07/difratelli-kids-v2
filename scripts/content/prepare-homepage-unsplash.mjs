import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const sources = JSON.parse(await readFile("docs/content/homepage-unsplash-sources.json", "utf8"));
try {
  const decision = JSON.parse(await readFile("docs/content/homepage-unsplash-approval.json", "utf8"));
  assert.notEqual(decision.status, "approved", "Accepted imagery is immutable. Create a new revision for further changes.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const root = "assets/originals/homepage/unsplash";
const webRoot = "public/images/homepage/unsplash";
await Promise.all([mkdir(root, { recursive: true }), mkdir(webRoot, { recursive: true })]);
const specs = [
  ["photo-1604303768345-038b79a8c47a", ["hero-left-wide", "hero-left-tablet", "hero-left"], "children", "Duas crianças com cabelos cacheados posam juntas; uma usa camisa xadrez e calça preta, e a outra, camisa clara, colete e bermuda preta.", [["desktop", 3, 2], ["tablet", 2, 1], ["portrait", 3, 4], ["narrow", 4, 5]], .5, 0],
  ["photo-1622290291468-a28f7a7dc6a8", ["hero-right-wide", "hero-right"], "clothes-only", "Camiseta infantil branca com gorro verde, meias, ursinho e câmera de brinquedo sobre fundo rosa, sem modelo.", [["desktop", 3, 2], ["narrow", 4, 5]], .5, .5],
  ["photo-1605813945635-10fdefb45dd1", ["category-t-shirts"], "children", "Criança com camiseta e short azuis brinca com folhas caindo em um caminho arborizado.", [["portrait", 3, 4]], .5, 1],
  ["photo-1671438118097-479e63198629", ["category-polos"], "clothes-only", "Polo branca pendurada em um cabide sobre uma escada de madeira, sem modelo.", [["portrait", 3, 4]], .5, .5],
  ["e6lWMBIgNso", ["category-tops"], "children", "Criança usa blusa clara com bolinhas e short azul diante de flores vermelhas.", [["portrait", 3, 4]], .5, .5],
  ["photo-1785828642909-676851fe3db2", ["category-shorts"], "children", "Criança sorri usando camiseta estampada com veículos e short escuro ao ar livre.", [["portrait", 3, 4]], .5, 1],
  ["AnCxA0whats", ["category-trousers"], "children", "Crianças com calças e roupas coloridas brincam com patinetes em um caminho arborizado.", [["portrait", 3, 4]], .58, .5],
  ["kPXq-jxhMkk", ["category-dresses"], "children", "Criança sorri e segura a saia de um vestido vermelho.", [["portrait", 3, 4]], .5, .5],
  ["60X-XJ5YBuk", ["category-matching-sets"], "clothes-only", "Camiseta infantil clara e short listrado pendurados juntos, sem modelo.", [["portrait", 3, 4]], .5, .5],
  ["IVrtlceLSzs", ["category-light-layers"], "children", "Criança com cabelos loiros e jaqueta jeans olha para a câmera.", [["portrait", 3, 4]], .5, .45],
  ["MDIGo4Ez-0g", ["look-quintal"], "clothes-only", "Meias infantis coloridas presas em um varal ao ar livre, sem modelos.", [["landscape", 4, 3]], .5, .5],
  ["COgVvJ_CG_I", ["look-brincadeira"], "clothes-only", "Camisetas e vestidos infantis coloridos expostos em uma loja, sem modelos.", [["landscape", 4, 3]], .5, .5],
  ["VoXqvbLAPjM", ["look-imaginacao"], "clothes-only", "Camiseta infantil branca com acessórios e ursinho sobre fundo rosa, sem modelo.", [["landscape", 4, 3]], .5, .5],
  ["FtL07GM9Q7Y", ["social-1"], "children", "Duas crianças fazem caretas divertidas para a câmera.", [["square", 1, 1]], .5, .5],
  ["nGwkIZFelko", ["social-2"], "children", "Duas crianças se abraçam e sorriem dentro de casa.", [["square", 1, 1]], .6, .5],
  ["xCU7nCMNfI8", ["social-3"], "children", "Duas crianças com vestidos caminham de mãos dadas por uma trilha.", [["square", 1, 1]], .62, .5],
  ["lP_FbBkMn1c", ["social-4"], "children", "Quatro crianças riem sentadas na grama; uma delas segura um violão.", [["square", 1, 1]], .5, .5],
  ["P5MXtYfgmmw", ["social-5"], "children", "Três crianças se abraçam e riem sentadas em degraus.", [["square", 1, 1]], .5, .55],
  ["xaG8oaZD7ss", ["social-6"], "children", "Crianças brincam com bolhas de sabão em uma área verde.", [["square", 1, 1]], .55, .5],
  ["LGlBwZGjiwM", ["social-7"], "children", "Criança com cabelos cacheados e camiseta amarela olha para a câmera.", [["square", 1, 1]], .5, .4],
];
const produce = async ([id, slotIds, kind, alt, crops, focusX, focusY]) => {
  const source = sources.photos.find(p => p.id === id);
  assert(source, `Missing source: ${id}`);
  const originalPath = `${root}/${id}.jpg`;
  let original;
  try { original = await readFile(originalPath); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const url = new URL(source.urls.raw);
    url.searchParams.set("fm", "jpg");
    url.searchParams.set("q", "90");
    const response = await fetch(url);
    assert(response.ok, `${id}: HTTP ${response.status}`);
    original = Buffer.from(await response.arrayBuffer());
    await writeFile(originalPath, original);
  }
  const { width, height } = await sharp(original).metadata();
  assert((await sharp(original).stats()).isOpaque, id);
  const exports = [];
  for (const [name, rx, ry] of crops) {
    const unit = Math.floor(Math.min(width / rx, height / ry));
    const w = unit * rx, h = unit * ry;
    const sourceRect = { left: Math.round((width - w) * focusX), top: Math.round((height - h) * focusY), width: w, height: h };
    const webPath = `${webRoot}/${id}-${name}.webp`;
    const bytes = await sharp(original).extract(sourceRect).resize({ width: Math.min(w, name === "desktop" || name === "tablet" ? 1920 : 1200), withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
    await writeFile(webPath, bytes);
    const metadata = await sharp(bytes).metadata();
    exports.push({ name, ratio: `${rx}:${ry}`, sourceRect, width: metadata.width, height: metadata.height, webPath, src: webPath.replace(/^public/, ""), sha256: digest(bytes), bytes: bytes.length });
  }
  return { id, slotIds, kind, alt, photographer: source.photographer, sourceUrl: source.sourceUrl, license: "Unsplash License", originalPath, originalSha256: digest(original), width, height, originalBytes: original.length, crops: exports };
};
// Optional slot names let a review update only the chosen images and exports.
const requestedSlots = new Set(process.argv.slice(2));
const selectedSpecs = requestedSlots.size ? specs.filter(spec => spec[1].some(slot => requestedSlots.has(slot))) : specs;
assert(!requestedSlots.size || selectedSpecs.length === requestedSlots.size, "Unknown or duplicate preview slot");
const produced = [];
for (let i = 0; i < selectedSpecs.length; i += 4) produced.push(...await Promise.all(selectedSpecs.slice(i, i + 4).map(produce)));
const previous = requestedSlots.size ? JSON.parse(await readFile("docs/content/homepage-unsplash-manifest.json", "utf8")) : null;
const assets = specs.map(spec => produced.find(asset => asset.slotIds.includes(spec[1][0])) ?? previous?.assets.find(asset => asset.slotIds.includes(spec[1][0])));
assert(assets.every(Boolean), "Missing preview asset");
const retainedSlotIds = ["quote-garments", "editorial-quintal"];
const approvedHomepage = JSON.parse(await readFile("docs/content/homepage-manifest.json", "utf8"));
const retainedAssets = approvedHomepage.assets.filter(asset => retainedSlotIds.includes(asset.id));
const manifest = {
  revision: "homepage-unsplash-v1", status: "pending-user-review", integrationScope: "Homepage photography awaiting acceptance", recordedAtUtc: new Date().toISOString(),
  directionEvidence: "User requested random children photos for every homepage editorial model scene, children's clothes only for existing scenes without models, untouched catalog imagery, and a dev port for page review.",
  catalogChanges: false, userSelections: sources.userSelections ?? [], retainedSlotIds, retainedAssets, assets,
};
await writeFile("docs/content/homepage-unsplash-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`Prepared ${produced.length} photographs; preview contains ${assets.length} Unsplash photographs and ${assets.reduce((sum, a) => sum + a.crops.length, 0)} responsive crops for ${assets.flatMap(a => a.slotIds).length} homepage slots.`);
