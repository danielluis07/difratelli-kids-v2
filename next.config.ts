import type { NextConfig } from "next";
import { checkContentReadiness } from "./lib/catalog/readiness";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default async function configuration(): Promise<NextConfig> {
  const result = await checkContentReadiness();
  if (!result.valid) throw new Error(result.diagnostics.map(({ record, field, message }) => `${record}.${field}: ${message}`).join("\n"));
  return nextConfig;
}
