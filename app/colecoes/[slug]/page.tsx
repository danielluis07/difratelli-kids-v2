import { notFound } from "next/navigation";
import { catalog, findCollectionBySlug } from "@/lib/catalog";
import { Listing } from "@/components/storefront/listing";
import { pageMetadata } from "@/lib/presentation/metadata";
export function generateStaticParams() { return catalog.collections.map(({ slug }) => ({ slug })); }
// Preserve the prerendered collection heading and default grid on first paint.
// Only query-dependent results stream behind Listing's focused boundary.
export const instant = false;
export async function generateMetadata({ params }: PageProps<"/colecoes/[slug]">) {
  const result = findCollectionBySlug((await params).slug);
  if (result.status === "missing") notFound();
  return pageMetadata(result.value.name, `/colecoes/${result.value.slug}`, result.value.story);
}
export default async function Page({ params, searchParams }: PageProps<"/colecoes/[slug]">) {
  const result = findCollectionBySlug((await params).slug);
  if (result.status === "missing") notFound();
  return <Listing heading={result.value.name} intro={result.value.story} scope={{ kind: "collection", collectionId: result.value.id }} searchParams={searchParams} />;
}
