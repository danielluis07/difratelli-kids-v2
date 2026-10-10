import { createStore } from "zustand/vanilla";
import { findProduct, findColorway } from "../catalog";
import { freezeRecords } from "../catalog/records";
import type { Cart, CartSnapshot, CartOutcome, Selection, ResolvedLine } from "../shopping/contracts";

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

// In-memory command core. Persistent restoration is integrated by the shopping
// slice; this factory explicitly reports temporary storage until then.
export function createCart(): Cart {
  const snapshot = (lines: readonly ResolvedLine[]): CartSnapshot => freezeRecords({
    lines, units: lines.reduce((n, line) => n + line.quantity, 0),
    subtotalCents: lines.reduce((n, line) => n + line.totalCents, 0),
    restoration: "temporary" as const, persistence: "unavailable" as const,
  });
  const store = createStore<CartSnapshot>(() => snapshot([]));
  const commit = (lines: readonly ResolvedLine[]) => store.setState(snapshot(lines), true);
  return Object.freeze({
    getSnapshot: store.getState,
    subscribe: (listener: () => void) => store.subscribe(listener),
    add(selection: Selection, quantity = 1): CartOutcome {
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
      if (!resolveSelection(selection)) return rejected("invalid-selection");
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return rejected("invalid-quantity");
      const lines = store.getState().lines;
      if (!lines.some((line) => same(line, selection))) return rejected("missing-line");
      commit(lines.map((line) => same(line, selection) ? { ...line, quantity, totalCents: quantity * line.product.priceCents } : line));
      return success("updated");
    },
    remove(selection: Selection): CartOutcome {
      if (!resolveSelection(selection)) return rejected("invalid-selection");
      const lines = store.getState().lines;
      if (!lines.some((line) => same(line, selection))) return rejected("missing-line");
      commit(lines.filter((line) => !same(line, selection)));
      return success("removed");
    },
    clear(): CartOutcome { commit([]); return success("cleared"); },
  });
}
