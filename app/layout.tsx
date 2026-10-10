import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { dmSans, fraunces } from "@/fonts";
import { catalog, copy, identity, curatedProducts, newArrivals } from "@/lib/catalog";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { pageMetadata } from "@/lib/presentation/metadata";

export const metadata: Metadata = {
  ...pageMetadata(copy.editorial.metadata.siteName, "/"),
  icons: { icon: "/identity/favicon-v1.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const groups = [
    { label: copy.navigation.newArrivals, href: "/novidades", products: newArrivals() },
    { label: copy.navigation.girls, href: "/meninas", products: curatedProducts().filter((p) => p.audienceId !== "boys") },
    { label: copy.navigation.boys, href: "/meninos", products: curatedProducts().filter((p) => p.audienceId !== "girls") },
  ].map(({ label, href, products }) => ({ label, href, links: catalog.categories.filter((category) => products.some((p) => p.categoryId === category.id)).map((category) => ({ label: category.name, href: `${href}?categoria=${category.id}` })) }));
  const wordmark = identity.assets.find((asset) => asset.id === "wordmark-brown-v1")!;
  return (
    <html
      lang="pt-BR"
      className={cn(
        "h-full antialiased font-sans",
        dmSans.variable,
        fraunces.variable,
      )}>
      <body className="min-h-full flex flex-col"><StorefrontHeader groups={groups} wordmark={wordmark.path.replace(/^public/, "")} />{children}<StorefrontFooter /></body>
    </html>
  );
}
