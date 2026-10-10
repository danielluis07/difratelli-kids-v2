import { Listing } from "@/components/storefront/listing";
import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.girls.heading, "/meninas");
export default function Page({ searchParams }: PageProps<"/meninas">) {
  return <Listing {...copy.editorial.pages.girls} scope={{ kind: "audience", audienceId: "girls" }} searchParams={searchParams} />;
}
