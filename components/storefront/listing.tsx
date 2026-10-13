import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { browse, parseBrowseUrl, type BrowseScope, type BrowseState } from "@/lib/browsing";
import { catalog, copy, type Product } from "@/lib/catalog";
import { BrowseControls, ResetBrowseFilters, type FilterGroup } from "./browse-controls";
import { ProductGrid } from "./product-grid";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export function urlParams(values: Awaited<SearchParams>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, entry);
  }
  return params;
}

const fullWidthSizes = "(min-width:1024px) calc((100vw - 168px) / 4), (min-width:768px) calc((100vw - 112px) / 3), calc((100vw - 48px) / 2)";
function Results({ products, scope, state, fullBleed = false }: { products: readonly Product[]; scope?: BrowseScope; state?: BrowseState; fullBleed?: boolean }) {
  const count = products.length;
  const label = count === 0 ? copy.browsing.resultCount.zero : count === 1 ? copy.browsing.resultCount.one : copy.browsing.resultCount.many.replace("{count}", String(count));
  return <>
    <p className="result-count" role="status">{label}</p>
    {count ? <ProductGrid products={products} sizes={fullBleed ? fullWidthSizes : undefined} /> : <Empty>
      <EmptyHeader><EmptyTitle>{copy.browsing.emptyFilteredHeading}</EmptyTitle><EmptyDescription>{copy.browsing.emptyFilteredBody}</EmptyDescription></EmptyHeader>
      <EmptyContent>{scope && state ? <ResetBrowseFilters scope={scope} state={state} /> : <Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.common.exploreProducts}</Button>}</EmptyContent>
    </Empty>}
  </>;
}
async function ScopedResults({ scope, searchParams, fullBleed }: { scope: BrowseScope; searchParams: SearchParams; fullBleed: boolean }) {
  const state = parseBrowseUrl(scope, urlParams(await searchParams));
  const groups: FilterGroup[] = [
    { key: "categories", label: copy.browsing.category, options: catalog.categories.map((item) => ({ value: item.id, label: item.name })) },
    { key: "sizes", label: copy.browsing.size, options: [2, 4, 6, 8].map((size) => ({ value: size, label: String(size) })) },
    { key: "families", label: copy.browsing.colorFamily, options: catalog.colorFamilies.map((item) => ({ value: item.id, label: item.name })) },
  ];
  if (scope.kind !== "collection") groups.push({ key: "collections", label: copy.browsing.collection, options: catalog.collections.map((item) => ({ value: item.id, label: item.name })) });
  if (scope.kind === "catalog" || scope.kind === "search") groups.push({ key: "audiences", label: copy.browsing.audience, options: catalog.audiences.map((item) => ({ value: item.id, label: item.name })) });
  if (scope.kind === "search" && !state.query) return <Empty><EmptyHeader><EmptyTitle>{copy.search.blankHeading}</EmptyTitle><EmptyDescription>{copy.search.blankBody}</EmptyDescription></EmptyHeader></Empty>;
  const result = browse(scope, state);
  const unfilteredSearch = scope.kind === "search" && !browse(scope, { ...state, categories: [], sizes: [], families: [], collections: [], audiences: [] }).count;
  return <>
    {scope.kind === "search" ? <p className="search-query">“{state.query}”</p> : null}
    <BrowseControls scope={scope} state={state} groups={groups} />
    {unfilteredSearch ? <>
      <p className="result-count" role="status">{copy.browsing.resultCount.zero}</p>
      <Empty><EmptyHeader><EmptyTitle>{copy.search.noResultsHeading.replace("{query}", state.query)}</EmptyTitle><EmptyDescription>{copy.search.noResultsBody}</EmptyDescription></EmptyHeader><EmptyContent><Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.search.noResultsAction}</Button></EmptyContent></Empty>
    </> : <Results products={result.products} scope={scope} state={state} fullBleed={fullBleed} />}
  </>;
}

export function Listing({ heading, intro, scope, searchParams, opening, fullBleed = false }: { heading: string; intro: string; scope: BrowseScope; searchParams: SearchParams; opening?: ReactNode; fullBleed?: boolean }) {
  const initial = browse(scope, parseBrowseUrl(scope, new URLSearchParams()));
  return <main id="main-content" className={fullBleed ? "editorial-page collection-detail" : "content-container listing-page"}>
    {opening}
    <div className={fullBleed ? "editorial-padding listing-page" : undefined}>
    <div className="page-intro"><h1>{heading}</h1><p>{intro}</p></div>
    <Suspense fallback={<Results products={initial.products} fullBleed={fullBleed} />}><ScopedResults scope={scope} searchParams={searchParams} fullBleed={fullBleed} /></Suspense>
    </div>
  </main>;
}
