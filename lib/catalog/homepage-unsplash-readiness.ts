import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { Diagnostic, ValidationResult } from "./validation";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const file = z.object({ path: z.string().min(1), sha256: hash });
const size = z.number().int().positive();
const crop = z.object({ name: z.string(), ratio: z.string(), width: size, height: size, webPath: z.string(), src: z.string(), sha256: hash,
  sourceRect: z.object({ left: z.number().int().nonnegative(), top: z.number().int().nonnegative(), width: size, height: size }) });
const manifestSchema = z.object({ revision: z.string(), status: z.literal("approved"), retainedSlotIds: z.array(z.string()).length(2),
  retainedAssets: z.array(z.object({ id: z.string(), originalPath: z.string(), originalSha256: hash, crops: z.array(crop) })).length(2),
  assets: z.array(z.object({ id: z.string(), slotIds: z.array(z.string()).min(1), kind: z.enum(["children", "clothes-only"]), alt: z.string().min(1),
    originalPath: z.string(), originalSha256: hash, width: size, height: size, crops: z.array(crop).min(1) })).length(20) });
const approvalSchema = z.object({ revision: z.string(), status: z.literal("approved"), implementationAllowed: z.literal(true), manifestSha256: hash,
  reviewer: z.string().min(1), recordedAtUtc: z.iso.datetime(), evidence: z.object({ message: z.string().min(1), context: z.string().min(1) }), files: z.array(file).min(1) });
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
type ExportCrop = z.infer<typeof crop>;

export async function checkHomepageUnsplashReadiness(root = process.cwd()): Promise<ValidationResult> {
  const diagnostics: Diagnostic[] = [];
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  const path = (input: string) => {
    const full = resolve(root, input), rel = relative(resolve(root), full);
    if (isAbsolute(input) || rel.startsWith("..") || isAbsolute(rel)) throw new Error("Path escapes repository");
    return full;
  };
  try {
    const approvalResult = approvalSchema.safeParse(JSON.parse(await readFile(path("docs/content/homepage-unsplash-approval.json"), "utf8")));
    if (!approvalResult.success) return { valid: false, diagnostics: [{ record: "homepage-unsplash", field: "approval", message: "Exact homepage photograph acceptance missing" }] };
    const approval = approvalResult.data;
    const bytes = await readFile(path("docs/content/homepage-unsplash-manifest.json"));
    const manifest = manifestSchema.parse(JSON.parse(bytes.toString()));
    if (approval.revision !== manifest.revision || approval.manifestSha256 !== digest(bytes)) fail("homepage-unsplash", "manifestSha256", "Runtime imagery differs from accepted manifest");
    const files = new Map(approval.files.map(f => [f.path, f.sha256]));
    const base = JSON.parse(await readFile(path("docs/content/homepage-manifest.json"), "utf8"));
    const expectedSlots = base.assets.map((a: { id: string }) => a.id).sort();
    const actualSlots = [...manifest.retainedSlotIds, ...manifest.assets.flatMap(a => a.slotIds)].sort();
    if (JSON.stringify(expectedSlots) !== JSON.stringify(actualSlots)) fail("homepage-unsplash", "slots", "Every homepage slot must be mapped exactly once");
    if (JSON.stringify([...manifest.retainedSlotIds].sort()) !== JSON.stringify(["editorial-quintal", "quote-garments"])) fail("homepage-unsplash", "retainedSlotIds", "Both original large banners must be retained");
    for (const retained of manifest.retainedAssets) {
      const original = base.assets.find((a: { id: string }) => a.id === retained.id);
      if (!original || original.originalSha256 !== retained.originalSha256 || original.crops.length !== retained.crops.length || retained.crops.some(crop => !original.crops.some((prior: ExportCrop) => prior.name === crop.name && prior.webPath === crop.webPath && prior.sha256 === crop.sha256 && prior.width === crop.width && prior.height === crop.height && prior.src === crop.src))) fail(retained.id, "retained", "Original banner imagery or crops changed");
    }
    for (const asset of [...manifest.assets, ...manifest.retainedAssets]) {
      if (files.get(asset.originalPath) !== asset.originalSha256) fail(asset.id, "originalSha256", "Original missing from acceptance");
      for (const crop of asset.crops) {
        if (files.get(crop.webPath) !== crop.sha256 || crop.src !== crop.webPath.replace(/^public/, "")) fail(asset.id, crop.name, "Crop missing from acceptance or source URL changed");
      }
    }
    for (const asset of manifest.assets) {
      const native = await sharp(await readFile(path(asset.originalPath))).metadata();
      if (native.width !== asset.width || native.height !== asset.height) fail(asset.id, "dimensions", "Downloaded original dimensions changed");
      for (const crop of asset.crops) {
        const rect = crop.sourceRect, [rx, ry] = crop.ratio.split(":").map(Number);
        if (!(rx > 0 && ry > 0) || Math.abs(crop.width * ry - crop.height * rx) > rx || rect.left + rect.width > asset.width || rect.top + rect.height > asset.height || crop.width > rect.width || crop.height > rect.height) fail(asset.id, crop.name, "Invalid crop ratio, bounds or enlargement");
        const raster = await sharp(await readFile(path(crop.webPath))).metadata();
        if (raster.width !== crop.width || raster.height !== crop.height || raster.format !== "webp") fail(asset.id, crop.name, "Export format or dimensions changed");
      }
    }
    for (let offset = 0; offset < approval.files.length; offset += 8) {
      await Promise.all(approval.files.slice(offset, offset + 8).map(async file => {
        try { if (digest(await readFile(path(file.path))) !== file.sha256) fail(file.path, "sha256", "Accepted file bytes changed"); }
        catch { fail(file.path, "path", "Accepted file missing or unreadable"); }
      }));
    }
  } catch (error) { fail("homepage-unsplash", "readiness", error instanceof Error ? error.message : "Unreadable imagery package"); }
  return { valid: diagnostics.length === 0, diagnostics };
}
