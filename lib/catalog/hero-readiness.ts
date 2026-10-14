import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { Diagnostic, ValidationResult } from "./validation";

const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const file = z.object({ path: z.string().min(1), sha256: hash });
const size = z.number().int().positive();
const crop = z.object({ name: z.string(), ratio: z.string(), width: size, height: size, webPath: z.string(), src: z.string(), sha256: hash,
  sourceRect: z.object({ left: z.number().int().nonnegative(), top: z.number().int().nonnegative(), width: size, height: size }) });
const manifestSchema = z.object({ revision: z.string(), assets: z.array(z.object({ id: z.string(), slot: z.string(), originalPath: z.string(), originalSha256: hash,
  width: size, height: size, alt: z.string().min(1), references: z.array(file).min(1), crops: z.array(crop).length(2) })).length(3),
  integration: z.object({ replacements: z.array(z.object({ assetId: z.string(), replacesAssetIds: z.array(z.string()).min(1) })).length(3) }) });
const decisionSchema = z.object({ revision: z.string(), status: z.literal("approved"), implementationAllowed: z.literal(true), reviewer: z.string().min(1), recordedAtUtc: z.iso.datetime(),
  evidence: z.object({ message: z.string().min(1), context: z.string().min(1) }), approvalRequestSha256: hash, files: z.array(file).min(1) });
const prefix = "docs/content/hero-color-refresh";

