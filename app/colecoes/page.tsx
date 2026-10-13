import Link from "next/link";
import { catalog, copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
import { EditorialPicture } from "@/components/storefront/editorial-picture";
import { collectionPhoto } from "@/lib/presentation/editorial";
export const metadata = pageMetadata(copy.editorial.pages.collections.heading, "/colecoes");
export default function Page() {
  return <main id="main-content" className="editorial-page collection-index"><div className="editorial-padding page-intro"><h1>{copy.editorial.pages.collections.heading}</h1><p>{copy.editorial.pages.collections.intro}</p></div><div className="collection-index-grid">{catalog.collections.map((collection) => <article key={collection.id}><Link href={`/colecoes/${collection.slug}`} aria-labelledby={`${collection.id}-heading`}><div className="collection-index-photo"><EditorialPicture photo={collectionPhoto(collection.id, "compact")} sizes="(min-width:1024px) 33vw, 100vw" /></div><h2 id={`${collection.id}-heading`}>{collection.name}</h2></Link><p>{collection.story}</p></article>)}</div></main>;
}
