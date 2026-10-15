import homepageManifest from "@/docs/content/homepage-manifest.json";
import homepageImagery from "@/docs/content/homepage-unsplash-manifest.json";
import { editorial } from "@/lib/catalog";

export { homeCopy } from "./home-copy";
export type EditorialPhoto = { src: string; width: number; height: number; alt: string };
export function homepagePhoto(id: string, cropName?: string): EditorialPhoto {
  const replacement = homepageImagery.assets.find(a => a.slotIds.includes(id));
  if (replacement) {
    const defaultCrop = id === "hero-left-tablet" ? "tablet" : id === "hero-left" || id === "hero-right" ? "narrow" : undefined;
    const selectedCropName = cropName ?? defaultCrop;
    const crop = selectedCropName ? replacement.crops.find(c => c.name === selectedCropName) : replacement.crops[0];
    if (!crop) throw new Error(`Missing approved homepage crop: ${id}/${selectedCropName ?? "default"}`);
    return { src: crop.src, width: crop.width, height: crop.height, alt: replacement.alt };
  }
  if (!homepageImagery.retainedSlotIds.includes(id)) throw new Error(`Missing approved homepage photograph: ${id}`);
  const asset = homepageManifest.assets.find(a => a.id === id);
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
