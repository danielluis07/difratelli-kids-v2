export function parseProductColor(product: { readonly defaultColorwayId: string; readonly colorways: readonly { readonly id: string }[] }, params: Pick<URLSearchParams, "get">): string {
  const color = params.get("cor");
  return product.colorways.some((c) => c.id === color) ? color! : product.defaultColorwayId;
}
