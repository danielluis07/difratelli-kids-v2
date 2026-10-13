import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { Diagnostic, ValidationResult } from "./validation";

const file = z.object({ path: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/) });
const size = z.number().int().positive();
const crop = z.object({ name: z.string(), ratio: z.string(), width: size, height: size, webPath: z.string(), sha256: file.shape.sha256,
  sourceRect: z.object({ left: z.number().int().nonnegative(), top: z.number().int().nonnegative(), width: size, height: size }) });
const schema = z.object({ revision: z.string(), castCoverage: z.array(z.string()).length(8), assets: z.array(z.object({
  id: z.string(), role: z.string(), originalPath: z.string(), originalSha256: file.shape.sha256, width: size, height: size, alt: z.string().min(1), crops: z.array(crop).min(1),
})).length(25) });
const approvalSchema = z.object({ revision: z.string(), status: z.literal("approved"), implementationAllowed: z.literal(true), reviewer: z.string().min(1), recordedAtUtc: z.string().min(1),
  evidence: z.object({ message: z.string().min(1), context: z.string().min(1) }), approvalRequestSha256: file.shape.sha256, files: z.array(file).min(1) });
const refreshSchema = z.object({ revision: z.string(), parentRevision: z.string(), assets: z.array(z.object({
  id: z.string(), slot: z.string(), originalPath: z.string(), originalSha256: file.shape.sha256, width: size, height: size,
  crops: z.array(crop.extend({ derivative: z.object({ originalPath: z.string(), originalSha256: file.shape.sha256, width: size, height: size }).optional() })).min(1),
})).length(5) });
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

