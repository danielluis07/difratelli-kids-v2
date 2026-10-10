import Link from "next/link";
import { copy } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.favorites.heading, "/favoritos");
export default function Page() {
  return <main id="main-content" className="content-container editorial-entry"><div className="page-intro"><h1>{copy.editorial.pages.favorites.heading}</h1><p>{copy.editorial.pages.favorites.intro}</p></div><Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.common.exploreProducts}</Button></main>;
}
