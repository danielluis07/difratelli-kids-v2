import { catalog, curatedProducts, newArrivals } from "../catalog";
import type { Product } from "../catalog";

export type BrowseScope = { readonly kind: "catalog" | "new-arrivals" | "search" }
  | { readonly kind: "audience"; readonly audienceId: "girls" | "boys" }
  | { readonly kind: "collection"; readonly collectionId: string };
export type Sort = "curated" | "preco-asc" | "preco-desc";
export type BrowseState = {
  readonly query: string; readonly sort: Sort;
  readonly categories: readonly string[]; readonly sizes: readonly number[];
  readonly families: readonly string[]; readonly collections: readonly string[]; readonly audiences: readonly string[];
};
export const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, " ");
const normalizeMatch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const supportsAudience = (scope: BrowseScope) => scope.kind === "catalog" || scope.kind === "search";
export function parseBrowseUrl(scope: BrowseScope, params: Pick<URLSearchParams, "get" | "getAll">): BrowseState {
  const values = (key: string, allowed: readonly string[]) => allowed.filter((value) => params.getAll(key).includes(value));
  const sort = params.get("ordem");
  return Object.freeze({
    query: scope.kind === "search" ? normalizeQuery(params.get("q") ?? "") : "",
    sort: sort === "preco-asc" || sort === "preco-desc" ? sort : "curated",
    categories: Object.freeze(values("categoria", catalog.categories.map((c) => c.id))),
    sizes: Object.freeze(values("tamanho", ["2", "4", "6", "8"]).map(Number)),
    families: Object.freeze(values("familia", catalog.colorFamilies.map((f) => f.id))),
    collections: Object.freeze(scope.kind === "collection" ? [] : values("colecao", catalog.collections.map((c) => c.id))),
    audiences: Object.freeze(supportsAudience(scope) ? values("publico", catalog.audiences.map((a) => a.id)) : []),
  });
}
export function serializeBrowseUrl(scope: BrowseScope, state: BrowseState): string {
  const params = new URLSearchParams();
  if (scope.kind === "search" && normalizeQuery(state.query)) params.set("q", normalizeQuery(state.query));
  for (const [key, values] of [["categoria", state.categories], ["tamanho", state.sizes], ["familia", state.families], ["colecao", state.collections], ["publico", state.audiences]] as const) {
    for (const value of values) params.append(key, String(value));
  }
  if (state.sort !== "curated") params.set("ordem", state.sort);
  // Normalize at the same public boundary used for incoming values.
  const valid = parseBrowseUrl(scope, params);
  const result = new URLSearchParams();
  if (valid.query) result.set("q", valid.query);
  for (const [key, values] of [["categoria", valid.categories], ["tamanho", valid.sizes], ["familia", valid.families], ["colecao", valid.collections], ["publico", valid.audiences]] as const) {
    for (const value of values) result.append(key, String(value));
  }
  if (valid.sort !== "curated") result.set("ordem", valid.sort);
  return result.toString();
}
export function resetBrowseFilters(scope: BrowseScope, state: BrowseState): BrowseState {
  const params = new URLSearchParams();
  if (scope.kind === "search") params.set("q", state.query);
  return parseBrowseUrl(scope, params);
}
export function browse(scope: BrowseScope, state: BrowseState): { readonly products: readonly Product[]; readonly count: number } {
  const normalized = parseBrowseUrl(scope, new URLSearchParams(serializeBrowseUrl(scope, state)));
  const words = normalizeMatch(normalized.query).split(" ").filter(Boolean);
  const base = scope.kind === "new-arrivals" ? newArrivals() : curatedProducts();
  const products = base.filter((p) => {
    if (scope.kind === "audience" && p.audienceId !== scope.audienceId && p.audienceId !== "both") return false;
    if (scope.kind === "collection" && p.collectionId !== scope.collectionId) return false;
    if (scope.kind === "search") {
      if (!words.length) return false;
      const category = catalog.categories.find((c) => c.id === p.categoryId);
      const collection = catalog.collections.find((c) => c.id === p.collectionId);
      const haystack = normalizeMatch(`${p.name} ${category?.name ?? ""} ${collection?.name ?? ""}`);
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return (!normalized.categories.length || normalized.categories.includes(p.categoryId))
      && (!normalized.sizes.length || normalized.sizes.some((size) => p.sizes.includes(size)))
      && (!normalized.families.length || p.colorways.some((cw) => cw.colorFamilyIds.some((f) => normalized.families.includes(f))))
      && (!normalized.collections.length || normalized.collections.includes(p.collectionId))
      && (!normalized.audiences.length || normalized.audiences.some((a) => p.audienceId === a || (p.audienceId === "both" && a !== "both")));
  });
  products.sort((a, b) => normalized.sort === "curated" ? a.curatedRank - b.curatedRank
    : (a.priceCents - b.priceCents) * (normalized.sort === "preco-asc" ? 1 : -1) || a.curatedRank - b.curatedRank);
  return Object.freeze({ products: Object.freeze(products), count: products.length });
}
export function parseProductColor(product: Product, params: Pick<URLSearchParams, "get">): string {
  const color = params.get("cor");
  return product.colorways.some((c) => c.id === color) ? color! : product.defaultColorwayId;
}
