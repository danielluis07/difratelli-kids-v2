"use client";

import Link from "next/link";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AssetImage } from "./asset-image";
import type { ProductCardData } from "@/lib/presentation/catalog";
import copy from "@/docs/content/copy-proposal.json";

export function ProductCard({ product, sizes }: { product: ProductCardData; sizes: string }) {
  const [colorId, setColorId] = useState(product.defaultColorwayId);
  const color = product.colorways.find((option) => option.id === colorId)!;
  const [model, isolated] = color.photos;
  const href = `/produto/${product.slug}?cor=${encodeURIComponent(color.id)}`;
  return (
    <li className="product-card" data-product-id={product.id}>
      <Link className="product-link" href={href}>
        <div className="product-photo">
          <AssetImage key={model.src} {...model} fill sizes={sizes} className="model-photo" />
          <AssetImage key={isolated.src} {...isolated} alt="" aria-hidden="true" fill sizes={sizes} className="isolated-photo" />
        </div>
        <h2 className="product-name">{product.name}</h2>
        <p className="product-price">{product.price}</p>
      </Link>
      <ToggleGroup className="color-swatches" aria-label={`${copy.product.color}: ${product.name}`} value={[color.id]} onValueChange={(values) => { if (values[0]) setColorId(values[0]); }}>
        {product.colorways.map((option) => (
          <ToggleGroupItem key={option.id} value={option.id} className="color-swatch" aria-label={copy.product.colorOption.replace("{color}", option.name)} title={option.name}>
            <span className="swatch-dot" style={{ backgroundColor: option.swatch }} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <span className="sr-only" aria-live="polite">{color.name}</span>
    </li>
  );
}
