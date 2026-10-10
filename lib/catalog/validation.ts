import { z } from "zod";

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const slug = id;
const integer = z.number().int().safe().positive();
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const approved = z.literal("approved");
const category = z.object({ id, name: text, expectedCount: integer, priceRangeCents: z.tuple([integer, integer]) });
const product = z.object({
  id, slug, name: text, categoryId: id, audienceId: z.enum(["girls", "boys", "both"]), collectionId: id,
  pattern: z.enum(["printed", "plain", "striped"]), priceCents: integer,
  sizes: z.array(z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(8)])).length(4),
  initialSize: z.null(), defaultColorwayId: id, description: text, composition: text, fitGuidance: text,
  colorways: z.array(z.object({ id, name: text, swatch: hex, colorFamilyIds: z.array(id).min(1),
    garmentColors: z.array(z.object({ name: text, hex })).min(1) })).min(1),
  includedPieces: z.array(text), coordinatingProductIds: z.array(id), curatedRank: integer,
  garmentBrief: z.object({ language: z.literal("en"), fabric: text, silhouette: text, print: text,
    colorPlacement: text, finishing: text, contents: text }),
});
const collection = z.object({ id, slug, name: text, story: text, garmentBrief: text,
  garmentPalette: z.array(z.object({ id, name: text, hex })).min(1), productIds: z.array(id).length(10) });
const action = z.object({ label: text, href: text });
const merchandising = z.object({
  curatedProductIds: z.array(id).length(30), newArrivalProductIds: z.array(id).length(8),
  homepage: z.object({
    newArrivals: z.object({ heading: text, intro: text, productIds: z.array(id).length(4), viewAll: action }),
    firstCollectionFeature: z.object({ collectionId: id, heading: text, body: text, action }),
    secondCollectionFeature: z.object({ collectionId: id, heading: text, body: text, productIds: z.array(id).length(4), viewAll: action }),
    categoryTiles: z.array(z.object({ categoryId: id, label: text, productId: id, colorwayId: id, href: text })).length(8),
    brandCollectionLink: action,
  }),
});
export const catalogSchema = z.object({
  revision: text, approvalStatus: approved, language: z.literal("pt-BR"), currency: z.literal("BRL"),
  categories: z.array(category).length(8), audiences: z.array(z.object({ id, name: text })).length(3),
  colorFamilies: z.array(z.object({ id, name: text })).min(1), collections: z.array(collection).length(3),
  products: z.array(product).length(30), merchandising,
});
export type Diagnostic = { readonly record: string; readonly field: string; readonly message: string };
export type ValidationResult = { readonly valid: boolean; readonly diagnostics: readonly Diagnostic[] };

