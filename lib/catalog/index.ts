import { catalog, catalogAssets, editorial, identity } from "./records";
import type { Product } from "./records";
export { catalog, copy, catalogAssets, editorial, identity } from "./records";
export type { Product, Collection, Colorway, CatalogAsset, DeepReadonly } from "./records";

export type Lookup<T> = { readonly status: "found"; readonly value: T } | { readonly status: "missing" };
function lookup<T>(value: T | undefined): Lookup<T> {
  return value === undefined ? { status: "missing" } : { status: "found", value };
}
const productsById = new Map(catalog.products.map((p) => [p.id, p]));
const productsBySlug = new Map(catalog.products.map((p) => [p.slug, p]));
export const findProduct = (id: string) => lookup(productsById.get(id));
export const findProductBySlug = (slug: string) => lookup(productsBySlug.get(slug));
export const findCollection = (id: string) => lookup(catalog.collections.find((c) => c.id === id));
export const findCollectionBySlug = (slug: string) => lookup(catalog.collections.find((c) => c.slug === slug));
export const findColorway = (product: Product, id: string) => lookup(product.colorways.find((c) => c.id === id));
export const findAsset = (id: string) => lookup(
  catalogAssets.find((a) => a.id === id) ?? editorial.assets.find((a) => a.id === id) ?? identity.assets.find((a) => a.id === id),
);
export function productsForIds(ids: readonly string[]): readonly Product[] {
  return Object.freeze(ids.flatMap((id) => {
    const result = findProduct(id);
    return result.status === "found" ? [result.value] : [];
  }));
}
export const curatedProducts = () => productsForIds(catalog.merchandising.curatedProductIds);
export const newArrivals = () => productsForIds(catalog.merchandising.newArrivalProductIds);
export function photographs(productId: string, colorwayId: string) {
  return Object.freeze(catalogAssets.filter((a) => a.productId === productId && a.colorwayId === colorwayId)
    .sort((a, b) => a.galleryOrder - b.galleryOrder));
}
export function relatedProducts(product: Product) {
  return Object.freeze(curatedProducts().filter((p) => p.collectionId === product.collectionId && p.id !== product.id).slice(0, 4));
}
export function formatMoney(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new RangeError("Money must be nonnegative integer centavos");
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
