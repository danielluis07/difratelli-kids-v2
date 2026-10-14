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
      try {
        const available = storage!();
        const raw = available.getItem(favoritesStorageKey);
        let ids: string[] = [];
        if (raw !== null) {
          const envelope = JSON.parse(raw);
          if (envelope?.version !== 1 || !Array.isArray(envelope.productIds)) throw new Error("Invalid favorites envelope");
          // Normal saved favorites only; tolerant recovery belongs to the storage-recovery ticket.
          ids = envelope.productIds;
          if (ids.some((id) => typeof id !== "string" || findProduct(id).status === "missing")
            || new Set(ids).size !== ids.length) throw new Error("Invalid saved product");
        }
        target = available;
        storageStatus = { restoration: "ready", persistence: raw === null ? "idle" : "saved" };
        store.setState(snapshot(ids), true);
      } catch {
        storageStatus = { restoration: "temporary", persistence: "unavailable" };
        store.setState(snapshot([]), true);
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
          storageStatus = { restoration: "ready", persistence: "saved" };
        } catch {
          target = undefined;
          storageStatus = { restoration: "temporary", persistence: "unavailable" };
        }
      }
      store.setState(snapshot(next), true);
      return { status: "success", effect: exists ? "removed" : "saved" };
    },
  });
}
