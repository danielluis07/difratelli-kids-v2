import { Listing } from "@/components/storefront/listing";
import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.boys.heading, "/meninos");
export default function Page({ searchParams }: PageProps<"/meninos">) {
  return <Listing {...copy.editorial.pages.boys} scope={{ kind: "audience", audienceId: "boys" }} searchParams={searchParams} />;
}
