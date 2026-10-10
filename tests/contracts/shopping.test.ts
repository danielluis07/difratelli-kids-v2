import { expect, it } from "vitest";
import { createCart } from "../../lib/cart";
import { createFavorites } from "../../lib/favorites";
import { initialCheckoutDraft, validateDelivery, checkoutTotals } from "../../lib/checkout";

const selection = { productId: "product-001", colorwayId: "cream-leaf-teal", size: 4 };
it("returns typed cart outcomes, merges tuples, and resolves current centavo totals", () => {
  const cart = createCart();
  expect(cart.add(selection)).toEqual({ status: "success", effect: "added" });
  expect(cart.add(selection, 9)).toEqual({ status: "success", effect: "merged" });
  expect(cart.add(selection)).toEqual({ status: "success", effect: "quantity-limited" });
  expect(cart.getSnapshot()).toMatchObject({ units: 10, subtotalCents: 59000 });
  cart.add({ ...selection, size: 6 });
  expect(cart.getSnapshot().lines).toHaveLength(2);
  expect(cart.setQuantity(selection, 2)).toEqual({ status: "success", effect: "updated" });
  expect(cart.getSnapshot()).toMatchObject({ units: 3, subtotalCents: 17700 });
  expect(Object.isFrozen(cart.getSnapshot().lines)).toBe(true);
  cart.remove(selection);
  expect(cart.getSnapshot().units).toBe(1);
});
it("leaves cart snapshot and subscriptions unchanged for invalid commands", () => {
  const cart = createCart();
  cart.add(selection);
  const before = cart.getSnapshot();
  let notifications = 0;
  cart.subscribe(() => notifications++);
  for (const command of [() => cart.add({ ...selection, size: 3 }), () => cart.add({ ...selection, colorwayId: "missing" }),
    () => cart.add({ ...selection, productId: "missing" }), () => cart.add(selection, 0), () => cart.setQuantity(selection, 11),
    () => cart.setQuantity(selection, 1.5), () => cart.remove({ ...selection, size: 8 })]) {
    expect(command().status).toBe("rejected");
    expect(cart.getSnapshot()).toBe(before);
  }
  expect(notifications).toBe(0);
});
it("keeps favorites independent and rejects unknown products without changes", () => {
  const cart = createCart();
  const favorites = createFavorites();
  expect(favorites.toggle("product-001")).toEqual({ status: "success", effect: "saved" });
  cart.add(selection);
  cart.clear();
  expect(favorites.has("product-001")).toBe(true);
  expect(favorites.getSnapshot().count).toBe(1);
  const before = favorites.getSnapshot();
  expect(favorites.toggle("missing")).toEqual({ status: "rejected", reason: "invalid-product" });
  expect(favorites.getSnapshot()).toBe(before);
  expect(favorites.toggle("product-001")).toEqual({ status: "success", effect: "removed" });
});
it("exposes approved visit defaults, delivery validation, and 1590-centavo shipping", () => {
  const draft = initialCheckoutDraft();
  expect(validateDelivery(draft.delivery)).toEqual({});
  expect(validateDelivery({ ...draft.delivery, email: "invalid", state: "XX", postalCode: "123", name: "" })).toEqual({ name: "required", email: "invalid", state: "invalid", postalCode: "invalid" });
  expect(validateDelivery({ ...draft.delivery, number: "s/n", postalCode: "01311-000" })).toEqual({});
  expect(checkoutTotals(5900)).toEqual({ subtotalCents: 5900, shippingCents: 1590, totalCents: 7490 });
  expect(() => checkoutTotals(5900.1)).toThrow(RangeError);
});
