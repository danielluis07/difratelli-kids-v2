import { describe, expect, it } from "vitest";
import source from "../../docs/content/package-manifest.json";
import { validateCatalog } from "../../lib/catalog/validation";
import { validateContent } from "../../lib/catalog/content-validation";
import { catalog, findProduct, findProductBySlug, findCollectionBySlug, photographs, newArrivals, relatedProducts, formatMoney } from "../../lib/catalog";

describe("approved content boundary", () => {
  it("accepts the complete approved package including the polo revision", () => {
    expect(validateContent(source)).toEqual({ valid: true, diagnostics: [] });
  });
  it.each([
    ["fractional price", "priceCents", (c: typeof source.catalog) => { c.products[0].priceCents = 5900.5; }],
    ["out-of-range price", "priceCents", (c: typeof source.catalog) => { c.products[0].priceCents = 1; }],
    ["duplicate ID", "id", (c: typeof source.catalog) => { c.products[1].id = c.products[0].id; }],
    ["duplicate slug", "slug", (c: typeof source.catalog) => { c.products[1].slug = c.products[0].slug; }],
    ["invalid slug", "slug", (c: typeof source.catalog) => { c.products[0].slug = "Invalid Slug"; }],
    ["missing collection", "collectionId", (c: typeof source.catalog) => { c.products[0].collectionId = "missing"; }],
    ["invalid default", "defaultColorwayId", (c: typeof source.catalog) => { c.products[0].defaultColorwayId = "missing"; }],
    ["duplicate sizes", "sizes", (c: typeof source.catalog) => { c.products[0].sizes = [2, 2, 6, 8]; }],
    ["unknown family", "colorFamilyIds", (c: typeof source.catalog) => { c.products[0].colorways[0].colorFamilyIds = ["missing"]; }],
    ["missing copy", "description", (c: typeof source.catalog) => { c.products[0].description = " "; }],
    ["missing coordination", "coordinatingProductIds", (c: typeof source.catalog) => { c.products[0].coordinatingProductIds = []; }],
    ["bad new arrivals", "newArrivalProductIds", (c: typeof source.catalog) => { c.merchandising.newArrivalProductIds[0] = "missing"; }],
    ["wrong category allocation", "expectedCount", (c: typeof source.catalog) => { c.categories[0].expectedCount = 8; }],
  ] as const)("rejects %s with field diagnostics", (_name, field, mutate) => {
    const changed = structuredClone(source.catalog);
    mutate(changed);
    const result = validateCatalog(changed);
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some((d) => d.field.includes(field))).toBe(true);
    expect(result.diagnostics.every((d) => d.record && d.message)).toBe(true);
  });
  it("identifies malformed product records without throwing", () => {
    const changed = structuredClone(source);
    (changed.catalog.products as unknown[])[0] = null;
    expect(validateCatalog(changed.catalog).valid).toBe(false);
    expect(validateCatalog(null).valid).toBe(false);
  });
  it.each([
    ["required photograph", (p: typeof source) => { p.catalogAssets.pop(); }],
    ["asset relationship", (p: typeof source) => { p.catalogAssets[0].collectionId = "missing"; }],
    ["exact approval", (p: typeof source) => { p.catalogAssets[0].originalSha256 = "0".repeat(64); }],
    ["asset alt", (p: typeof source) => { p.catalogAssets[0].alt = ""; }],
    ["editorial crop", (p: typeof source) => { p.editorial.assets[0].crops[0].approvalStatus = "pending"; }],
    ["UI copy", (p: typeof source) => { p.copy.cart.checkout = ""; }],
    ["copy approval", (p: typeof source) => { p.copy.approvalStatus = "pending"; }],
    ["size guidance", (p: typeof source) => { p.copy.sizeGuidance.rows[0].size = 8; }],
    ["shipping cents", (p: typeof source) => { p.copy.checkout.shipping.priceCents = 1590.5; }],
    ["cast assignment", (p: typeof source) => { p.cast.assets[0].colorwayAssignments[0].colorwayIds = ["missing"]; }],
    ["identity", (p: typeof source) => { p.identity.assets.pop(); }],
    ["file reference", (p: typeof source) => { p.files = p.files.filter((f) => f.path !== p.catalogAssets[0].webPath); }],
  ] as const)("rejects invalid %s", (_name, mutate) => {
    const changed = structuredClone(source);
    mutate(changed);
    expect(validateContent(changed).valid).toBe(false);
  });
  it("resolves lookup absence explicitly and keeps catalog records immutable", () => {
    expect(findProduct("missing")).toEqual({ status: "missing" });
    expect(findProductBySlug("missing")).toEqual({ status: "missing" });
    expect(findCollectionBySlug("missing")).toEqual({ status: "missing" });
    expect(findProductBySlug(catalog.products[0].slug)).toEqual(findProduct(catalog.products[0].id));
    expect(Object.isFrozen(catalog.products[0].colorways)).toBe(true);
    expect(newArrivals()).toHaveLength(8);
    expect(photographs("product-001", "cream-leaf-teal").map((a) => a.role)).toEqual(["model", "isolated"]);
    expect(relatedProducts(catalog.products[0])).toHaveLength(4);
    expect(relatedProducts(catalog.products[0]).every((p) => p.id !== "product-001" && p.collectionId === "collection-001")).toBe(true);
    expect(formatMoney(1590)).toBe("R$\u00a015,90");
    expect(() => formatMoney(1.5)).toThrow(RangeError);
  });
});
