"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AssetImage } from "./asset-image";
import copy from "@/docs/content/copy-proposal.json";

type GalleryPhoto = { src: string; alt: string; width: number; height: number; label: string };

export function ProductGallery({ name, photos, disabled = false }: { name: string; photos: GalleryPhoto[]; disabled?: boolean }) {
  const [selected, setSelected] = useState(0);
  const photo = photos[selected];
  return <section className="product-gallery" aria-label={copy.product.galleryLabel.replace("{product}", name)}>
    <div className="detail-photo">
      <AssetImage key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fill sizes="(max-width: 591px) calc(100vw - 32px), (max-width: 767px) 560px, (max-width: 1023px) calc((100vw - 96px) / 2), (max-width: 1279px) calc((100vw - 160px) / 2), 560px" loading="eager" />
    </div>
    <ToggleGroup className="gallery-thumbnails" aria-label={copy.product.galleryLabel.replace("{product}", name)} value={[String(selected)]} onValueChange={(values) => { if (values[0] !== undefined) setSelected(Number(values[0])); }}>
      {photos.map((thumbnail, index) => <ToggleGroupItem key={thumbnail.src} value={String(index)} disabled={disabled} className="gallery-thumbnail" aria-label={copy.product.thumbnailLabel.replace("{index}", String(index + 1)).replace("{role}", thumbnail.label)}>
        <AssetImage src={thumbnail.src} alt="" aria-hidden="true" width={thumbnail.width} height={thumbnail.height} fill sizes="72px" />
      </ToggleGroupItem>)}
    </ToggleGroup>
    <p className="gallery-position" aria-live="polite" aria-atomic="true">{copy.product.photoPosition.replace("{index}", String(selected + 1)).replace("{count}", String(photos.length))}</p>
  </section>;
}
