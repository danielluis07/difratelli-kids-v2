import { expect, it } from "vitest";
import { browse, parseBrowseUrl, serializeBrowseUrl, resetBrowseFilters, parseProductColor, normalizeQuery } from "../../lib/browsing";
import { catalog } from "../../lib/catalog";

const full = { kind: "catalog" } as const;
const search = { kind: "search" } as const;
it("retains spelling and safely round-trips search whitespace and reserved characters", () => {
  const query = normalizeQuery(" \t ImAgInAção\n em\u00a0casa & + ? # / ");
  expect(query).toBe("ImAgInAção em casa & + ? # /");
  const state = parseBrowseUrl(search, new URLSearchParams({ q: query }));
  const serialized = serializeBrowseUrl(search, state);
  expect(new URLSearchParams(serialized).get("q")).toBe(query);
  expect(parseBrowseUrl(search, new URLSearchParams(serialized))).toEqual(state);
  expect(browse(search, parseBrowseUrl(search, new URLSearchParams({ q: "IMA CASA" }))).count).toBe(10);
  expect(browse(search, parseBrowseUrl(search, new URLSearchParams({ q: "POL descob" }))).products.map((product) => product.id)).toEqual(["product-002"]);
});
it("parses repeated values, first scalars and invalid input without rewriting the URL", () => {
  const params = new URLSearchParams("categoria=polos&categoria=unknown&categoria=polos&categoria=t-shirts&ordem=bad&ordem=preco-asc&publico=girls&tracking=abc");
  const original = params.toString();
  const state = parseBrowseUrl(full, params);
  expect(state.categories).toEqual(["t-shirts", "polos"]);
  expect(state.sort).toBe("curated");
  expect(params.toString()).toBe(original);
  expect(serializeBrowseUrl(full, state)).toBe("categoria=t-shirts&categoria=polos&publico=girls");
});
it("uses OR within filters and AND across filters with audience inclusivity", () => {
  const state = parseBrowseUrl(full, new URLSearchParams("categoria=t-shirts&categoria=polos&publico=boys&colecao=collection-001"));
  const result = browse(full, state);
  expect(result.products.map((p) => p.id)).toEqual(["product-001", "product-002"]);
  expect(result.count).toBe(2);
});
it("preserves route scopes and ignores irrelevant filters", () => {
  const girls = { kind: "audience", audienceId: "girls" } as const;
  const state = parseBrowseUrl(girls, new URLSearchParams("publico=boys"));
  expect(state.audiences).toEqual([]);
  expect(browse(girls, state).count).toBe(18);
  const collection = { kind: "collection", collectionId: "collection-001" } as const;
  expect(browse(collection, parseBrowseUrl(collection, new URLSearchParams("colecao=collection-002"))).count).toBe(10);
  const news = { kind: "new-arrivals" } as const;
  expect(browse(news, parseBrowseUrl(news, new URLSearchParams())).count).toBe(8);
});
it("matches every partial word across name/category/collection without accents or case", () => {
  const state = parseBrowseUrl(search, new URLSearchParams("q=  CAMI   descobértas  &q=missing"));
  expect(state.query).toBe("CAMI descobértas");
  expect(browse(search, state).products.map((p) => p.id)).toEqual(["product-001", "product-003", "product-009"]);
  expect(browse(search, parseBrowseUrl(search, new URLSearchParams("q=cami+missing"))).count).toBe(0);
  expect(browse(search, parseBrowseUrl(search, new URLSearchParams("q=+"))).count).toBe(0);
});
it("sorts integer prices and resolves ties by curated order in both directions", () => {
  for (const sort of ["preco-asc", "preco-desc"] as const) {
    const products = browse(full, parseBrowseUrl(full, new URLSearchParams(`ordem=${sort}`))).products;
    for (let i = 1; i < products.length; i++) {
      if (products[i].priceCents === products[i - 1].priceCents) expect(products[i].curatedRank).toBeGreaterThan(products[i - 1].curatedRank);
      else expect(Math.sign(products[i].priceCents - products[i - 1].priceCents)).toBe(sort === "preco-asc" ? 1 : -1);
    }
  }
});
it("round-trips canonically and resets filters while keeping the search query", () => {
  const state = parseBrowseUrl(search, new URLSearchParams("q=Imaginação+em+casa&categoria=dresses&familia=cream&ordem=preco-desc"));
  expect(parseBrowseUrl(search, new URLSearchParams(serializeBrowseUrl(search, state)))).toEqual(state);
  expect(serializeBrowseUrl(search, resetBrowseFilters(search, state))).toBe("q=Imagina%C3%A7%C3%A3o+em+casa");
  expect(browse(full, parseBrowseUrl(full, new URLSearchParams("categoria=polos&familia=purple"))).count).toBe(0);
});
it("uses first colorway scalar and falls back without substitution", () => {
  const product = catalog.products[6];
  expect(parseProductColor(product, new URLSearchParams("cor=cream&cor=leaf"))).toBe("cream");
  expect(parseProductColor(product, new URLSearchParams("cor=missing&cor=cream"))).toBe(product.defaultColorwayId);
});
it("collects valid unique values in every filter and ignores malformed numbers and encoded values", () => {
  const params = new URLSearchParams("tamanho=4&tamanho=02&tamanho=2&tamanho=4&tamanho=6.0&familia=cream&familia=purple&familia=cream&familia=invalid&colecao=collection-002&colecao=collection-001&colecao=collection-002&publico=boys&publico=girls&publico=boys&q=ignored&cor=ignored");
  const state = parseBrowseUrl(full, params);
  expect(state.sizes).toEqual([2, 4]);
  expect(state.families).toEqual(catalog.colorFamilies.filter((family) => ["cream", "purple"].includes(family.id)).map((family) => family.id));
  expect(state.collections).toEqual(["collection-001", "collection-002"]);
  expect(state.audiences).toEqual(["girls", "boys"]);
  expect(state.query).toBe("");
  expect(serializeBrowseUrl(full, state)).not.toMatch(/invalid|ignored|tamanho=02|tamanho=6\.0/);
  expect(parseBrowseUrl(search, new URLSearchParams("q=&q=camiseta&ordem=&ordem=preco-desc")).query).toBe("");
  expect(parseBrowseUrl(full, new URLSearchParams("categoria=%70olos&categoria=%ZZ")).categories).toEqual(["polos"]);
});
it("applies sizes with OR and color families across all offered colorways", () => {
  const selected = parseBrowseUrl(full, new URLSearchParams("tamanho=2&tamanho=8&familia=cream&familia=purple&categoria=polos"));
  expect(browse(full, selected).products.map((product) => product.id)).toEqual(["product-002", "product-011"]);
  expect(browse(full, parseBrowseUrl(full, new URLSearchParams("tamanho=2&tamanho=8"))).count).toBe(30);
});
it("resets each route scope without losing its assortment", () => {
  for (const [scope, count] of [[full, 30], [{ kind: "audience", audienceId: "boys" }, 18], [{ kind: "collection", collectionId: "collection-002" }, 10], [{ kind: "new-arrivals" }, 8]] as const) {
    const state = parseBrowseUrl(scope, new URLSearchParams("categoria=polos&familia=purple&ordem=preco-desc"));
    const reset = resetBrowseFilters(scope, state);
    expect(serializeBrowseUrl(scope, reset)).toBe("");
    expect(browse(scope, reset).count).toBe(count);
  }
});