// The immutable review stays pending in its original bytes; this separate human
// decision is the authority permitting those exact bytes to enter the storefront.
export async function checkHomepageReadiness(root = process.cwd()): Promise<ValidationResult> {
  const diagnostics: Diagnostic[] = [];
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  const path = (input: string) => {
    const full = resolve(root, input), rel = relative(resolve(root), full);
    if (isAbsolute(input) || rel.startsWith("..") || isAbsolute(rel)) throw new Error("Path escapes repository");
    return full;
  };
  try {
    const manifest = schema.parse(JSON.parse(await readFile(path("docs/content/homepage-manifest.json"), "utf8")));
    const approvalResult = approvalSchema.safeParse(JSON.parse(await readFile(path("docs/content/homepage-approval.json"), "utf8")));
    if (!approvalResult.success) return { valid: false, diagnostics: [{ record: "homepage", field: "approval", message: "Exact-content human implementation approval missing" }] };
    const approval = approvalResult.data;
    if (approval.revision !== manifest.revision) fail("homepage", "revision", "Approval revision differs from content");
    const requestBytes = await readFile(path("docs/content/homepage-approval-request.json"));
    if (digest(requestBytes) !== approval.approvalRequestSha256) fail("homepage", "approvalRequestSha256", "Reviewed approval request changed");
    const request = z.object({ revision: z.string(), files: z.array(file) }).parse(JSON.parse(requestBytes.toString()));
    if (request.revision !== approval.revision || JSON.stringify(request.files) !== JSON.stringify(approval.files)) fail("homepage", "files", "Approval does not bind the exact reviewed files");
    const files = new Map(approval.files.map(f => [f.path, f.sha256]));
    for (const required of ["docs/content/homepage-manifest.json", "docs/content/homepage-copy-proposal.json", "docs/content/homepage-review.html", "docs/content/homepage-generation.json"]) {
      if (!files.has(required)) fail("homepage", required, "Content not bound to human approval");
    }
    for (let offset = 0; offset < approval.files.length; offset += 8) await Promise.all(approval.files.slice(offset, offset + 8).map(async f => {
      try { if (digest(await readFile(path(f.path))) !== f.sha256) fail(f.path, "sha256", "Homepage content differs from approved bytes"); }
      catch { fail(f.path, "path", "Approved homepage file missing or unreadable"); }
    }));
    if (new Set(manifest.assets.map(a => a.id)).size !== 25) fail("homepage", "assets", "Duplicate asset identifiers");
    for (const [role, count] of [["category-tile", 8], ["shop-the-look", 3], ["social-photo", 7]] as const) {
      if (manifest.assets.filter(a => a.role === role).length !== count) fail("homepage", role, "Incomplete section imagery");
    }
    for (const a of manifest.assets) {
      if (files.get(a.originalPath) !== a.originalSha256) fail(a.id, "originalSha256", "Source missing from reviewed files");
      for (const c of a.crops) {
        if (files.get(c.webPath) !== c.sha256) fail(a.id, c.name, "Crop missing from reviewed files");
        const [w, h] = c.ratio.split(":").map(Number);
        if (c.width * h !== c.height * w || c.sourceRect.width !== c.width || c.sourceRect.height !== c.height || c.sourceRect.left + c.width > a.width || c.sourceRect.top + c.height > a.height) fail(a.id, c.name, "Invalid art-direction crop");
        try {
          const meta = await sharp(await readFile(path(c.webPath))).metadata();
          if (meta.width !== c.width || meta.height !== c.height || meta.format !== "webp") fail(a.id, c.name, "Crop dimensions or format changed");
        } catch { fail(a.id, c.name, "Crop cannot be decoded"); }
      }
    }
    const refresh = refreshSchema.parse(JSON.parse(await readFile(path("docs/content/homepage-image-refresh-manifest.json"), "utf8")));
    const refreshDecision = approvalSchema.safeParse(JSON.parse(await readFile(path("docs/content/homepage-image-refresh-approval.json"), "utf8")));
    if (!refreshDecision.success) fail("homepage-image-refresh", "approval", "Exact-image human implementation approval missing");
    else {
      const decision = refreshDecision.data;
      if (decision.revision !== refresh.revision || refresh.parentRevision !== manifest.revision) fail("homepage-image-refresh", "revision", "Image refresh approval or parent revision differs");
      const reviewBytes = await readFile(path("docs/content/homepage-image-refresh-approval-request.json"));
      if (digest(reviewBytes) !== decision.approvalRequestSha256) fail("homepage-image-refresh", "approvalRequestSha256", "Reviewed image refresh request changed");
      const review = z.object({ revision: z.string(), parentRevision: z.string(), files: z.array(file) }).parse(JSON.parse(reviewBytes.toString()));
      if (review.revision !== decision.revision || review.parentRevision !== manifest.revision || JSON.stringify(review.files) !== JSON.stringify(decision.files)) fail("homepage-image-refresh", "files", "Decision differs from exact reviewed files");
      const refreshedFiles = new Map(decision.files.map(f => [f.path, f.sha256]));
      for (const required of ["docs/content/homepage-image-refresh-manifest.json", "docs/content/homepage-image-refresh-generation.json", "docs/content/homepage-image-refresh-review.html"]) {
        if (!refreshedFiles.has(required)) fail("homepage-image-refresh", required, "Content not bound to human approval");
      }
      for (let offset = 0; offset < decision.files.length; offset += 8) await Promise.all(decision.files.slice(offset, offset + 8).map(async f => {
        try { if (digest(await readFile(path(f.path))) !== f.sha256) fail(f.path, "sha256", "Image refresh differs from approved bytes"); }
        catch { fail(f.path, "path", "Approved image refresh file missing or unreadable"); }
      }));
      const slots = new Set(refresh.assets.map(a => a.slot));
      if (["hero-right", "category-t-shirts", "category-polos", "category-matching-sets", "category-dresses"].some(slot => !slots.has(slot))) fail("homepage-image-refresh", "slots", "Incomplete replacement imagery");
      for (const a of refresh.assets) {
        if (refreshedFiles.get(a.originalPath) !== a.originalSha256) fail(a.id, "originalSha256", "Replacement source missing from reviewed files");
        for (const c of a.crops) {
          const original = c.derivative ?? a;
          if (refreshedFiles.get(c.webPath) !== c.sha256 || refreshedFiles.get(original.originalPath) !== original.originalSha256) fail(a.id, c.name, "Replacement crop or derivative missing from approval");
          const [w, h] = c.ratio.split(":").map(Number);
          if (c.width * h !== c.height * w || c.sourceRect.width !== c.width || c.sourceRect.height !== c.height || c.sourceRect.left + c.width > original.width || c.sourceRect.top + c.height > original.height) fail(a.id, c.name, "Invalid replacement crop");
          try {
            const meta = await sharp(await readFile(path(c.webPath))).metadata();
            if (meta.width !== c.width || meta.height !== c.height || meta.format !== "webp") fail(a.id, c.name, "Replacement raster dimensions or format changed");
          } catch { fail(a.id, c.name, "Replacement crop cannot be decoded"); }
        }
      }
    }
  } catch (error) { fail("homepage", "readiness", error instanceof Error ? error.message : "Unreadable homepage package"); }
  return { valid: diagnostics.length === 0, diagnostics };
}
