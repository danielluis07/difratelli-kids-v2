import Image from "next/image";
import Link from "next/link";
import { catalog, copy, identity } from "@/lib/catalog";

export function StorefrontFooter() {
  const wordmark = identity.assets.find((asset) => asset.id === "wordmark-brown-v1")!;
  return <footer className="store-footer"><div className="content-container footer-grid">
    <div className="footer-brand"><Link href="/" aria-label={copy.navigation.home}><Image src={wordmark.path.replace(/^public/, "")} alt={copy.editorial.metadata.siteName} width={190} height={70} /></Link><p>{copy.editorial.brand.footerIntro}</p><Link href="/sobre">{copy.navigation.brand}</Link></div>
    <nav aria-label={copy.navigation.footerShoppingHeading}><h2>{copy.navigation.footerShoppingHeading}</h2>
      <Link href="/produtos">{copy.navigation.catalog}</Link><Link href="/novidades">{copy.navigation.newArrivals}</Link><Link href="/meninas">{copy.navigation.girls}</Link><Link href="/meninos">{copy.navigation.boys}</Link>
    </nav>
    <nav aria-label={copy.navigation.footerCollectionsHeading}><h2>{copy.navigation.footerCollectionsHeading}</h2><Link href="/colecoes">{copy.navigation.collections}</Link>{catalog.collections.map((collection) => <Link key={collection.id} href={`/colecoes/${collection.slug}`}>{collection.name}</Link>)}</nav>
  </div></footer>;
}
