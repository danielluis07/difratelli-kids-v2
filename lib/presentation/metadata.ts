import type { Metadata } from "next";
import { copy, editorial } from "@/lib/catalog";

// Vercel's deployment origin keeps preview sharing independent of production.
export function siteOrigin(): URL {
  const configured = process.env.SITE_URL;
  if (configured) return new URL(configured);
  const deployment = process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
    : process.env.VERCEL_URL;
  return new URL(deployment ? `https://${deployment}` : "http://localhost:3000");
}

export function pageMetadata(title: string, path: string, description = copy.editorial.metadata.description, image?: { src: string; alt: string; width: number; height: number }): Metadata {
  const origin = siteOrigin();
  const sharingImage = image ?? editorial.assets[0].crops.find((crop) => crop.name === "tablet")!;
  const fullTitle = path === "/" ? copy.editorial.metadata.homeTitle : copy.editorial.metadata.pageTitle.replace("{pageTitle}", title);
  const images = [{ url: new URL(sharingImage.src, origin).href, width: sharingImage.width, height: sharingImage.height, alt: image?.alt ?? editorial.assets[0].alt }];
  return {
    metadataBase: origin, title: fullTitle, description,
    robots: { index: false, follow: false },
    openGraph: { type: "website", locale: "pt_BR", siteName: copy.editorial.metadata.siteName, title: fullTitle, description, url: new URL(path, origin).href, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}