export function validateCatalog(input: unknown): ValidationResult {
  const diagnostics: Diagnostic[] = [];
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) {
    const raw = input as { products?: { id?: string }[]; collections?: { id?: string }[] } | null;
    for (const issue of parsed.error.issues) {
      const [kind, index, ...rest] = issue.path;
      const records = kind === "products" ? raw?.products : kind === "collections" ? raw?.collections : undefined;
      diagnostics.push({ record: typeof index === "number" ? records?.[index]?.id ?? `${String(kind)}[${index}]` : "catalog",
        field: records ? rest.join(".") : issue.path.join("."), message: issue.message });
    }
    return { valid: false, diagnostics };
  }
  const c = parsed.data;
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  const unique = (values: readonly string[], record: string, field: string) => {
    if (new Set(values).size !== values.length) fail(record, field, "Values must be unique");
  };
  for (const [name, records] of Object.entries({ products: c.products, collections: c.collections, categories: c.categories, audiences: c.audiences, colorFamilies: c.colorFamilies })) {
    unique(records.map((r) => r.id), name, "id");
  }
  unique(c.products.map((p) => p.slug), "products", "slug");
  unique(c.collections.map((r) => r.slug), "collections", "slug");
  unique(c.products.map((p) => String(p.curatedRank)), "products", "curatedRank");
  const products = new Map(c.products.map((p) => [p.id, p]));
  const expectedCategories: Record<string, number> = { "t-shirts": 6, polos: 2, tops: 4, shorts: 5, trousers: 4, dresses: 3, "matching-sets": 4, "light-layers": 2 };
  const ranges: Record<string, readonly number[]> = { "t-shirts": [4900, 7900], polos: [7900, 7900], tops: [4900, 7900], shorts: [6900, 11900], trousers: [6900, 11900], dresses: [9900, 15900], "matching-sets": [11900, 17900], "light-layers": [9900, 14900] };
  for (const cat of c.categories) {
    const range = ranges[cat.id];
    if (!range || cat.priceRangeCents.some((v, i) => v !== range[i])) fail(cat.id, "priceRangeCents", "Must match approved category range");
    if (cat.expectedCount !== expectedCategories[cat.id] || c.products.filter((p) => p.categoryId === cat.id).length !== expectedCategories[cat.id]) fail(cat.id, "expectedCount", "Must match approved assortment allocation");
  }
  if (c.products.reduce((n, p) => n + p.colorways.length, 0) !== 42) fail("catalog", "products.colorways", "Expected 42 colorways");
  const allocations: Record<string, readonly number[]> = { "collection-001": [5, 5, 0], "collection-002": [5, 4, 1], "collection-003": [6, 4, 0] };
  for (const col of c.collections) {
    const members = c.products.filter((p) => p.collectionId === col.id);
    unique(col.productIds, col.id, "productIds");
    if (members.length !== 10 || col.productIds.some((pid) => products.get(pid)?.collectionId !== col.id)) fail(col.id, "productIds", "Expected all ten collection members");
    if (members.reduce((n, p) => n + p.colorways.length, 0) !== 14) fail(col.id, "colorways", "Expected 14 colorways");
    for (const [audience, count] of [["girls", 4], ["boys", 4], ["both", 2]] as const) {
      if (members.filter((p) => p.audienceId === audience).length !== count) fail(col.id, "audienceId", `Expected ${count} ${audience} products`);
    }
    ["printed", "plain", "striped"].forEach((pattern, i) => {
      if (members.filter((p) => p.pattern === pattern).length !== allocations[col.id]?.[i]) fail(col.id, "pattern", "Must match approved pattern allocation");
    });
    if (col.productIds.some((pid, i) => pid !== [...members].sort((a, b) => a.curatedRank - b.curatedRank)[i]?.id)) fail(col.id, "productIds", "Expected curated order");
  }
  for (const p of c.products) {
    const cat = c.categories.find((cat) => cat.id === p.categoryId);
    if (!cat) fail(p.id, "categoryId", "Unknown category");
    else if (p.priceCents < cat.priceRangeCents[0] || p.priceCents > cat.priceRangeCents[1]) fail(p.id, "priceCents", "Outside approved category range");
    if (!c.collections.some((col) => col.id === p.collectionId)) fail(p.id, "collectionId", "Unknown collection");
    if (p.sizes.join(",") !== "2,4,6,8") fail(p.id, "sizes", "Expected sizes 2,4,6,8 exactly once");
    unique(p.colorways.map((cw) => cw.id), p.id, "colorways.id");
    if (!p.colorways.some((cw) => cw.id === p.defaultColorwayId)) fail(p.id, "defaultColorwayId", "Unknown offered colorway");
    const expectedOptions = p.pattern === "plain" && p.categoryId !== "polos" ? 2 : 1;
    if (p.colorways.length !== expectedOptions) fail(p.id, "colorways", "Incorrect approved option allocation");
    for (const cw of p.colorways) {
      unique(cw.colorFamilyIds, p.id, `colorways.${cw.id}.colorFamilyIds`);
      if (cw.colorFamilyIds.some((fid) => !c.colorFamilies.some((f) => f.id === fid))) fail(p.id, `colorways.${cw.id}.colorFamilyIds`, "Unknown color family");
    }
    if (p.includedPieces.length !== (p.categoryId === "matching-sets" ? 2 : 0)) fail(p.id, "includedPieces", "Matching sets contain exactly two pieces; separates contain none");
    unique(p.coordinatingProductIds, p.id, "coordinatingProductIds");
    if (p.coordinatingProductIds.some((pid) => pid === p.id || products.get(pid)?.collectionId !== p.collectionId)) fail(p.id, "coordinatingProductIds", "Must reference other products in the same collection");
    if (p.pattern === "printed" && !["matching-sets", "dresses"].includes(p.categoryId) && !p.coordinatingProductIds.some((pid) => {
      const other = products.get(pid); return other?.pattern === "plain" && other.categoryId !== "matching-sets";
    })) fail(p.id, "coordinatingProductIds", "Printed separates need a coordinating plain separate");
  }
  const checkIds = (ids: readonly string[], field: string) => {
    unique(ids, "merchandising", field);
    if (ids.some((pid) => !products.has(pid))) fail("merchandising", field, "Unknown product reference");
  };
  const m = c.merchandising;
  checkIds(m.curatedProductIds, "curatedProductIds");
  if (m.curatedProductIds.some((pid, i) => pid !== [...c.products].sort((a, b) => a.curatedRank - b.curatedRank)[i]?.id)) fail("merchandising", "curatedProductIds", "Expected complete curated ordering");
  checkIds(m.newArrivalProductIds, "newArrivalProductIds");
  checkIds(m.homepage.newArrivals.productIds, "homepage.newArrivals.productIds");
  if (m.homepage.newArrivals.productIds.some((pid) => !m.newArrivalProductIds.includes(pid))) fail("merchandising", "homepage.newArrivals.productIds", "Must belong to approved new arrivals");
  const features = [m.homepage.firstCollectionFeature, m.homepage.secondCollectionFeature];
  for (const feature of features) if (!c.collections.some((col) => col.id === feature.collectionId)) fail("merchandising", "homepage.collectionId", "Unknown collection");
  checkIds(m.homepage.secondCollectionFeature.productIds, "homepage.secondCollectionFeature.productIds");
  if (m.homepage.secondCollectionFeature.productIds.some((pid) => products.get(pid)?.collectionId !== m.homepage.secondCollectionFeature.collectionId)) fail("merchandising", "homepage.secondCollectionFeature.productIds", "Products must belong to featured collection");
  unique(m.homepage.categoryTiles.map((t) => t.categoryId), "merchandising", "homepage.categoryTiles.categoryId");
  for (const tile of m.homepage.categoryTiles) {
    const p = products.get(tile.productId);
    if (!p || p.categoryId !== tile.categoryId || !p.colorways.some((cw) => cw.id === tile.colorwayId)) fail("merchandising", `homepage.categoryTiles.${tile.categoryId}`, "Invalid category/product/colorway relationship");
    if (tile.href !== `/produtos?categoria=${tile.categoryId}`) fail("merchandising", `homepage.categoryTiles.${tile.categoryId}.href`, "Must filter the existing catalog route");
  }
  return { valid: diagnostics.length === 0, diagnostics };
}
