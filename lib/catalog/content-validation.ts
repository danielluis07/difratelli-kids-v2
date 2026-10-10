import { z } from "zod";
import approvedPackage from "../../docs/content/package-manifest.json";
import { validateCatalog, type Diagnostic, type ValidationResult } from "./validation";

const text = z.string().trim().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const dimension = z.number().int().positive();
const path = z.string().regex(/^(?:public|assets|docs)\/(?!.*(?:\.\.|\\)).+$/);
const asset = z.object({ id: text, approvalStatus: z.literal("approved"), originalPath: path, originalSha256: hash,
  width: dimension, height: dimension, alt: text, usage: z.array(text).min(1) });
const photo = asset.extend({ productId: text, collectionId: text, colorwayId: text, modelId: text.nullish(),
  role: z.enum(["model", "isolated"]), galleryOrder: z.union([z.literal(1), z.literal(2)]),
  webPath: path, webSha256: hash, webWidth: dimension, webHeight: dimension, approvalSource: path });
const editorial = asset.extend({ role: text, collectionIds: z.array(text), modelIds: z.array(text),
  crops: z.array(z.object({ name: text, width: dimension, height: dimension, webPath: path, src: text,
    sha256: hash, usage: z.array(text).min(1), approvalStatus: z.literal("approved") })).min(2) });
const measurements = z.tuple([dimension, dimension]).refine(([min, max]) => min <= max, "Invalid measurement range");
const copySchema = z.object({ approvalStatus: z.literal("approved"), language: z.literal("pt-BR"),
  sizeGuidance: z.object({ rows: z.array(z.object({ size: dimension, heightCm: measurements, chestCm: measurements,
    waistCm: measurements, hipsCm: measurements })).length(4) }),
  checkout: z.object({ shipping: z.object({ priceCents: z.literal(1590) }), defaultPaymentId: z.enum(["pix", "card"]),
    completion: z.object({ disclosure: z.literal("Esta compra foi uma simulação. Nenhum pagamento foi realizado e nenhum pedido foi criado.") }) }),
});
const packageSchema = z.object({
  revision: text, catalog: z.unknown(), copy: z.unknown(),
  catalogAssets: z.array(photo).length(84),
  cast: z.object({ approvalStatus: z.literal("approved"), assets: z.array(asset.extend({ modelId: text, webPath: path, webSha256: hash,
    productIds: z.array(text).min(1), collectionIds: z.array(text).min(1),
    colorwayAssignments: z.array(z.object({ productId: text, colorwayIds: z.array(text).min(1) })).min(1) })).length(8) }),
  editorial: z.object({ approvalStatus: z.literal("approved"), assets: z.array(editorial).length(8) }),
  identity: z.object({ approvalStatus: z.literal("approved"), assets: z.array(z.object({ id: text, path,
    sha256: hash, format: z.literal("editable-svg"), approvalStatus: z.literal("approved") })).length(6),
    fonts: z.array(z.object({ path, sha256: hash })).length(4) }),
  precedingApprovals: z.array(z.object({ path, record: z.record(z.string(), z.unknown()) })).min(1),
  files: z.array(z.object({ path, sha256: hash, bytes: z.number().int().positive() })).min(1),
});

// The approved copy is the required-field template. This checks every field,
// including messages for subsequent slices, without maintaining a duplicate copy.
function checkCopy(required: unknown, actual: unknown, field: string, diagnostics: Diagnostic[]) {
  const fail = (message: string) => diagnostics.push({ record: "copy", field, message });
  if (Array.isArray(required)) {
    if (!Array.isArray(actual) || actual.length !== required.length) return fail("Missing or incomplete approved content array");
    required.forEach((entry, index) => checkCopy(entry, actual[index], `${field}.${index}`, diagnostics));
  } else if (required && typeof required === "object") {
    if (!actual || typeof actual !== "object" || Array.isArray(actual)) return fail("Required content object is missing");
    for (const [key, value] of Object.entries(required)) checkCopy(value, (actual as Record<string, unknown>)[key], `${field}.${key}`, diagnostics);
  } else if (typeof required === "string") {
    if (typeof actual !== "string" || !actual.trim()) fail("Required approved text is missing");
  } else if (typeof actual !== typeof required || (typeof actual === "number" && !Number.isFinite(actual))) fail("Invalid content value");
}

