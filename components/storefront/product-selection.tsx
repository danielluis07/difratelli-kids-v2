"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { parseProductColor } from "@/lib/browsing/product-color";

export function ProductSelection({ defaultColorwayId, colorways }: { defaultColorwayId: string; colorways: { id: string; content: ReactNode }[] }) {
  const colorId = parseProductColor({ defaultColorwayId, colorways }, useSearchParams());
  return colorways.find((color) => color.id === colorId)!.content;
}
