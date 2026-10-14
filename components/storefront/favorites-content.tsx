"use client";

import Link from "next/link";
import { useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { productCard, productImageSizes } from "@/lib/presentation/catalog";
import copy from "@/docs/content/copy-proposal.json";
import { ProductCard } from "./product-card";
import { useFavorites } from "./favorites-provider";

export function FavoritesContent() {
  const { snapshot } = useFavorites();
  const content = useRef<HTMLDivElement>(null);
  const pending = snapshot.restoration === "pending";
  return <div ref={content} className="favorites-content" tabIndex={-1} aria-label={copy.navigation.favorites} aria-busy={pending}>
    {pending ? <p role="status">{copy.favorites.pending}</p> : snapshot.count === 0 ? <Empty>
      <EmptyHeader><EmptyTitle>{copy.favorites.emptyHeading}</EmptyTitle><EmptyDescription>{copy.favorites.emptyBody}</EmptyDescription></EmptyHeader>
      <EmptyContent><Link className={buttonVariants()} href="/produtos">{copy.favorites.emptyAction}</Link></EmptyContent>
    </Empty> : <ul className="product-grid">{snapshot.products.map((product, index) => <ProductCard key={product.id}
      product={productCard(product)} sizes={productImageSizes} onFavoriteRemoved={() => {
        requestAnimationFrame(() => {
          const buttons = content.current?.querySelectorAll<HTMLButtonElement>(".card-favorite");
          (buttons?.[Math.min(index, buttons.length - 1)] ?? content.current)?.focus();
        });
      }} />)}</ul>}
  </div>;
}
