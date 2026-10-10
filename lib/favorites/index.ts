import { createStore } from "zustand/vanilla";
import { curatedProducts, findProduct } from "../catalog";
import { freezeRecords } from "../catalog/records";
import type { Favorites, FavoritesOutcome, FavoritesSnapshot } from "../shopping/contracts";

export function createFavorites(): Favorites {
  const snapshot = (ids: readonly string[]): FavoritesSnapshot => freezeRecords({
    products: curatedProducts().filter((p) => ids.includes(p.id)), count: ids.length,
    restoration: "temporary" as const, persistence: "unavailable" as const,
  });
  const store = createStore<FavoritesSnapshot>(() => snapshot([]));
  return Object.freeze({
    getSnapshot: store.getState,
    subscribe: (listener: () => void) => store.subscribe(listener),
    has: (productId: string) => store.getState().products.some((p) => p.id === productId),
    toggle(productId: string): FavoritesOutcome {
      if (findProduct(productId).status === "missing") return { status: "rejected", reason: "invalid-product" };
      const ids = store.getState().products.map((p) => p.id);
      const exists = ids.includes(productId);
      store.setState(snapshot(exists ? ids.filter((id) => id !== productId) : [...ids, productId]), true);
      return { status: "success", effect: exists ? "removed" : "saved" };
    },
  });
}
