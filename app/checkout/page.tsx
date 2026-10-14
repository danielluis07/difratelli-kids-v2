import { copy } from "@/lib/catalog";
import { CheckoutContent } from "@/components/storefront/checkout-content";
import { pageMetadata } from "@/lib/presentation/metadata";

export const metadata = pageMetadata(copy.editorial.pages.checkout.heading, "/checkout");

export default function Page() {
  return <main id="main-content" className="content-container editorial-entry checkout-page"><CheckoutContent /></main>;
}
