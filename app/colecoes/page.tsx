import Link from "next/link";
import { catalog, copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.collections.heading, "/colecoes");
export default function Page() {
  return <main id="main-content" className="content-container editorial-entry"><div className="page-intro"><h1>{copy.editorial.pages.collections.heading}</h1><p>{copy.editorial.pages.collections.intro}</p></div><div className="collection-links">{catalog.collections.map((collection) => <article key={collection.id}><h2><Link href={`/colecoes/${collection.slug}`}>{collection.name}</Link></h2><p>{collection.story}</p></article>)}</div></main>;
}
