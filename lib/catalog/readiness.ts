import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import sharp from "sharp";
import { validateContent } from "./content-validation";
import type { Diagnostic, ValidationResult } from "./validation";

const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

// Filesystem checks are deliberately separate from the browser-safe catalog.
export async function checkContentReadiness(root = process.cwd()): Promise<ValidationResult> {
  const diagnostics: Diagnostic[] = [];
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  const safePath = (path: string) => {
    const full = resolve(root, path);
    const rel = relative(resolve(root), full);
    if (isAbsolute(path) || rel.startsWith("..") || isAbsolute(rel)) throw new Error("Path escapes repository");
    return full;
  };
  try {
    const bytes = await readFile(safePath("docs/content/package-manifest.json"));
    const manifest = JSON.parse(bytes.toString());
    const approval = JSON.parse(await readFile(safePath("docs/content/package-approval.json"), "utf8"));
    if (approval.status !== "approved" || approval.implementationAllowed !== true || approval.revision !== manifest.revision) fail("package", "approval", "Complete package implementation approval missing");
    if (approval.manifestSha256 !== digest(bytes)) fail("package", "manifestSha256", "Manifest differs from exact approved package");
    diagnostics.push(...validateContent(manifest).diagnostics);
    // Validate the records the app actually imports as well as their immutable
    // package snapshot. A bad edit must identify the product/field, not only hash.
    const json = async (name: string) => JSON.parse(await readFile(safePath(`docs/content/${name}.json`), "utf8"));
    const [catalog, copy, cast, quintal, brincadeira, imaginacao, editorial, identity] = await Promise.all(
      ["catalog-proposal", "copy-proposal", "cast-manifest", "quintal-manifest", "brincadeira-manifest", "imaginacao-manifest", "editorial-manifest", "identity-manifest"].map(json),
    );
    diagnostics.push(...validateContent({ ...manifest, catalog, copy, cast,
      catalogAssets: [...quintal.assets, ...brincadeira.assets, ...imaginacao.assets], editorial, identity }).diagnostics);
    for (const [field, pathField] of [["reviewSha256", "reviewPath"], ["approvalRequestSha256", "approvalRequestPath"]]) {
      try {
        if (digest(await readFile(safePath(approval[pathField]))) !== approval[field]) fail("package", field, "Approval evidence bytes changed");
      } catch { fail("package", pathField, "Approval evidence is missing or unreadable"); }
    }
    if (Array.isArray(manifest.files)) {
      // Bounded concurrency avoids opening hundreds of large originals at once.
      for (let offset = 0; offset < manifest.files.length; offset += 8) {
        await Promise.all(manifest.files.slice(offset, offset + 8).map(async (file: { path: string; sha256: string; bytes: number }) => {
          try {
            const bytes = await readFile(safePath(file.path));
            if (digest(bytes) !== file.sha256 || bytes.length !== file.bytes) fail(file.path, "sha256/bytes", "Required file differs from approved bytes");
          } catch { fail(String(file.path), "path", "Required approved file missing, unreadable, or outside repository"); }
        }));
      }
    }
    // Decode raster metadata independently of the manifest's claimed dimensions.
    const assets = [...(manifest.catalogAssets ?? []), ...(manifest.cast?.assets ?? []), ...(manifest.editorial?.assets ?? [])];
    for (const asset of assets) {
      const images = [{ path: asset.originalPath, width: asset.width, height: asset.height },
        ...(asset.webPath ? [{ path: asset.webPath, width: asset.webWidth ?? asset.width, height: asset.webHeight ?? asset.height }] : []),
        ...(asset.crops ?? []).map((crop: { webPath: string; width: number; height: number }) => ({ path: crop.webPath, width: crop.width, height: crop.height }))];
      for (const image of images) {
        try {
          const meta = await sharp(await readFile(safePath(image.path))).metadata();
          if (meta.width !== image.width || meta.height !== image.height || (image.path.startsWith("public/") && meta.format !== "webp")) fail(asset.id, image.path, "Raster format or dimensions differ from approved record");
        } catch { fail(String(asset.id), String(image.path), "Required raster cannot be decoded"); }
      }
    }
  } catch (error) {
    fail("package", "readiness", error instanceof Error ? error.message : "Unreadable package");
  }
  return { valid: diagnostics.length === 0, diagnostics };
}
