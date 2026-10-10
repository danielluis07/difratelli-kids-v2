import { Listing } from "@/components/storefront/listing";
import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.newArrivals.heading, "/novidades");
export default function Page({ searchParams }: PageProps<"/novidades">) {
  return <Listing {...copy.editorial.pages.newArrivals} scope={{ kind: "new-arrivals" }} searchParams={searchParams} />;
}
