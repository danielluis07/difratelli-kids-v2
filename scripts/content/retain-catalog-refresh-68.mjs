import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { revision, reviewRoot } from "./catalog-refresh-68-spec.mjs";

const [index, sourcePath, rejectionReason] = process.argv.slice(2);
assert(sourcePath, "Pass request index, exact tool output path, and optional rejection reason");
const requests = JSON.parse(await readFile(`${reviewRoot}/requests.json`, "utf8"));
const record = requests.records[Number(index)];
assert(record);
let generation;
try { generation = JSON.parse(await readFile(`${reviewRoot}/generation.json`, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; generation = { revision, tool: "built-in image_gen", status: "pending-human-review", records: [], rejectedAttempts: [] }; }
assert(!generation.records.some(r => r.originalPath === record.originalPath), "Never overwrite retained selected output");
const retainedPath = rejectionReason ? `assets/originals/catalog-refresh-68/rejected/${record.productId}-${record.colorwayId}-${record.role}-attempt-${generation.rejectedAttempts.length + 1}.png` : record.originalPath;
await mkdir(dirname(retainedPath), { recursive: true });
await copyFile(sourcePath, retainedPath);
const bytes = await readFile(retainedPath), meta = await sharp(bytes).metadata();
const output = { ...record, sourcePath: resolve(sourcePath), originalPath: retainedPath,
  originalSha256: createHash("sha256").update(bytes).digest("hex"), nativeWidth: meta.width, nativeHeight: meta.height,
  recordedAtUtc: new Date().toISOString(), ...(rejectionReason ? { status: "rejected", rejectionReason } : {}) };
if (rejectionReason) generation.rejectedAttempts.push(output); else generation.records.push(output);
await writeFile(`${reviewRoot}/generation.json`, `${JSON.stringify(generation, null, 2)}\n`);
console.log(JSON.stringify({ retainedPath, width: meta.width, height: meta.height, sha256: output.originalSha256, rejectionReason }));
