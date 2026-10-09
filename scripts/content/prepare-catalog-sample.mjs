import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Exports review drafts at native size. Failed checks remain explicit and never
// become photograph approvals. Originals are not modified or enlarged.
const generation = JSON.parse(await readFile("docs/content/catalog-sample-generation.json", "utf8"));
const catalog = JSON.parse(await readFile("docs/content/catalog-proposal.json", "utf8"));
const cast = JSON.parse(await readFile("docs/content/cast-proposal.json", "utf8"));
const castApproval = JSON.parse(await readFile("docs/content/cast-approval.json", "utf8"));
const sampleApproval = JSON.parse(await readFile("docs/content/catalog-sample-approval.json", "utf8"));
const resolution = sampleApproval.collectionResolutionException;
if (resolution.collectionId !== "collection-001" || resolution.minimumWidth !== 1086 || resolution.minimumHeight !== 1448) {
  throw new Error("Missing explicit collection-specific native resolution acceptance.");
}
const product = catalog.products.find((entry) => entry.id === "product-006");
const colorway = product.colorways.find((entry) => entry.id === "cream-teal-leaf");
const model = cast.models.find((entry) => entry.productIds.includes(product.id));
if (!colorway || model.id !== "model-006" || model.photographedSize !== 4) {
  throw new Error("Sample does not match the approved product/colorway/model/size assignment.");
}
if (generation.records.length !== 2 || generation.records[0].role !== "model" || generation.records[1].role !== "isolated") {
  throw new Error("Sample requires exactly two records, model first and isolated second.");
}
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const approvedReference = castApproval.assets.find((asset) => asset.modelId === model.id);
if (hash(await readFile(approvedReference.originalPath)) !== approvedReference.originalSha256) {
  throw new Error("The approved Davi reference hash has changed.");
}
if (generation.records[0].referencePath !== approvedReference.originalPath ||
    generation.records[1].referencePath !== generation.records[0].originalPath) {
  throw new Error("Sample references must use approved Davi, then the exact worn photograph.");
}
await mkdir("public/images/catalog", { recursive: true });
const assets = [];
for (const [index, record] of generation.records.entries()) {
  const original = await readFile(record.originalPath);
  const source = await sharp(original).metadata();
  const webPath = record.originalPath.replace("assets/originals/", "public/images/").replace(/\.png$/, ".webp");
  const web = await sharp(original).webp({ quality: 90 }).toBuffer();
  const encoded = await sharp(web).metadata();
  if (source.width !== encoded.width || source.height !== encoded.height) {
    throw new Error(`${record.role}: export changed dimensions.`);
  }
  await writeFile(webPath, web);
  const errors = [];
  if (source.width * 4 !== source.height * 3) errors.push("Aspect ratio must be exactly 3:4.");
  if (source.width < resolution.minimumWidth || source.height < resolution.minimumHeight) errors.push("Native dimensions must be at least 1086 × 1448 under the accepted collection revision.");
  const approval = sampleApproval.assets.find((asset) => asset.originalPath === record.originalPath);
  const isApproved = sampleApproval.status === "approved" && approval?.originalSha256 === hash(original) && approval?.webSha256 === hash(web);
  assets.push({
    id: `product-006-cream-teal-leaf-${record.role}-v1`,
    productId: product.id, collectionId: product.collectionId, colorwayId: colorway.id,
    modelId: record.role === "model" ? model.id : null,
    photographedSize: model.photographedSize, role: record.role, galleryOrder: index + 1,
    approvalStatus: isApproved ? "approved" : "pending-human-review", technicalStatus: errors.length ? "needs-regeneration" : "passed-dimensions",
    validationErrors: errors, originalPath: record.originalPath, originalSha256: hash(original),
    webPath, webSha256: hash(web), width: source.width, height: source.height,
    webWidth: encoded.width, webHeight: encoded.height,
    referencePath: record.referencePath, referenceSha256: hash(await readFile(record.referencePath)),
    crop: "full-frame", usage: ["sample-review"],
    intendedUsageAfterApproval: record.role === "model" ? ["product-card-default", "product-gallery"] : ["product-card-hover-focus", "product-gallery"],
    alt: record.role === "model"
      ? "Criança usando o Conjunto Descobertas, com camiseta creme estampada com folhas e besouros e short verde-petróleo; as duas peças aparecem inteiras."
      : "Conjunto Descobertas com camiseta creme estampada com folhas e besouros e short verde-petróleo, apresentado sem modelo sobre fundo branco.",
  });
}
await writeFile("docs/content/catalog-sample-manifest.json", `${JSON.stringify({
  revision: generation.revision, approvalStatus: assets.every((asset) => asset.approvalStatus === "approved") ? "approved" : "pending-human-review",
  technicalStatus: assets.some((asset) => asset.validationErrors.length) ? "needs-regeneration" : "passed-dimensions",
  scope: "Sample pair only. Exact-file approval and collection-specific resolution acceptance are recorded separately; no collection completeness is asserted.", assets,
}, null, 2)}\n`);
console.log(`Exported ${assets.length} sample photographs at native dimensions. ${assets.filter((asset) => asset.validationErrors.length).length} require regeneration; ${assets.filter((asset) => asset.approvalStatus === "approved").length} match recorded human approval.`);
