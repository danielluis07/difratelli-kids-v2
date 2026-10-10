import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { dmSans, fraunces } from "@/fonts";
import { copy } from "@/lib/catalog";

export const metadata: Metadata = {
  title: copy.editorial.metadata.homeTitle,
  description: copy.editorial.metadata.description,
  robots: { index: false, follow: false },
  icons: { icon: "/identity/favicon-v1.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "h-full antialiased font-sans",
        dmSans.variable,
        fraunces.variable,
      )}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
