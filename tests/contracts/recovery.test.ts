import { expect, it } from "vitest";
import { createCart, cartStorageKey } from "../../lib/cart";
import { createFavorites, favoritesStorageKey } from "../../lib/favorites";
import { catalog } from "../../lib/catalog";

const product = catalog.products[0];
const selection = { productId: product.id, colorwayId: product.defaultColorwayId, size: 4 };
const line = { ...selection, quantity: 2, lastSeenUnitPriceCents: product.priceCents };
const cartSaved = JSON.stringify({ version: 1, lines: [line] });
const favoritesSaved = JSON.stringify({ version: 1, productIds: [product.id] });

function memory(cart = cartSaved, favorites = favoritesSaved) {
  const values = new Map([[cartStorageKey, cart], [favoritesStorageKey, favorites]]);
  const writes: string[] = [];
  let readFailure = "";
  let writeFailure = "";
  const storage = {
    getItem(key: string) {
      if (key === readFailure) throw new Error("Blocked read");
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      writes.push(key);
      if (key === writeFailure) throw new Error("Quota exceeded");
      values.set(key, value);
    },
  };
  return { values, writes, storage, failRead: (key: string) => { readFailure = key; }, failWrite: (key: string) => { writeFailure = key; } };
}

it("recovers mixed cart data without substitution, merges tuples, caps integers and uses current prices", () => {
  const saved = JSON.stringify({ version: 1, lines: [
    line, { ...line, quantity: 4, lastSeenUnitPriceCents: 1 },
    { ...line, size: 6, quantity: 50 }, { ...line, size: 8, lastSeenUnitPriceCents: "bad" },
    { ...line, productId: "obsolete" }, { ...line, colorwayId: "obsolete" }, { ...line, size: 3 },
    ...[null, {}, "bad", ...[0, -1, 1.5, "2", null].map(quantity => ({ ...line, quantity }))],
  ] });
  const data = memory(saved);
  const cart = createCart(() => data.storage);
  cart.restore();
  expect(cart.getSnapshot()).toMatchObject({ restoration: "ready", persistence: "saved", units: 18,
    subtotalCents: 18 * product.priceCents, recovery: { removed: true, duplicates: true, quantities: true, prices: true } });
  expect(cart.getSnapshot().lines.map(l => [l.productId, l.colorwayId, l.size, l.quantity])).toEqual([
    [product.id, selection.colorwayId, 4, 6], [product.id, selection.colorwayId, 6, 10], [product.id, selection.colorwayId, 8, 2],
  ]);
  expect(data.writes).toEqual([]);
  expect(data.values.get(cartStorageKey)).toBe(saved);
  const restored = cart.getSnapshot();
  cart.restore();
  expect(cart.getSnapshot()).toBe(restored);
  cart.add({ ...selection, size: 8 });
  expect(cart.getSnapshot().recovery).toBe(restored.recovery);
  const persisted = JSON.parse(data.values.get(cartStorageKey)!);
  expect(Object.keys(persisted)).toEqual(["version", "lines"]);
  expect(persisted.lines.every((l: { lastSeenUnitPriceCents: number }) => l.lastSeenUnitPriceCents === product.priceCents)).toBe(true);
});

it("caps duplicate sums and discards every malformed quantity without invalidating other lines", () => {
  const data = memory(JSON.stringify({ version: 1, lines: [line, { ...line, quantity: 9 }] }));
  const cart = createCart(() => data.storage);
  cart.restore();
  expect(cart.getSnapshot()).toMatchObject({ units: 10, recovery: { duplicates: true, quantities: true, removed: false, prices: false } });
});

