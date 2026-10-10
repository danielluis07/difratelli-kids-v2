import Link from "next/link";
import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
import { Button } from "@/components/ui/button";
export const metadata = pageMetadata(copy.editorial.pages.search.heading, "/busca");
export default function Page() {
  return <main id="main-content" className="content-container editorial-entry"><div className="page-intro"><h1>{copy.editorial.pages.search.heading}</h1><p>{copy.search.blankBody}</p></div><Button nativeButton={false} role="link" render={<Link href="/produtos" />}>{copy.common.exploreProducts}</Button></main>;
}
