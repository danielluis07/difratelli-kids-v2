import { photographs, formatMoney, type Product } from "@/lib/catalog";

export const productImageSizes = "(max-width: 767px) calc((100vw - 48px) / 2), (max-width: 1023px) calc((100vw - 112px) / 3), (max-width: 1440px) calc((100vw - 168px) / 4), 318px";

export function productCard(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: formatMoney(product.priceCents),
    defaultColorwayId: product.defaultColorwayId,
    colorways: product.colorways.map((colorway) => ({
      id: colorway.id, name: colorway.name, swatch: colorway.swatch,
      photos: photographs(product.id, colorway.id).map((asset) => ({
        src: asset.webPath.replace(/^public/, ""),
        alt: asset.alt, width: asset.webWidth, height: asset.webHeight,
      })),
    })),
  };
}
export type ProductCardData = ReturnType<typeof productCard>;
