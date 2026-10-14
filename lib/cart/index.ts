import { createStore } from "zustand/vanilla";
import { findProduct, findColorway } from "../catalog";
import { freezeRecords } from "../catalog/records";
import type { Cart, CartSnapshot, CartOutcome, Selection, ResolvedLine, StorageStatus } from "../shopping/contracts";

const same = (a: Selection, b: Selection) => a.productId === b.productId && a.colorwayId === b.colorwayId && a.size === b.size;
const rejected = (reason: Extract<CartOutcome, { status: "rejected" }>["reason"]): CartOutcome => ({ status: "rejected", reason });
const success = (effect: Extract<CartOutcome, { status: "success" }>["effect"]): CartOutcome => ({ status: "success", effect });
function resolveSelection(selection: Selection) {
  if (!selection || typeof selection.productId !== "string" || typeof selection.colorwayId !== "string") return null;
  const p = findProduct(selection.productId);
  if (p.status === "missing" || !p.value.sizes.includes(selection.size)) return null;
  const c = findColorway(p.value, selection.colorwayId);
  return c.status === "found" ? { product: p.value, colorway: c.value } : null;
}

export const cartStorageKey = "difratelli.cart";
export type CartStorage = Pick<Storage, "getItem" | "setItem">;

// Storage is acquired only by restore(), after the presentation mounts.
// Omitting storage retains the independent in-memory command seam.
export function createCart(storage?: () => CartStorage): Cart {
  let storageStatus: StorageStatus = storage
    ? { restoration: "pending", persistence: "idle" }
    : { restoration: "temporary", persistence: "unavailable" };
  let target: CartStorage | undefined;
  const snapshot = (lines: readonly ResolvedLine[]): CartSnapshot => freezeRecords({
    lines, units: lines.reduce((n, line) => n + line.quantity, 0),
    subtotalCents: lines.reduce((n, line) => n + line.totalCents, 0),
    ...storageStatus,
  });
  const store = createStore<CartSnapshot>(() => snapshot([]));
  const commit = (lines: readonly ResolvedLine[]) => {
    if (target) {
      try {
        target.setItem(cartStorageKey, JSON.stringify({ version: 1, lines: lines.map((line) => ({
          productId: line.productId, colorwayId: line.colorwayId, size: line.size,
          quantity: line.quantity, lastSeenUnitPriceCents: line.product.priceCents,
        })) }));
        storageStatus = { ...storageStatus, restoration: "ready", persistence: "saved" };
      } catch {
        target = undefined;
        storageStatus = { ...storageStatus, restoration: "temporary", persistence: "unavailable", warning: "writeFailure" };
      }
    }
    store.setState(snapshot(lines), true);
  };
  return Object.freeze({
    getSnapshot: store.getState,
    subscribe: (listener: () => void) => store.subscribe(listener),
    restore() {
      if (storageStatus.restoration !== "pending") return;
      const temporary = (warning: StorageStatus["warning"]) => {
        storageStatus = { restoration: "temporary", persistence: "unavailable", warning };
        store.setState(snapshot([]), true);
      };
      let available: CartStorage;
      let raw: string | null;
      try {
        available = storage!();
        raw = available.getItem(cartStorageKey);
      } catch {
        temporary("readFailure");
        return;
      }
      try {
        const restored: ResolvedLine[] = [];
        const recovery = { removed: false, duplicates: false, quantities: false, prices: false };
        if (raw !== null) {
          const envelope = JSON.parse(raw);
          if (!envelope || typeof envelope !== "object" || Array.isArray(envelope) || !Number.isInteger(envelope.version)) {
            temporary("invalidStorage"); return;
          }
          if (envelope.version !== 1) { temporary("unsupportedStorage"); return; }
          if (!Array.isArray(envelope.lines)) { temporary("invalidStorage"); return; }
          for (const entry of envelope.lines) {
            const resolved = resolveSelection(entry);
            if (!resolved || !Number.isInteger(entry.quantity) || entry.quantity < 1) {
              recovery.removed = true; continue;
            }
            // A missing/malformed comparison price cannot invalidate a selection.
            if (Number.isSafeInteger(entry.lastSeenUnitPriceCents) && entry.lastSeenUnitPriceCents > 0
              && entry.lastSeenUnitPriceCents !== resolved.product.priceCents) recovery.prices = true;
            const quantity = Math.min(10, entry.quantity);
            if (quantity !== entry.quantity) recovery.quantities = true;
            const existing = restored.find((line) => same(line, entry));
            if (existing) {
              recovery.duplicates = true;
              const totalQuantity = existing.quantity + quantity;
              if (totalQuantity > 10) recovery.quantities = true;
              const mergedQuantity = Math.min(10, totalQuantity);
              restored[restored.indexOf(existing)] = { ...existing, quantity: mergedQuantity, totalCents: mergedQuantity * existing.product.priceCents };
              continue;
            }
            restored.push({ productId: resolved.product.id, colorwayId: resolved.colorway.id,
              size: entry.size, quantity, ...resolved, totalCents: quantity * resolved.product.priceCents });
          }
        }
        target = available;
        storageStatus = { restoration: "ready", persistence: raw === null ? "idle" : "saved", recovery };
        store.setState(snapshot(restored), true);
      } catch {
        temporary("invalidStorage");
      }
    },
    add(selection: Selection, quantity = 1): CartOutcome {
      if (storageStatus.restoration === "pending") return rejected("not-ready");
      const resolved = resolveSelection(selection);
      if (!resolved) return rejected("invalid-selection");
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return rejected("invalid-quantity");
      const lines = store.getState().lines;
      const existing = lines.find((line) => same(line, selection));
      const requested = (existing?.quantity ?? 0) + quantity;
      const nextQuantity = Math.min(10, requested);
      const line = { productId: resolved.product.id, colorwayId: resolved.colorway.id, size: selection.size,
        quantity: nextQuantity, ...resolved, totalCents: nextQuantity * resolved.product.priceCents };
      commit(existing ? lines.map((entry) => same(entry, selection) ? line : entry) : [...lines, line]);
      return success(requested > 10 ? "quantity-limited" : existing ? "merged" : "added");
    },
    setQuantity(selection: Selection, quantity: number): CartOutcome {
      if (storageStatus.restoration === "pending") return rejected("not-ready");
      if (!resolveSelection(selection)) return rejected("invalid-selection");
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return rejected("invalid-quantity");
      const lines = store.getState().lines;
      if (!lines.some((line) => same(line, selection))) return rejected("missing-line");
      commit(lines.map((line) => same(line, selection) ? { ...line, quantity, totalCents: quantity * line.product.priceCents } : line));
      return success("updated");
    },
    remove(selection: Selection): CartOutcome {
      if (storageStatus.restoration === "pending") return rejected("not-ready");
      if (!resolveSelection(selection)) return rejected("invalid-selection");
      const lines = store.getState().lines;
      if (!lines.some((line) => same(line, selection))) return rejected("missing-line");
      commit(lines.filter((line) => !same(line, selection)));
      return success("removed");
    },
    clear(): CartOutcome {
      if (storageStatus.restoration === "pending") return rejected("not-ready");
      commit([]); return success("cleared");
    },
  });
}
