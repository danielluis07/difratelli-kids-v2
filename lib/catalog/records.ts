import catalogSource from "../../docs/content/catalog-proposal.json";
import copySource from "../../docs/content/copy-proposal.json";
import quintal from "../../docs/content/quintal-manifest.json";
import brincadeira from "../../docs/content/brincadeira-manifest.json";
import imaginacao from "../../docs/content/imaginacao-manifest.json";
import editorialSource from "../../docs/content/editorial-manifest.json";
import identitySource from "../../docs/content/identity-manifest.json";

export type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

export function freezeRecords<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const entry of Object.values(value)) freezeRecords(entry);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

// These are the approved repository records, not a second handwritten catalog.
export const catalog = freezeRecords(catalogSource);
export const copy = freezeRecords(copySource);
export const catalogAssets = freezeRecords([...quintal.assets, ...brincadeira.assets, ...imaginacao.assets]);
export const editorial = freezeRecords(editorialSource);
export const identity = freezeRecords(identitySource);
export type Product = (typeof catalog.products)[number];
export type Collection = (typeof catalog.collections)[number];
export type Colorway = Product["colorways"][number];
export type CatalogAsset = (typeof catalogAssets)[number];
