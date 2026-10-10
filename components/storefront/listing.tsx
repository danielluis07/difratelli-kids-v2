import { Suspense } from "react";
import Link from "next/link";
import { browse, parseBrowseUrl, type BrowseScope } from "@/lib/browsing";
import { copy, type Product } from "@/lib/catalog";
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

function Results({ products }: { products: readonly Product[] }) {
  const count = products.length;
  const label = count === 0 ? copy.browsing.resultCount.zero : count === 1 ? copy.browsing.resultCount.one : copy.browsing.resultCount.many.replace("{count}", String(count));
  return <>
    <p className="result-count" role="status">{label}</p>
    {count ? <ProductGrid products={products} /> : <Empty>
      <EmptyHeader><EmptyTitle>{copy.browsing.emptyFilteredHeading}</EmptyTitle><EmptyDescription>{copy.browsing.emptyFilteredBody}</EmptyDescription></EmptyHeader>
      <EmptyContent><Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.common.exploreProducts}</Button></EmptyContent>
    </Empty>}
  </>;
}
async function ScopedResults({ scope, searchParams }: { scope: BrowseScope; searchParams: SearchParams }) {
  const state = parseBrowseUrl(scope, urlParams(await searchParams));
  return <Results products={browse(scope, state).products} />;
}

export function Listing({ heading, intro, scope, searchParams }: { heading: string; intro: string; scope: BrowseScope; searchParams: SearchParams }) {
  const initial = browse(scope, parseBrowseUrl(scope, new URLSearchParams()));
  return <main id="main-content" className="content-container listing-page">
    <div className="page-intro"><h1>{heading}</h1><p>{intro}</p></div>
    <Suspense fallback={<Results products={initial.products} />}><ScopedResults scope={scope} searchParams={searchParams} /></Suspense>
  </main>;
}
