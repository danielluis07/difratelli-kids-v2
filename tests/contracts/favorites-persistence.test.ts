import { expect, it } from "vitest";
import { createFavorites, favoritesStorageKey, type FavoritesStorage } from "../../lib/favorites";
import { createCart } from "../../lib/cart";

it("gates favorites until normal restoration, without initial reads or writes", () => {
  const saved = JSON.stringify({ version: 1, productIds: ["product-001"] });
  let reads = 0;
  let writes = 0;
  const storage: FavoritesStorage = {
    getItem(key) { expect(key).toBe(favoritesStorageKey); reads++; return saved; },
    setItem() { writes++; },
  };
  const favorites = createFavorites(() => storage);
  const pending = favorites.getSnapshot();
  expect(pending.restoration).toBe("pending");
  expect(favorites.toggle("product-001")).toEqual({ status: "rejected", reason: "not-ready" });
  expect(favorites.getSnapshot()).toBe(pending);
  expect(reads).toBe(0);
  favorites.restore();
  favorites.restore();
  expect(reads).toBe(1);
  expect(writes).toBe(0);
  expect(favorites.has("product-001")).toBe(true);
  expect(favorites.getSnapshot()).toMatchObject({ count: 1, restoration: "ready", persistence: "saved" });
});

it("persists only product IDs, restores membership/count, and keeps cart independent", () => {
  const values = new Map<string, string>();
  const storage: FavoritesStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  const favorites = createFavorites(() => storage);
  const cart = createCart(() => storage);
  favorites.restore();
  cart.restore();
  cart.add({ productId: "product-001", colorwayId: "cream-leaf-teal", size: 4 }, 2);
  const cartSaved = values.get("difratelli.cart");
  favorites.toggle("product-001");
  favorites.toggle("product-002");
  expect(JSON.parse(values.get(favoritesStorageKey)!)).toEqual({ version: 1, productIds: ["product-001", "product-002"] });
  expect(values.get("difratelli.cart")).toBe(cartSaved);
  const resumed = createFavorites(() => storage);
  resumed.restore();
  expect(resumed.has("product-001")).toBe(true);
  expect(resumed.has("product-002")).toBe(true);
  expect(resumed.getSnapshot().count).toBe(2);
  const before = resumed.getSnapshot();
  const saved = values.get(favoritesStorageKey);
  expect(resumed.toggle("missing")).toEqual({ status: "rejected", reason: "invalid-product" });
  expect(resumed.getSnapshot()).toBe(before);
  expect(values.get(favoritesStorageKey)).toBe(saved);
  resumed.toggle("product-001");
  resumed.toggle("product-002");
  expect(resumed.getSnapshot().count).toBe(0);
  expect(JSON.parse(values.get(favoritesStorageKey)!)).toEqual({ version: 1, productIds: [] });
  favorites.toggle("product-001");
  const favoriteSaved = values.get(favoritesStorageKey);
  cart.clear();
  expect(values.get(favoritesStorageKey)).toBe(favoriteSaved);
});
