import { expect, it, vi } from "vitest";
import { copy } from "../../lib/catalog";
import { createCart, cartStorageKey } from "../../lib/cart";
import { createCheckout, initialCheckoutDraft, validateDelivery, checkoutTotals } from "../../lib/checkout";
import { createFavorites } from "../../lib/favorites";

const selection = { productId: "product-001", colorwayId: "cream-leaf-teal", size: 4 };

it("validates every required delivery field, all states, CEP/email, optional complement and s/n", () => {
  const delivery = initialCheckoutDraft().delivery;
  for (const field of ["name", "email", "postalCode", "street", "number", "neighborhood", "city", "state"] as const) {
    expect(validateDelivery({ ...delivery, [field]: "  " })[field]).toBe("required");
  }
  for (const state of copy.checkout.states) expect(validateDelivery({ ...delivery, state: state.id })).toEqual({});
  for (const postalCode of ["1234567", "123456789", "abcdefgh", "01311.000"]) expect(validateDelivery({ ...delivery, postalCode }).postalCode).toBe("invalid");
  for (const email of ["a@", "@example.com", "a @example.com", "a@example"]) expect(validateDelivery({ ...delivery, email }).email).toBe("invalid");
  expect(validateDelivery({ ...delivery, state: "XX" }).state).toBe("invalid");
  expect(validateDelivery({ ...delivery, number: "s/n", complement: "", postalCode: "01311-000" })).toEqual({});
  expect(validateDelivery({ ...delivery, number: "120, bloco A" })).toEqual({});
});

it("calculates integer-centavo totals and rejects unsafe or fractional subtotals", () => {
  expect(checkoutTotals(17700)).toEqual({ subtotalCents: 17700, shippingCents: 1590, totalCents: 19290 });
  for (const subtotal of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) expect(() => checkoutTotals(subtotal)).toThrow(RangeError);
});

it("gates pending/empty carts and invalid drafts without clearing or changing input", async () => {
  const cart = createCart(() => ({ getItem: () => null, setItem: vi.fn() }));
  const checkout = createCheckout(cart);
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "not-ready" });
  cart.restore();
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "empty-cart" });
  cart.add(selection);
  checkout.updateDraft({ ...checkout.getDraft(), delivery: { ...checkout.getDraft().delivery, name: "", email: "invalid" } });
  const before = checkout.getDraft();
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "invalid-draft" });
  expect(checkout.getDraft()).toBe(before);
  expect(cart.getSnapshot().units).toBe(1);
  expect(checkout.getConfirmation()).toBeNull();
});

it("guards concurrent and repeated submissions, commits one immutable snapshot, clears draft/cart and retains favorites", async () => {
  const cart = createCart();
  const favorites = createFavorites();
  cart.add(selection, 2);
  favorites.toggle(selection.productId);
  const checkout = createCheckout(cart);
  const draft = { delivery: { ...checkout.getDraft().delivery, name: "Outro nome", number: "s/n" }, payment: "card" as const };
  checkout.updateDraft(draft);
  draft.delivery.name = "Changed caller object";
  const first = checkout.complete();
  expect(checkout.updateDraft(initialCheckoutDraft())).toEqual({ status: "rejected", reason: "busy" });
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "busy" });
  expect(await first).toEqual({ status: "success", effect: "completed" });
  const confirmation = checkout.getConfirmation()!;
  expect(confirmation.draft.delivery.name).toBe("Outro nome");
  expect(confirmation.draft.payment).toBe("card");
  expect(confirmation.totals).toEqual({ subtotalCents: 11800, shippingCents: 1590, totalCents: 13390 });
  expect(Object.isFrozen(confirmation.lines[0].product)).toBe(true);
  expect(Object.isFrozen(confirmation.lines[0])).toBe(true);
  expect(Object.isFrozen(confirmation.draft.delivery)).toBe(true);
  expect(Object.isFrozen(confirmation.totals)).toBe(true);
  expect(cart.getSnapshot().units).toBe(0);
  expect(checkout.getDraft()).toEqual(initialCheckoutDraft());
  expect(favorites.has(selection.productId)).toBe(true);
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "busy" });
  cart.add(selection, 4);
  checkout.updateDraft({ ...initialCheckoutDraft(), payment: "card" });
  expect(checkout.getConfirmation()).toBe(confirmation);
  expect(confirmation.lines[0].quantity).toBe(2);
  checkout.discardConfirmation();
  expect(checkout.getConfirmation()).toBeNull();
  expect(checkout.getDraft().payment).toBe("card");
  expect(createCheckout(cart).getDraft()).toEqual(initialCheckoutDraft());
});

it("retains current cart/draft after pre-commit failure and permits a successful retry", async () => {
  const cart = createCart();
  cart.add(selection);
  const prepare = vi.fn().mockRejectedValueOnce(new Error("Preparation failed")).mockResolvedValue(undefined);
  const checkout = createCheckout(cart, prepare);
  checkout.updateDraft({ ...initialCheckoutDraft(), payment: "card" });
  const before = checkout.getSnapshot();
  expect(await checkout.complete()).toEqual({ status: "rejected", reason: "pre-commit-failure" });
  expect(checkout.getSnapshot()).toBe(before);
  expect(cart.getSnapshot().units).toBe(1);
  expect(await checkout.complete()).toEqual({ status: "success", effect: "completed" });
});

it("rechecks the current cart before commit and cancels completion if the visit ends", async () => {
  const cart = createCart();
  cart.add(selection);
  let proceed!: () => void;
  const checkout = createCheckout(cart, () => new Promise<void>(resolve => { proceed = resolve; }));
  const pending = checkout.complete();
  cart.setQuantity(selection, 3);
  proceed();
  await pending;
  expect(checkout.getConfirmation()?.totals.subtotalCents).toBe(17700);
  checkout.discardConfirmation();
  cart.add(selection);
  const cancelled = checkout.complete();
  checkout.discardConfirmation();
  proceed();
  expect(await cancelled).toEqual({ status: "rejected", reason: "pre-commit-failure" });
  expect(cart.getSnapshot().units).toBe(1);
  const emptied = checkout.complete();
  cart.clear();
  proceed();
  expect(await emptied).toEqual({ status: "rejected", reason: "empty-cart" });
});

it("completes in memory on a failed cart write, leaving old saved data available on reload", async () => {
  let saved: string | null = null;
  let fail = false;
  const storage = { getItem: () => saved, setItem: (key: string, value: string) => {
    expect(key).toBe(cartStorageKey);
    if (fail) throw new Error("Quota exceeded");
    saved = value;
  } };
  const cart = createCart(() => storage);
  cart.restore();
  cart.add(selection, 2);
  const oldSaved = saved;
  fail = true;
  const checkout = createCheckout(cart);
  expect(await checkout.complete()).toEqual({ status: "success", effect: "completed" });
  expect(cart.getSnapshot()).toMatchObject({ units: 0, warning: "writeFailure", persistence: "unavailable" });
  expect(checkout.getDraft()).toEqual(initialCheckoutDraft());
  expect(checkout.getConfirmation()?.lines[0].quantity).toBe(2);
  expect(saved).toBe(oldSaved);
  const reloaded = createCart(() => storage);
  reloaded.restore();
  expect(reloaded.getSnapshot().units).toBe(2);
});
