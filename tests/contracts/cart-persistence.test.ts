import { expect, it } from "vitest";
import { createCart, cartStorageKey, type CartStorage } from "../../lib/cart";
import { catalog } from "../../lib/catalog";

const product = catalog.products.find(item => item.colorways.length === 2)!;
const selection = { productId: product.id, colorwayId: product.defaultColorwayId, size: 4 };

function memoryStorage(saved: string | null = null) {
  let value = saved;
  let writes = 0;
  const storage: CartStorage = {
    getItem(key) { expect(key).toBe(cartStorageKey); return value; },
    setItem(key, next) { expect(key).toBe(cartStorageKey); value = next; writes++; },
  };
  return { storage, value: () => value, writes: () => writes };
}

it("gates all commands before restoration without accessing or overwriting storage", () => {
  let reads = 0;
  const memory = memoryStorage();
  const cart = createCart(() => { reads++; return memory.storage; });
  const pending = cart.getSnapshot();
  expect(pending.restoration).toBe("pending");
  for (const command of [() => cart.add(selection), () => cart.setQuantity(selection, 2), () => cart.remove(selection), () => cart.clear()]) {
    expect(command()).toEqual({ status: "rejected", reason: "not-ready" });
    expect(cart.getSnapshot()).toBe(pending);
  }
  expect(reads).toBe(0);
  expect(memory.writes()).toBe(0);
  cart.restore();
  cart.restore();
  expect(reads).toBe(1);
  expect(cart.getSnapshot().restoration).toBe("ready");
  expect(memory.writes()).toBe(0);
});

it("persists only stable references and comparison prices and resumes distinct selections", () => {
  const memory = memoryStorage();
  const cart = createCart(() => memory.storage);
  cart.restore();
  cart.add(selection, 2);
  cart.add({ ...selection, colorwayId: product.colorways.find(color => color.id !== selection.colorwayId)!.id });
  cart.add({ ...selection, size: 6 });
  expect(JSON.parse(memory.value()!)).toEqual({ version: 1, lines: cart.getSnapshot().lines.map(line => ({
    productId: line.productId, colorwayId: line.colorwayId, size: line.size, quantity: line.quantity,
    lastSeenUnitPriceCents: product.priceCents,
  })) });
  const resumed = createCart(() => memory.storage);
  resumed.restore();
  expect(resumed.getSnapshot()).toMatchObject({ restoration: "ready", persistence: "saved", units: 4, subtotalCents: 4 * product.priceCents });
  expect(resumed.getSnapshot().lines).toHaveLength(3);
  resumed.setQuantity(selection, 1);
  resumed.remove({ ...selection, size: 6 });
  const again = createCart(() => memory.storage);
  again.restore();
  expect(again.getSnapshot().units).toBe(2);
  again.clear();
  expect(JSON.parse(memory.value()!)).toEqual({ version: 1, lines: [] });
});

it("prices restored lines from the current catalog and never writes invalid commands", () => {
  const saved = JSON.stringify({ version: 1, lines: [{ ...selection, quantity: 3, lastSeenUnitPriceCents: 1 }] });
  const memory = memoryStorage(saved);
  const cart = createCart(() => memory.storage);
  cart.restore();
  expect(cart.getSnapshot().subtotalCents).toBe(3 * product.priceCents);
  expect(memory.value()).toBe(saved);
  const before = cart.getSnapshot();
  expect(cart.setQuantity(selection, 0).status).toBe("rejected");
  expect(cart.getSnapshot()).toBe(before);
  expect(memory.writes()).toBe(0);
});
