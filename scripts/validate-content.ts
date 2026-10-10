import { checkContentReadiness } from "../lib/catalog/readiness";

const result = await checkContentReadiness();
for (const { record, field, message } of result.diagnostics) console.error(`${record}.${field}: ${message}`);
if (!result.valid) process.exitCode = 1;
else console.log("Approved content ready: 30 products, 42 colorways, 84 catalog photographs, 8 editorial scenes, 6 SVG assets. File bytes and approval evidence verified.");
