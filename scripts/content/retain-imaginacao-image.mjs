import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Retain an actual tool result and its provenance; no image generation or approval.
const input = JSON.parse(await readFile(process.argv[2], "utf8"));
const path = "docs/content/imaginacao-generation.json";
const generation = JSON.parse(await readFile(path, "utf8"));
const requests = JSON.parse(await readFile("docs/content/imaginacao-requests.json", "utf8")).requests;
for (const entry of input) {
  const request = requests.find((request) => request.id === entry.id);
  if (!request || generation.records.some((record) => record.originalPath === request.originalPath)) {
    throw new Error(`${entry.id}: unknown request or original already retained.`);
  }
  const bytes = await readFile(entry.sourcePath);
  const metadata = await sharp(bytes).metadata();
  if (metadata.width * 4 !== metadata.height * 3 || metadata.width < 1086 || metadata.height < 1448) {
    throw new Error(`${entry.id}: invalid native dimensions.`);
  }
  await copyFile(entry.sourcePath, request.originalPath, constants.COPYFILE_EXCL);
  generation.records.push({
    productId: request.productId, colorwayId: request.colorwayId, collectionId: request.collectionId,
    modelId: request.modelId, photographedSize: request.photographedSize, role: request.role,
    originalPath: request.originalPath, referencePaths: entry.referencePaths ?? request.referencePaths,
    prompt: entry.prompt, alt: request.alt, sourcePath: entry.sourcePath, tool: "built-in image_gen",
    originalSha256: createHash("sha256").update(bytes).digest("hex"),
    width: metadata.width, height: metadata.height, approvalStatus: "pending-human-review",
  });
}
generation.records.sort((a, b) => requests.findIndex((r) => r.originalPath === a.originalPath) - requests.findIndex((r) => r.originalPath === b.originalPath));
await writeFile(path, `${JSON.stringify(generation, null, 2)}\n`);
console.log(`Retained ${input.length} photographs; ${generation.records.length}/28 selected originals exist.`);
