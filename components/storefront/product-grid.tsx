import { type Product } from "@/lib/catalog";
import { productCard, productImageSizes } from "@/lib/presentation/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: readonly Product[] }) {
  return <ul className="product-grid">{products.map((product) => <ProductCard key={product.id} product={productCard(product)} sizes={productImageSizes} />)}</ul>;
}