it("recovers valid favorites, removes malformed/obsolete IDs and deduplicates independently", () => {
  const saved = JSON.stringify({ version: 1, productIds: [product.id, "obsolete", null, 1, {}, product.id, catalog.products[1].id] });
  const data = memory(cartSaved, saved);
  const favorites = createFavorites(() => data.storage);
  favorites.restore();
  expect(favorites.getSnapshot()).toMatchObject({ count: 2, restoration: "ready", recovery: { removed: true, duplicates: true } });
  expect(favorites.has(product.id)).toBe(true);
  expect(favorites.has(catalog.products[1].id)).toBe(true);
  expect(data.writes).toEqual([]);
  expect(data.values.get(favoritesStorageKey)).toBe(saved);
  favorites.toggle(product.id);
  expect(data.values.get(cartStorageKey)).toBe(cartSaved);
  expect(JSON.parse(data.values.get(favoritesStorageKey)!)).toEqual({ version: 1, productIds: [catalog.products[1].id] });
});

it("treats readable envelopes with only invalid entries as recoverable empty state", () => {
  const data = memory(JSON.stringify({ version: 1, lines: [null, { ...line, quantity: 0 }] }),
    JSON.stringify({ version: 1, productIds: [null, "obsolete"] }));
  const cart = createCart(() => data.storage);
  const favorites = createFavorites(() => data.storage);
  cart.restore(); favorites.restore();
  expect(cart.getSnapshot()).toMatchObject({ units: 0, restoration: "ready", recovery: { removed: true } });
  expect(favorites.getSnapshot()).toMatchObject({ count: 0, restoration: "ready", recovery: { removed: true } });
  expect(cart.getSnapshot().warning).toBeUndefined();
  expect(favorites.getSnapshot().warning).toBeUndefined();
  expect(data.writes).toEqual([]);
});

it("an unsupported cart leaves normal favorites restoration and persistence available", () => {
  const saved = JSON.stringify({ version: 3, lines: [line] });
  const data = memory(saved);
  const cart = createCart(() => data.storage);
  const favorites = createFavorites(() => data.storage);
  cart.restore(); favorites.restore();
  expect(cart.getSnapshot()).toMatchObject({ warning: "unsupportedStorage", restoration: "temporary" });
  expect(favorites.getSnapshot()).toMatchObject({ count: 1, restoration: "ready", persistence: "saved" });
  favorites.toggle(catalog.products[1].id);
  expect(data.writes).toEqual([favoritesStorageKey]);
  expect(data.values.get(cartStorageKey)).toBe(saved);
});

for (const [saved, warning] of [
  ["{", "invalidStorage"], ["null", "invalidStorage"], ["[]", "invalidStorage"], ["{}", "invalidStorage"],
  [JSON.stringify({ version: "1", lines: [], productIds: [] }), "invalidStorage"],
  [JSON.stringify({ version: 1, lines: null, productIds: {} }), "invalidStorage"],
  [JSON.stringify({ version: 2, lines: [line], productIds: [product.id] }), "unsupportedStorage"],
] as const) {
  it(`leaves ${saved} untouched and supports temporary commands with ${warning}`, () => {
    const data = memory(saved, saved);
    const cart = createCart(() => data.storage);
    const favorites = createFavorites(() => data.storage);
    cart.restore(); favorites.restore();
    for (const store of [cart, favorites]) expect(store.getSnapshot()).toMatchObject({ restoration: "temporary", persistence: "unavailable", warning });
    expect(cart.add(selection).status).toBe("success");
    expect(favorites.toggle(product.id).status).toBe("success");
    expect(cart.getSnapshot().units).toBe(1);
    expect(favorites.getSnapshot().count).toBe(1);
    expect(data.values.get(cartStorageKey)).toBe(saved);
    expect(data.values.get(favoritesStorageKey)).toBe(saved);
    expect(data.writes).toEqual([]);
  });
}

