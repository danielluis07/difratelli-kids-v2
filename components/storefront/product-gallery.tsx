"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AssetImage } from "./asset-image";
import copy from "@/docs/content/copy-proposal.json";

type GalleryPhoto = { src: string; alt: string; width: number; height: number; label: string };

export function ProductGallery({ name, photos, disabled = false }: { name: string; photos: GalleryPhoto[]; disabled?: boolean }) {
  const [selected, setSelected] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function movePhoto(direction: number) {
    if (!disabled) setSelected((index) => (index + direction + photos.length) % photos.length);
  }
  const photo = photos[selected];
  return <section className="product-gallery" aria-label={copy.product.galleryLabel.replace("{product}", name)}>
    <div className="detail-photo" onTouchStart={(event) => {
      const touch = event.touches.length === 1 ? event.touches[0] : null;
      touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    }} onTouchCancel={() => { touchStart.current = null; }} onTouchEnd={(event) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || event.touches.length > 0) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) movePhoto(dx < 0 ? 1 : -1);
    }}>
      <AssetImage key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fill sizes="(max-width: 591px) calc(100vw - 32px), (max-width: 767px) 560px, (max-width: 1023px) calc((100vw - 96px) / 2), (max-width: 1279px) calc((100vw - 160px) / 2), 560px" loading="eager" />
    </div>
    <ToggleGroup className="gallery-thumbnails" aria-label={copy.product.galleryLabel.replace("{product}", name)} value={[String(selected)]} onValueChange={(values) => { if (values[0] !== undefined) setSelected(Number(values[0])); }}>
      {photos.map((thumbnail, index) => <ToggleGroupItem key={thumbnail.src} value={String(index)} disabled={disabled} className="gallery-thumbnail" aria-label={copy.product.thumbnailLabel.replace("{index}", String(index + 1)).replace("{role}", thumbnail.label)}>
        <AssetImage src={thumbnail.src} alt="" aria-hidden="true" width={thumbnail.width} height={thumbnail.height} fill sizes="72px" />
      </ToggleGroupItem>)}
    </ToggleGroup>
    <div className="gallery-controls">
      <Button variant="outline" disabled={disabled} onClick={() => movePhoto(-1)}>{copy.product.previousPhoto}</Button>
      <Button variant="outline" disabled={disabled} onClick={() => movePhoto(1)}>{copy.product.nextPhoto}</Button>
      <Dialog>
        <DialogTrigger disabled={disabled} render={<Button variant="outline" />}>{copy.product.enlarge}</DialogTrigger>
        <DialogContent className="enlargement-dialog" showCloseButton={false}>
          <DialogHeader><DialogTitle>{copy.product.enlargedTitle.replace("{product}", name)}</DialogTitle><DialogDescription>{photo.label}</DialogDescription></DialogHeader>
          <DialogClose render={<Button variant="outline" />}>{copy.product.closeEnlargement}</DialogClose>
          <div className="enlarged-photo"><AssetImage key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fill sizes="(max-width: 931px) calc(100vw - 32px), 900px" /></div>
        </DialogContent>
      </Dialog>
    </div>
    <p className="gallery-position" aria-live="polite" aria-atomic="true">{copy.product.photoPosition.replace("{index}", String(selected + 1)).replace("{count}", String(photos.length))}</p>
  </section>;
}
