import Link from "next/link";
import { copy, photographs, formatMoney, type Product } from "@/lib/catalog";
import { ProductGallery } from "./product-gallery";
import { ProductSize } from "./product-size";

export function ProductContent({ product, colorwayId, galleryInteractive = true }: { product: Product; colorwayId: string; galleryInteractive?: boolean }) {
  const colorway = product.colorways.find((color) => color.id === colorwayId)!;
  const photos = photographs(product.id, colorway.id);
  return <div className="product-detail">
    <ProductGallery key={`${product.id}:${colorway.id}`} name={product.name} disabled={!galleryInteractive} photos={photos.map((photo) => ({ src: photo.webPath.replace(/^public/, ""), alt: photo.alt, width: photo.webWidth, height: photo.webHeight, label: photo.galleryOrder === 1 ? copy.product.modelPhoto : copy.product.isolatedPhoto }))} />
    <div className="product-information">
      <h1>{product.name}</h1><p className="detail-price">{formatMoney(product.priceCents)}</p>
      <p aria-live="polite" aria-atomic="true">{copy.product.color}: <strong>{colorway.name}</strong></p>
      <div className="detail-colors" aria-label={copy.product.color}>{product.colorways.map((color) => <Link key={color.id} href={`?cor=${encodeURIComponent(color.id)}`} replace scroll={false} aria-current={color.id === colorway.id ? "true" : undefined} className="detail-color"><span className="swatch-dot" style={{ backgroundColor: color.swatch }} />{color.name}</Link>)}</div>
      <ProductSize sizes={product.sizes} disabled={!galleryInteractive} />
      {product.includedPieces.length > 0 ? <p className="set-contents">{copy.product.setContents.replace("{pieceOne}", product.includedPieces[0]).replace("{pieceTwo}", product.includedPieces[1])}</p> : null}
      <div className="product-description">
        <details open><summary>{copy.product.description}</summary><p>{product.description}</p></details>
        <details open><summary>{copy.product.composition}</summary><p>{product.composition}</p></details>
        <details open><summary>{copy.product.fit}</summary><p>{product.fitGuidance}</p></details>
      </div>
    </div>
  </div>;
}
