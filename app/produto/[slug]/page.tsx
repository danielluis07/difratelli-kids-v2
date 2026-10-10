import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog, copy, findProductBySlug, photographs } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
import { ProductContent } from "@/components/storefront/product-content";
import { ProductSelection } from "@/components/storefront/product-selection";

// Known products must render complete static content, including without JS.
// Slug resolution can block the URL-independent shell; no server work is
// allowed during navigation. Color selection reads the URL in the browser.
export const instant = false;
export const ensureStatic = "navigation";

export function generateStaticParams() { return catalog.products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">) {
  const result = findProductBySlug((await params).slug);
  if (result.status === "missing") notFound();
  const product = result.value;
  const photo = photographs(product.id, product.defaultColorwayId)[0];
  return pageMetadata(product.name, `/produto/${product.slug}`, product.description, { src: photo.webPath.replace(/^public/, ""), width: photo.webWidth, height: photo.webHeight, alt: photo.alt });
}

export default async function Page({ params }: PageProps<"/produto/[slug]">) {
  "use cache";
  const result = findProductBySlug((await params).slug);
  if (result.status === "missing") notFound();
  const product = result.value;
  return <main id="main-content" className="content-container product-page">
    <nav className="breadcrumbs" aria-label={copy.navigation.breadcrumbLabel}><Link href="/">{copy.navigation.home}</Link><span aria-hidden="true">/</span><Link href="/produtos">{copy.navigation.catalog}</Link></nav>
    <Suspense fallback={<ProductContent product={product} colorwayId={product.defaultColorwayId} galleryInteractive={false} />}><ProductSelection defaultColorwayId={product.defaultColorwayId} colorways={product.colorways.map((color) => ({ id: color.id, content: <ProductContent key={color.id} product={product} colorwayId={color.id} /> }))} /></Suspense>
  </main>;
}
