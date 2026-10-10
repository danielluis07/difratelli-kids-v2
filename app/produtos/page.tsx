import { Listing } from "@/components/storefront/listing";
import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.catalog.heading, "/produtos");
export default function Page({ searchParams }: PageProps<"/produtos">) {
  return <Listing {...copy.editorial.pages.catalog} scope={{ kind: "catalog" }} searchParams={searchParams} />;
}
