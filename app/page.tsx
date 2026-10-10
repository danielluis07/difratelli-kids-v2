import Link from "next/link";
import { catalog, copy, newArrivals } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/storefront/product-grid";

export default function Home() {
  return (
    <main id="main-content" className="content-container home-entry">
      <div className="page-intro"><h1>{copy.editorial.hero.heading}</h1><p>{copy.editorial.hero.support}</p>
        <div className="home-actions"><Button nativeButton={false} role="link" render={<Link href={copy.editorial.hero.girlsAction.href} />}>{copy.editorial.hero.girlsAction.label}</Button><Button variant="outline" nativeButton={false} role="link" render={<Link href={copy.editorial.hero.boysAction.href} />}>{copy.editorial.hero.boysAction.label}</Button></div>
      </div>
      <div className="section-heading"><h2>{catalog.merchandising.homepage.newArrivals.heading}</h2><Link href="/novidades">{copy.common.viewAll}</Link></div>
      <ProductGrid products={newArrivals().filter((product) => catalog.merchandising.homepage.newArrivals.productIds.includes(product.id))} />
    </main>
  );
}
