import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
import { Listing, type SearchParams } from "@/components/storefront/listing";
export const metadata = pageMetadata(copy.editorial.pages.search.heading, "/busca");
export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <Listing heading={copy.editorial.pages.search.heading} intro="" scope={{ kind: "search" }} searchParams={searchParams} />;
}
