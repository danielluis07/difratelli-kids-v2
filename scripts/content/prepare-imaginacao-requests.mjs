import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

// Prepare approved inputs only. Requests are not generated or approved assets.
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const catalog = await json("docs/content/catalog-proposal.json");
const approval = await json("docs/content/approval.json");
const cast = await json("docs/content/cast-proposal.json");
const castApproval = await json("docs/content/cast-approval.json");
if (approval.status !== "approved" || castApproval.status !== "approved") {
  throw new Error("Catalog and cast approval are required before photography.");
}
for (const file of approval.files) {
  if (hash(await readFile(file.path)) !== file.approvedSha256) {
    throw new Error(`${file.path}: approved content changed.`);
  }
}
const products = catalog.products.filter((product) => product.collectionId === "collection-003");
if (products.length !== 10 || products.reduce((count, product) => count + product.colorways.length, 0) !== 14) {
  throw new Error("Imaginação requires ten products and fourteen colorways.");
}
const requests = [];
const resolution = await json("docs/content/imaginacao-resolution-acceptance.json");
if (resolution.status !== "accepted" || resolution.collectionId !== "collection-003" || resolution.minimumWidth !== 1086 || resolution.minimumHeight !== 1448) throw new Error("Missing explicit Imaginação native-resolution acceptance.");
for (const product of products) {
  const models = cast.models.filter((model) => model.productIds.includes(product.id));
  if (models.length !== 1) throw new Error(`${product.id}: requires exactly one assigned child.`);
  const model = models[0];
  const reference = castApproval.assets.find((asset) => asset.modelId === model.id);
  if (!reference || hash(await readFile(reference.originalPath)) !== reference.originalSha256) {
    throw new Error(`${product.id}: approved child reference missing or changed.`);
  }
  if (!product.sizes.includes(model.photographedSize)) throw new Error(`${product.id}: invalid assigned size.`);
  for (const colorway of product.colorways) {
    const stem = `${product.id}-${colorway.id}`;
    for (const role of ["model", "isolated"]) {
      const originalPath = `assets/originals/catalog/${stem}-${role}-v1.png`;
      requests.push({
        id: `${stem}-${role}-v1`, productId: product.id, collectionId: product.collectionId,
        colorwayId: colorway.id, modelId: role === "model" ? model.id : null,
        photographedSize: model.photographedSize, role, galleryOrder: role === "model" ? 1 : 2,
        generationStatus: "not-generated", approvalStatus: "pending-human-review",
        originalPath, webPath: `public/images/catalog/${stem}-${role}-v1.webp`,
        mode: role === "model" ? "virtual_model_tryout" : "product_shot",
        referencePaths: [role === "model" ? reference.originalPath : `assets/originals/catalog/${stem}-model-v1.png`],
        approvedIdentity: role === "model" ? { ...model, referenceSha256: reference.originalSha256 } : null,
        productName: product.name, garmentBrief: product.garmentBrief,
        garmentColors: colorway.garmentColors, includedPieces: product.includedPieces,
        alt: role === "model"
          ? `${model.name} usando ${product.name} na cor ${colorway.name}, com ${product.includedPieces.length ? "as duas peças inteiras visíveis" : "a peça inteira visível"} sobre fundo branco.`
          : `${product.name} na cor ${colorway.name}, ${product.includedPieces.length ? "com as duas peças apresentadas" : "apresentado"} sem modelo sobre fundo branco.`,
        usage: role === "model" ? ["product-card-default", "product-gallery"] : ["product-card-hover-focus", "product-gallery"],
      });
    }
  }
}
await writeFile("docs/content/imaginacao-requests.json", `${JSON.stringify({
  revision: "issue-27-imaginacao-v1", sourceIssue: "https://github.com/danielluis07/difratelli-kids-v2/issues/27",
  collectionId: "collection-003", status: "requests-only",
  resolutionAcceptancePath: "docs/content/imaginacao-resolution-acceptance.json",
  contract: { minimumWidth: resolution.minimumWidth, minimumHeight: resolution.minimumHeight, aspectRatio: "3:4", background: "opaque-white", crop: "full-frame", webpQuality: 90, enlargementAllowed: false },
  sampleReuse: "None: the approved product-006 sample belongs to collection-001.",
  requests,
}, null, 2)}\n`);
console.log(`Prepared ${requests.length} ordered requests with verified approved catalog and identity references. No photographs or approvals asserted.`);
