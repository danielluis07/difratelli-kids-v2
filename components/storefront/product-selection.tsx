"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useState, type ReactNode } from "react";
import { parseProductColor } from "@/lib/browsing/product-color";

// Product-level selection survives the keyed colorway content/gallery below.
export const ProductSizeContext = createContext<{ size: string | null; selectSize: (size: string) => void } | null>(null);

export function ProductSelection({ defaultColorwayId, colorways }: { defaultColorwayId: string; colorways: { id: string; content: ReactNode }[] }) {
  const [size, selectSize] = useState<string | null>(null);
  const colorId = parseProductColor({ defaultColorwayId, colorways }, useSearchParams());
  return <ProductSizeContext value={{ size, selectSize }}>{colorways.find((color) => color.id === colorId)!.content}</ProductSizeContext>;
}
