import { createStore } from "zustand/vanilla";
import { curatedProducts, findProduct } from "../catalog";
import { freezeRecords } from "../catalog/records";
import type { Favorites, FavoritesOutcome, FavoritesSnapshot, StorageStatus } from "../shopping/contracts";

export const favoritesStorageKey = "difratelli.favorites";
export type FavoritesStorage = Pick<Storage, "getItem" | "setItem">;

export function createFavorites(storage?: () => FavoritesStorage): Favorites {
  let storageStatus: StorageStatus = storage
    ? { restoration: "pending", persistence: "idle" }
    : { restoration: "temporary", persistence: "unavailable" };
  let target: FavoritesStorage | undefined;
  const snapshot = (ids: readonly string[]): FavoritesSnapshot => freezeRecords({
    products: curatedProducts().filter((p) => ids.includes(p.id)), count: ids.length,
    ...storageStatus,
  });
  const store = createStore<FavoritesSnapshot>(() => snapshot([]));
  return Object.freeze({
    getSnapshot: store.getState,
    subscribe: (listener: () => void) => store.subscribe(listener),
    restore() {
      if (storageStatus.restoration !== "pending") return;
      const temporary = (warning: StorageStatus["warning"]) => {
        storageStatus = { restoration: "temporary", persistence: "unavailable", warning };
        store.setState(snapshot([]), true);
      };
      let available: FavoritesStorage;
      let raw: string | null;
      try {
        available = storage!();
        raw = available.getItem(favoritesStorageKey);
      } catch {
        temporary("readFailure"); return;
      }
      try {
        const ids: string[] = [];
        const recovery = { removed: false, duplicates: false, quantities: false, prices: false };
        if (raw !== null) {
          const envelope = JSON.parse(raw);
          if (!envelope || typeof envelope !== "object" || Array.isArray(envelope) || !Number.isInteger(envelope.version)) {
            temporary("invalidStorage"); return;
          }
          if (envelope.version !== 1) { temporary("unsupportedStorage"); return; }
          if (!Array.isArray(envelope.productIds)) { temporary("invalidStorage"); return; }
          for (const id of envelope.productIds) {
            if (typeof id !== "string" || findProduct(id).status === "missing") recovery.removed = true;
            else if (ids.includes(id)) recovery.duplicates = true;
            else ids.push(id);
          }
        }
        target = available;
        storageStatus = { restoration: "ready", persistence: raw === null ? "idle" : "saved", recovery };
        store.setState(snapshot(ids), true);
      } catch {
        temporary("invalidStorage");
      }
    },
    has: (productId: string) => store.getState().products.some((p) => p.id === productId),
    toggle(productId: string): FavoritesOutcome {
      if (storageStatus.restoration === "pending") return { status: "rejected", reason: "not-ready" };
      if (findProduct(productId).status === "missing") return { status: "rejected", reason: "invalid-product" };
      const ids = store.getState().products.map((p) => p.id);
      const exists = ids.includes(productId);
      const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
      if (target) {
        try {
          target.setItem(favoritesStorageKey, JSON.stringify({ version: 1, productIds: next }));
          storageStatus = { ...storageStatus, restoration: "ready", persistence: "saved" };
        } catch {
          target = undefined;
          storageStatus = { ...storageStatus, restoration: "temporary", persistence: "unavailable", warning: "writeFailure" };
        }
      }
      store.setState(snapshot(next), true);
      return { status: "success", effect: exists ? "removed" : "saved" };
    },
  });
}