for (const key of [cartStorageKey, favoritesStorageKey]) {
  it(`isolates failed reads for ${key} and keeps both stores usable`, () => {
    const data = memory();
    data.failRead(key);
    const cart = createCart(() => data.storage);
    const favorites = createFavorites(() => data.storage);
    cart.restore(); favorites.restore();
    const failed = key === cartStorageKey ? cart : favorites;
    const healthy = key === cartStorageKey ? favorites : cart;
    expect(failed.getSnapshot()).toMatchObject({ restoration: "temporary", warning: "readFailure" });
    expect(healthy.getSnapshot()).toMatchObject({ restoration: "ready", persistence: "saved" });
    expect(cart.add(selection).status).toBe("success");
    expect(favorites.toggle(catalog.products[1].id).status).toBe("success");
    expect(data.writes).toEqual([key === cartStorageKey ? favoritesStorageKey : cartStorageKey]);
  });

  it(`preserves successful memory actions and the last saved value after ${key} write failure`, () => {
    const data = memory();
    const cart = createCart(() => data.storage);
    const favorites = createFavorites(() => data.storage);
    cart.restore(); favorites.restore();
    cart.add(selection); favorites.toggle(catalog.products[1].id);
    const saved = data.values.get(key);
    data.failWrite(key);
    cart.clear(); favorites.toggle(product.id);
    const failed = key === cartStorageKey ? cart : favorites;
    const healthy = key === cartStorageKey ? favorites : cart;
    expect(failed.getSnapshot()).toMatchObject({ restoration: "temporary", persistence: "unavailable", warning: "writeFailure" });
    expect(healthy.getSnapshot()).toMatchObject({ restoration: "ready", persistence: "saved" });
    expect(data.values.get(key)).toBe(saved);
    expect(cart.getSnapshot().units).toBe(0);
    expect(favorites.has(product.id)).toBe(false);
    const attempts = data.writes.filter(k => k === key).length;
    cart.add(selection); favorites.toggle(product.id);
    expect(data.writes.filter(k => k === key)).toHaveLength(attempts);
    const resumedCart = createCart(() => data.storage);
    const resumedFavorites = createFavorites(() => data.storage);
    resumedCart.restore(); resumedFavorites.restore();
    if (key === cartStorageKey) expect(resumedCart.getSnapshot().units).toBe(3);
    else expect(resumedFavorites.has(product.id)).toBe(true);
  });
}

it("handles blocked storage acquisition and rejects invalid commands after recovery without saving", () => {
  for (const store of [createCart(() => { throw new Error("Blocked storage"); }), createFavorites(() => { throw new Error("Blocked storage"); })]) {
    store.restore();
    expect(store.getSnapshot()).toMatchObject({ warning: "readFailure", restoration: "temporary" });
  }
  const data = memory();
  const cart = createCart(() => data.storage);
  cart.restore();
  const before = cart.getSnapshot();
  expect(cart.add({ ...selection, colorwayId: "obsolete" }).status).toBe("rejected");
  expect(cart.setQuantity(selection, 0).status).toBe("rejected");
  expect(cart.getSnapshot()).toBe(before);
  expect(data.writes).toEqual([]);
});

it("uses independent last-successful saves without synchronizing already restored tabs", () => {
  const data = memory();
  const first = { cart: createCart(() => data.storage), favorites: createFavorites(() => data.storage) };
  const second = { cart: createCart(() => data.storage), favorites: createFavorites(() => data.storage) };
  for (const tab of [first, second]) { tab.cart.restore(); tab.favorites.restore(); }
  first.cart.add(selection); first.favorites.toggle(catalog.products[1].id);
  expect(second.cart.getSnapshot().units).toBe(2);
  expect(second.favorites.getSnapshot().count).toBe(1);
  second.cart.clear();
  expect(first.cart.getSnapshot().units).toBe(3);
  const resumed = { cart: createCart(() => data.storage), favorites: createFavorites(() => data.storage) };
  resumed.cart.restore(); resumed.favorites.restore();
  expect(resumed.cart.getSnapshot().units).toBe(0);
  expect(resumed.favorites.getSnapshot().count).toBe(2);
});
