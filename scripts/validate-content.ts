import { checkContentReadiness } from "../lib/catalog/readiness";

const result = await checkContentReadiness();
for (const { record, field, message } of result.diagnostics) console.error(`${record}.${field}: ${message}`);
if (!result.valid) process.exitCode = 1;
else console.log("Approved content ready: catalog, editorial, identity, homepage imagery/copy and accepted Unsplash refresh. File bytes and human approval evidence verified.");
