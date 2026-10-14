import homepageManifest from "@/docs/content/homepage-manifest.json";
import homepageCopy from "@/docs/content/homepage-copy-proposal.json";
import imageRefresh from "@/docs/content/homepage-image-refresh-manifest.json";
import heroRefresh from "@/docs/content/hero-color-refresh-manifest.json";
import heroIntegration from "@/docs/content/hero-color-refresh-integration.json";
import { editorial } from "@/lib/catalog";

export const homeCopy = { ...homepageCopy, hero: { ...homepageCopy.hero, actions: heroIntegration.heroActions } };
export type EditorialPhoto = { src: string; width: number; height: number; alt: string };
export function homepagePhoto(id: string, cropName?: string): EditorialPhoto {
  const heroReplacement = heroRefresh.integration.replacements.find(r => heroIntegration.activeAssetIds.includes(r.assetId) && r.replacesAssetIds.includes(id));
  if (heroReplacement) {
    const asset = heroRefresh.assets.find(a => a.id === heroReplacement.assetId);
    const defaultCrop = id === "hero-left-tablet" ? "tablet" : id === "hero-left" ? "narrow" : "desktop";
    const mappedCrop = cropName ?? defaultCrop;
    const crop = asset?.crops.find(c => c.name === mappedCrop);
    if (!asset || !crop) throw new Error(`Missing approved homepage crop: ${id}/${mappedCrop}`);
    return { src: crop.src, width: crop.width, height: crop.height, alt: asset.alt };
  }
  const replacement = imageRefresh.integration.replacements.find(r => r.replacesAssetIds.includes(id));
  const asset = replacement
    ? imageRefresh.assets.find(a => a.id === replacement.assetId)
    : homepageManifest.assets.find(a => a.id === id);
  const crop = cropName ? asset?.crops.find(c => c.name === cropName) : asset?.crops[0];
  if (!asset || !crop) throw new Error(`Missing approved homepage crop: ${id}/${cropName ?? "default"}`);
  return { src: crop.src, width: crop.width, height: crop.height, alt: asset.alt };
}
export function editorialPhoto(id: string, cropName: string): EditorialPhoto {
  const asset = editorial.assets.find(a => a.id === id);
  const crop = asset?.crops.find(c => c.name === cropName);
  if (!asset || !crop) throw new Error(`Missing approved editorial crop: ${id}/${cropName}`);
  return { src: crop.src, width: crop.width, height: crop.height, alt: asset.alt };
}
export function collectionPhoto(collectionId: string, cropName: string): EditorialPhoto {
  const asset = editorial.assets.find(a => a.role === "collection" && a.collectionIds.includes(collectionId));
  if (!asset) throw new Error(`Missing approved collection photograph: ${collectionId}`);
  return editorialPhoto(asset.id, cropName);
}
