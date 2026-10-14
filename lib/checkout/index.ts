import { copy } from "../catalog";
import type { CheckoutDraft, CheckoutTotals, Delivery, DeliveryErrors } from "../shopping/contracts";
import { freezeRecords } from "../catalog/records";
import { createStore } from "zustand/vanilla";
import type { Cart, Checkout, CheckoutOutcome, CheckoutSnapshot, Confirmation } from "../shopping/contracts";
export type { Checkout, CheckoutOutcome, Confirmation, CheckoutDraft, Delivery, DeliveryErrors } from "../shopping/contracts";

export function initialCheckoutDraft(): CheckoutDraft {
  return freezeRecords({ delivery: { ...copy.checkout.defaults }, payment: "pix" as const });
}
export function validateDelivery(delivery: Delivery): DeliveryErrors {
  const errors: DeliveryErrors = {};
  for (const key of ["name", "email", "postalCode", "street", "number", "neighborhood", "city", "state"] as const) {
    if (typeof delivery[key] !== "string" || !delivery[key].trim()) errors[key] = "required";
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email.trim())) errors.email = "invalid";
  if (!errors.postalCode && !/^\d{8}$/.test(delivery.postalCode.replace(/[\s-]/g, ""))) errors.postalCode = "invalid";
  if (!errors.state && !copy.checkout.states.some((state) => state.id === delivery.state)) errors.state = "invalid";
  return Object.freeze(errors);
}

// The optional preparation seam lets callers exercise a failure before commit.
// The storefront supplies no remote operation or artificial delay.
export function createCheckout(cart: Cart, beforeCommit?: () => void | Promise<void>): Checkout {
  const store = createStore<CheckoutSnapshot>(() => ({ draft: initialCheckoutDraft(), confirmation: null, visit: 0 }));
  let busy = false;
  let visit = 0;
  const rejected = (reason: Extract<CheckoutOutcome, { status: "rejected" }>["reason"]): CheckoutOutcome => ({ status: "rejected", reason });
  const success = (effect: Extract<CheckoutOutcome, { status: "success" }>["effect"]): CheckoutOutcome => ({ status: "success", effect });
  const validDraft = (draft: CheckoutDraft) => (draft.payment === "pix" || draft.payment === "card")
    && Object.keys(validateDelivery(draft.delivery)).length === 0;
  function readiness(): CheckoutOutcome | null {
    if (cart.getSnapshot().restoration === "pending") return rejected("not-ready");
    if (cart.getSnapshot().lines.length === 0) return rejected("empty-cart");
    if (!validDraft(store.getState().draft)) return rejected("invalid-draft");
    return null;
  }
  return Object.freeze({
    getSnapshot: store.getState,
    subscribe: (listener: () => void) => store.subscribe(listener),
    getDraft: () => store.getState().draft,
    updateDraft(draft: CheckoutDraft): CheckoutOutcome {
      if (busy) return rejected("busy");
      if (!draft || !draft.delivery || Object.keys(copy.checkout.defaults).some(key => typeof draft.delivery[key as keyof Delivery] !== "string")
        || (draft.payment !== "pix" && draft.payment !== "card")) return rejected("invalid-draft");
      // Invalid field values are still editable drafts; validation belongs to exit/submit.
      store.setState({ draft: freezeRecords({ delivery: { ...draft.delivery }, payment: draft.payment }) });
      return success("updated");
    },
    validateDelivery,
    totals: () => checkoutTotals(cart.getSnapshot().subtotalCents),
    async complete(): Promise<CheckoutOutcome> {
      if (busy || store.getState().confirmation) return rejected("busy");
      const invalid = readiness();
      if (invalid) return invalid;
      busy = true;
      const currentVisit = visit;
      try {
        await beforeCommit?.();
        if (currentVisit !== visit) return rejected("pre-commit-failure");
        const changed = readiness();
        if (changed) return changed;
        const current = cart.getSnapshot();
        const confirmation: Confirmation = freezeRecords({
          lines: current.lines.map(line => ({ ...line, product: { ...line.product }, colorway: { ...line.colorway } })),
          draft: { delivery: { ...store.getState().draft.delivery }, payment: store.getState().draft.payment },
          totals: checkoutTotals(current.subtotalCents),
        });
        const resetDraft = initialCheckoutDraft();
        if (cart.clear().status !== "success") return rejected("pre-commit-failure");
        store.setState({ draft: resetDraft, confirmation, visit }, true);
        return success("completed");
      } catch {
        return rejected("pre-commit-failure");
      } finally {
        busy = false;
      }
    },
    getConfirmation: () => store.getState().confirmation,
    discardConfirmation(): CheckoutOutcome {
      visit++;
      store.setState({ confirmation: null, visit });
      return success("discarded");
    },
  });
}
export function checkoutTotals(subtotalCents: number): CheckoutTotals {
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 0 || !Number.isSafeInteger(subtotalCents + copy.checkout.shipping.priceCents)) throw new RangeError("Invalid integer-centavo subtotal");
  return Object.freeze({ subtotalCents, shippingCents: copy.checkout.shipping.priceCents, totalCents: subtotalCents + copy.checkout.shipping.priceCents });
}