// The review is immutable. A separate human decision authorizes its exact bytes.
export async function checkHeroReadiness(root = process.cwd()): Promise<ValidationResult> {
  const diagnostics: Diagnostic[] = [];
  const fail = (record: string, field: string, message: string) => diagnostics.push({ record, field, message });
  const path = (input: string) => {
    const full = resolve(root, input), rel = relative(resolve(root), full);
    if (isAbsolute(input) || rel.startsWith("..") || isAbsolute(rel)) throw new Error("Path escapes repository");
    return full;
  };
  try {
    const decisionResult = decisionSchema.safeParse(JSON.parse(await readFile(path(`${prefix}-approval.json`), "utf8")));
    if (!decisionResult.success) return { valid: false, diagnostics: [{ record: "hero-color-refresh", field: "approval", message: "Exact-hero human implementation approval missing" }] };
    const decision = decisionResult.data;
    const manifest = manifestSchema.parse(JSON.parse(await readFile(path(`${prefix}-manifest.json`), "utf8")));
    const requestBytes = await readFile(path(`${prefix}-approval-request.json`));
    const request = z.object({ revision: z.string(), files: z.array(file) }).parse(JSON.parse(requestBytes.toString()));
    if (decision.revision !== manifest.revision || request.revision !== decision.revision) fail("hero-color-refresh", "revision", "Hero approval revision differs from reviewed content");
    if (digest(requestBytes) !== decision.approvalRequestSha256) fail("hero-color-refresh", "approvalRequestSha256", "Reviewed hero request changed");
    if (JSON.stringify(request.files) !== JSON.stringify(decision.files)) fail("hero-color-refresh", "files", "Decision differs from exact reviewed files");
    const files = new Map(decision.files.map(f => [f.path, f.sha256]));
    for (const suffix of ["manifest.json", "generation.json", "review.html", "review.md", "checks.json"]) {
      if (!files.has(`${prefix}-${suffix}`)) fail("hero-color-refresh", suffix, "Hero evidence not bound to approval");
    }
    for (let offset = 0; offset < decision.files.length; offset += 8) await Promise.all(decision.files.slice(offset, offset + 8).map(async f => {
      try { if (digest(await readFile(path(f.path))) !== f.sha256) fail(f.path, "sha256", "Hero content differs from approved bytes"); }
      catch { fail(f.path, "path", "Approved hero file missing or unreadable"); }
    }));
    const required: Record<string, string[]> = { "hero-left": ["portrait", "narrow"], "hero-left-wide": ["desktop", "tablet"], "hero-right": ["desktop", "narrow"] };
    if (new Set(manifest.assets.map(a => a.id)).size !== 3 || new Set(manifest.assets.map(a => a.slot)).size !== 3) fail("hero-color-refresh", "assets", "Duplicate hero identifiers or slots");
    for (const [slot, names] of Object.entries(required)) {
      const asset = manifest.assets.find(a => a.slot === slot);
      if (!asset || names.some(name => !asset.crops.some(c => c.name === name))) fail(slot, "crops", "Missing responsive hero crop");
    }
    const replaced = manifest.integration.replacements.flatMap(r => r.replacesAssetIds);
    if (replaced.length !== 5 || new Set(replaced).size !== 5 || ["hero-left", "hero-left-wide", "hero-left-tablet", "hero-right", "hero-right-wide"].some(id => !replaced.includes(id))) fail("hero-color-refresh", "replacements", "Incomplete hero mapping");
    for (const replacement of manifest.integration.replacements) if (!manifest.assets.some(a => a.id === replacement.assetId)) fail(replacement.assetId, "replacement", "Unknown replacement asset");
    for (const asset of manifest.assets) {
      if (files.get(asset.originalPath) !== asset.originalSha256) fail(asset.id, "originalSha256", "Hero source missing from approval");
      const original = await sharp(await readFile(path(asset.originalPath))).metadata();
      if (original.width !== asset.width || original.height !== asset.height) fail(asset.id, "dimensions", "Hero source dimensions changed");
      for (const reference of asset.references) if (files.get(reference.path) !== reference.sha256) fail(asset.id, "references", "Hero input reference missing from approval");
      for (const crop of asset.crops) {
        if (files.get(crop.webPath) !== crop.sha256 || crop.src !== crop.webPath.replace(/^public/, "")) fail(asset.id, crop.name, "Hero crop or source URL differs from approval");
        const [w, h] = crop.ratio.split(":").map(Number);
        if (!(w > 0 && h > 0) || crop.width * h !== crop.height * w || crop.sourceRect.width !== crop.width || crop.sourceRect.height !== crop.height || crop.sourceRect.left + crop.width > asset.width || crop.sourceRect.top + crop.height > asset.height) fail(asset.id, crop.name, "Invalid hero crop rectangle or ratio");
        const encoded = await sharp(await readFile(path(crop.webPath))).metadata();
        if (encoded.width !== crop.width || encoded.height !== crop.height || encoded.format !== "webp") fail(asset.id, crop.name, "Hero raster dimensions or format changed");
      }
    }
    const integrationPath = `${prefix}-integration.json`;
    const integrationBytes = await readFile(path(integrationPath));
    const integration = z.object({ revision: z.string(), parentRevision: z.string(), activeAssetIds: z.array(z.string()).length(2), retainedRightAssetId: z.literal("hero-right-clothes-v2"),
      heroActions: z.tuple([z.object({ label: z.literal("Comprar para meninas"), href: z.literal("/meninas") }), z.object({ label: z.literal("Comprar para meninos"), href: z.literal("/meninos") })]) }).parse(JSON.parse(integrationBytes.toString()));
    const integrationResult = decisionSchema.safeParse(JSON.parse(await readFile(path(`${prefix}-integration-approval.json`), "utf8")));
    if (!integrationResult.success) fail("hero-color-refresh", "integrationApproval", "Exact integration human approval missing");
    else {
      const integrationDecision = integrationResult.data;
      if (integration.parentRevision !== manifest.revision || integration.revision !== integrationDecision.revision) fail("hero-color-refresh", "integrationRevision", "Integration acceptance differs from image revision");
      if (digest(integrationBytes) !== integrationDecision.approvalRequestSha256) fail("hero-color-refresh", "integrationSha256", "Accepted hero selection changed");
      const integrationFiles = new Map(integrationDecision.files.map(f => [f.path, f.sha256]));
      if (integrationFiles.get(integrationPath) !== digest(integrationBytes)) fail("hero-color-refresh", "integrationFiles", "Integration selection missing from acceptance");
      for (const f of integrationDecision.files) if (digest(await readFile(path(f.path))) !== f.sha256) fail(f.path, "sha256", "Integration differs from approved bytes");
      const leftAssets = manifest.assets.filter(a => a.slot.startsWith("hero-left"));
      if (new Set(integration.activeAssetIds).size !== 2 || leftAssets.some(a => !integration.activeAssetIds.includes(a.id))) fail("hero-color-refresh", "activeAssetIds", "Integration must retain the two accepted left sources");
      for (const asset of leftAssets) for (const c of asset.crops) if (integrationFiles.get(c.webPath) !== c.sha256) fail(asset.id, c.name, "Active left crop missing from integration acceptance");
      const retained = z.object({ assets: z.array(z.object({ id: z.string(), crops: z.array(z.object({ webPath: z.string(), sha256: hash })) })) }).parse(JSON.parse(await readFile(path("docs/content/homepage-image-refresh-manifest.json"), "utf8")));
      const right = retained.assets.find(a => a.id === integration.retainedRightAssetId);
      if (!right || right.crops.some(c => integrationFiles.get(c.webPath) !== c.sha256)) fail("hero-color-refresh", "retainedRightAssetId", "Restored right hero missing from acceptance");
      for (const required of [`${prefix}-approval.json`, "docs/content/homepage-image-refresh-approval.json"]) if (!integrationFiles.has(required)) fail("hero-color-refresh", "priorAcceptance", "Prior image acceptance missing from integration");
    }
  } catch (error) { fail("hero-color-refresh", "readiness", error instanceof Error ? error.message : "Unreadable hero package"); }
  return { valid: diagnostics.length === 0, diagnostics };
}
