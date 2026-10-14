import { test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

test("shopping checkpoint: production responsive state captures", async ({ baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The capture script owns one Chromium browser with three viewport contexts.");
  test.setTimeout(300_000);
  if (baseURL !== "http://127.0.0.1:3100") throw new Error("The capture script requires the checkpoint production origin.");
  const script = pathToFileURL(resolve("scripts/verification/capture-shopping-checkpoint.mjs")).href;
  await import(script);
});