export function validateContent(input: unknown): ValidationResult {
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return { valid: false, diagnostics: parsed.error.issues.map((issue) => ({ record: "package", field: issue.path.join("."), message: issue.message })) };
  const p = parsed.data;
  const diagnostics: Diagnostic[] = [...validateCatalog(p.catalog).diagnostics];
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  checkCopy(approvedPackage.copy, p.copy, "", diagnostics);
  const parsedCopy = copySchema.safeParse(p.copy);
  if (!parsedCopy.success) for (const issue of parsedCopy.error.issues) fail("copy", issue.path.join("."), issue.message);
  else if (parsedCopy.data.sizeGuidance.rows.map((r) => r.size).join(",") !== "2,4,6,8") fail("copy", "sizeGuidance.rows.size", "Expected one row per offered size");
  // Do not traverse relationships until catalog shape is known to be valid.
  const catalogResult = validateCatalog(p.catalog);
  if (!catalogResult.valid) return { valid: false, diagnostics };
  const c = p.catalog as typeof import("./records").catalog;
  const models = new Set(p.cast.assets.map((a) => a.modelId));
  if (models.size !== 8) fail("cast", "modelId", "Expected eight distinct child models");
  for (const model of p.cast.assets) {
    if (new Set(model.productIds).size !== model.productIds.length || new Set(model.colorwayAssignments.map((a) => a.productId)).size !== model.colorwayAssignments.length) fail(model.id, "productIds", "Cast assignments must be unique");
    if (model.productIds.some((id) => !c.products.some((product) => product.id === id)) || model.collectionIds.some((id) => !c.collections.some((col) => col.id === id))) fail(model.id, "productIds/collectionIds", "Unknown cast association");
    for (const assignment of model.colorwayAssignments) {
      const product = c.products.find((product) => product.id === assignment.productId);
      if (!product || !model.productIds.includes(product.id) || !model.collectionIds.includes(product.collectionId)
        || new Set(assignment.colorwayIds).size !== assignment.colorwayIds.length
        || assignment.colorwayIds.length !== product.colorways.length
        || assignment.colorwayIds.some((id) => !product.colorways.some((cw) => cw.id === id))) fail(model.id, "colorwayAssignments", "Invalid product/collection/colorway assignment");
    }
  }
  const allAssets = [...p.catalogAssets, ...p.cast.assets, ...p.editorial.assets, ...p.identity.assets];
  if (new Set(allAssets.map((a) => a.id)).size !== allAssets.length) fail("assets", "id", "Asset IDs must be unique");
  for (const product of c.products) {
    const productModels = new Set<string>();
    for (const colorway of product.colorways) {
      const pair = p.catalogAssets.filter((a) => a.productId === product.id && a.colorwayId === colorway.id).sort((a, b) => a.galleryOrder - b.galleryOrder);
      if (pair.length !== 2 || pair[0]?.role !== "model" || pair[0]?.galleryOrder !== 1 || pair[1]?.role !== "isolated" || pair[1]?.galleryOrder !== 2) fail(product.id, `colorways.${colorway.id}.assets`, "Required model-first/isolated-second approved pair is missing");
      const model = pair[0]?.modelId;
      if (!model || !models.has(model)) fail(product.id, `colorways.${colorway.id}.modelId`, "Unknown child model");
      else {
        productModels.add(model);
        if (!p.cast.assets.find((asset) => asset.modelId === model)?.colorwayAssignments.some((a) => a.productId === product.id && a.colorwayIds.includes(colorway.id))) fail(product.id, `colorways.${colorway.id}.modelId`, "Child differs from approved cast assignment");
      }
      if (pair[1]?.modelId) fail(product.id, `colorways.${colorway.id}.assets`, "Isolated photograph has no child model");
    }
    if (productModels.size !== 1) fail(product.id, "colorways.modelId", "Use the same child across all colorways");
  }
  for (const a of p.catalogAssets) {
    const product = c.products.find((prod) => prod.id === a.productId);
    if (!product || product.collectionId !== a.collectionId || !product.colorways.some((cw) => cw.id === a.colorwayId)) fail(a.id, "productId/colorwayId/collectionId", "Unknown or inconsistent asset association");
    // Native 1086 × 1448 exceptions are scoped to exact files in approved package.
    // File/hash approval below prevents extending this exception to new imagery.
    if (a.width * 4 !== a.height * 3 || a.width < 1086 || a.height < 1448) fail(a.id, "width/height", "Invalid approved catalog photograph dimensions");
    if (a.webWidth !== a.width || a.webHeight !== a.height) fail(a.id, "webWidth/webHeight", "Catalog pair must preserve approved dimensions");
    const approval = p.precedingApprovals.find((entry) => entry.path === a.approvalSource)?.record;
    const entries = (approval?.assets ?? approval?.files) as { id?: string; path?: string; originalSha256?: string; sha256?: string }[] | undefined;
    const exact = entries?.find((entry) => entry.id === a.id || entry.path === a.originalPath);
    if (!approval || (approval.status ?? approval.approvalStatus) !== "approved" || (exact?.originalSha256 ?? exact?.sha256) !== a.originalSha256) fail(a.id, "approvalSource", "Missing exact approved photograph bytes");
  }
  const requiredRoles: Record<string, number> = { "hero-left": 1, "hero-right": 1, collection: 3, "brand-opening": 1, "brand-section": 2 };
  for (const [role, count] of Object.entries(requiredRoles)) if (p.editorial.assets.filter((a) => a.role === role).length !== count) fail("editorial", "role", `Expected ${count} ${role} scenes`);
  for (const col of c.collections) if (p.editorial.assets.filter((a) => a.role === "collection" && a.collectionIds.includes(col.id)).length !== 1) fail(col.id, "editorial", "Required collection photograph missing");
  for (const a of p.editorial.assets) {
    if (a.modelIds.some((mid) => !models.has(mid)) || a.collectionIds.some((cid) => !c.collections.some((col) => col.id === cid))) fail(a.id, "modelIds/collectionIds", "Unknown editorial association");
    if (new Set(a.crops.map((crop) => crop.name)).size !== a.crops.length) fail(a.id, "crops.name", "Crop names must be unique");
    if (!["desktop", "compact"].every((name) => a.crops.some((crop) => crop.name === name))) fail(a.id, "crops", "Required desktop and compact crops missing");
    for (const crop of a.crops) if (crop.src !== crop.webPath.replace(/^public/, "")) fail(a.id, `crops.${crop.name}.src`, "Public URL must resolve to crop file");
  }
  for (const id of ["wordmark-brown-v1", "wordmark-white-v1", "motif-sprout-v1", "motif-chalk-path-v1", "motif-spark-v1", "favicon-v1"]) if (!p.identity.assets.some((a) => a.id === id)) fail("identity", "assets", `Required approved SVG ${id} missing`);
  const files = new Map(p.files.map((f) => [f.path, f]));
  if (files.size !== p.files.length) fail("package", "files.path", "File paths must be unique");
  const reference = (record: string, field: string, path: string, sha256: string) => {
    if (files.get(path)?.sha256 !== sha256) fail(record, field, `Required approved file reference does not resolve: ${path}`);
  };
  for (const a of [...p.catalogAssets, ...p.cast.assets, ...p.editorial.assets]) reference(a.id, "originalPath", a.originalPath, a.originalSha256);
  for (const a of [...p.catalogAssets, ...p.cast.assets]) reference(a.id, "webPath", a.webPath, a.webSha256);
  for (const a of p.editorial.assets) for (const crop of a.crops) reference(a.id, `crops.${crop.name}.webPath`, crop.webPath, crop.sha256);
  for (const a of [...p.identity.assets, ...p.identity.fonts]) reference("id" in a && typeof a.id === "string" ? a.id : "identity.font", "path", a.path, a.sha256);
  return { valid: diagnostics.length === 0, diagnostics };
}
