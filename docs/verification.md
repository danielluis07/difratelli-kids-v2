# Verification foundations (issue #30)

The complete package is approved in `docs/content/package-approval.json`.
That separate approval binds the package manifest, review and approval-request
bytes; the manifest retains its original pending-review status as historical
review evidence. Do not regenerate or edit approved production inputs.

## Run locally

Install with `bun install --frozen-lockfile`, then install browser binaries with
`bunx playwright install chromium firefox webkit`. On Linux, include `--with-deps`.
Run `bun run verify` for lint, generated route types and TypeScript, content
readiness, focused module tests, production build and production browser tests.
`bun run test:e2e` requires a completed `bun run build`. Playwright starts its own
Bun production server on port 3100 and refuses to reuse an unrelated server.

Next.js configuration runs readiness before dev, type generation, build and
start, including direct Next CLI invocation. Missing approval, invalid required
records, changed approved bytes, missing files or invalid raster metadata fail
with record-and-field diagnostics. This check never generates assets or alters
approval files. The accepted native-resolution exceptions are restricted by
the exact approved package hashes; they do not approve future smaller images.
The revised polo category and collection pattern allocations follow issue #51.
Printed coordinating separates exclude the approved standalone dresses and
two-piece matching sets, whose approved records have no coordinating IDs.

## Logical interfaces

| Boundary | Entry point | Current responsibility |
| --- | --- | --- |
| Catalog/content | `lib/catalog/index.ts`, `validation.ts`, `content-validation.ts`, `readiness.ts` | Deep readonly approved records, explicit found/missing lookups, ordered photograph pairs, curated selections, BRL formatting, structural and file/approval validation |
| Browsing/URL | `lib/browsing/index.ts` | Framework-independent scopes, parsing/canonical serialization, reset, every-word search, filter OR/AND and curated price ties |
| Cart | `lib/cart/index.ts`, `lib/shopping/contracts.ts` | Isolated vanilla Zustand command core, resolved immutable snapshots, typed outcomes, tuple merging and quantity limits |
| Favorites | `lib/favorites/index.ts`, `lib/shopping/contracts.ts` | Independent vanilla Zustand command core, product membership and typed outcomes |
| Visit checkout | `lib/checkout/index.ts`, `lib/shopping/contracts.ts` | Approved draft defaults, delivery validation, centavo totals and interface for future visit/completion lifecycle |
| Presentation | `lib/presentation/contracts.ts`, `app/` | Invoke domain interfaces and translate outcomes to approved Portuguese copy; no direct array mutations |

The store factories are explicitly temporary, in-memory command cores. They
do not read or write browser storage and are not connected to public controls.
Later shopping slices must add separate version-1 cart/favorites persistence,
post-mount restoration gates, tolerant recovery and once-only warnings, then
implement the shared-layout visit checkout provider, completion and confirmation
lifetime. The public shell uses approved copy, local approved fonts and noindex;
the storefront layout and interactive journeys remain subsequent slices.

## Testing seams and CI

Vitest tests only the agreed domain interfaces, including representative invalid
records and an isolated failing readiness fixture. No React component test seam
or private helper seam is introduced. Browser tests exercise production-rendered
copy, metadata, language, page errors, axe accessibility, approved identity and
Next image optimization in Chromium, Firefox, WebKit, Pixel and iPhone viewports.
These are foundation smoke checks, not evidence that the full shopping flow is
implemented or approved. Mobile profiles are emulation, not actual devices.

`.github/workflows/verify.yml` installs the frozen Bun lockfile and browser/system
dependencies and executes every required stage. Browser reports, failure traces
and screenshots are uploaded under the candidate commit SHA. Running the workflow
does not deploy the site. Later slices extend the browser-visible journeys and
domain contract tests without changing the accepted testing seams. Integration,
manual/actual-device review, preview approval and release approval remain separate.

## Installed framework guidance read before changes

Under `node_modules/next/dist/docs/01-app/`:

- `01-getting-started/05-server-and-client-components.md`
- `01-getting-started/08-caching.md` (Cache Components/prerendering/Suspense)
- `01-getting-started/04-linking-and-navigating.md` (including native history)
- `03-api-reference/04-functions/use-search-params.md`
- `03-api-reference/04-functions/generate-static-params.md`
- `01-getting-started/12-images.md` and `03-api-reference/02-components/image.md`
- `01-getting-started/14-metadata-and-og-images.md`
- `03-api-reference/02-components/font.md`
- `02-guides/testing/vitest.md` and `02-guides/testing/playwright.md`

Cache Components and partial prefetching remain enabled. Public copy is synchronous
server-rendered content; no unnecessary request-time APIs or browser stores enter
server rendering. Later URL-dependent client regions must have focused Suspense
boundaries. Known product/collection routes need `generateStaticParams` with real
catalog values. Image `priority` is deprecated; use current loading/preload guidance.
Async Server Components are verified in the browser, not Vitest.

## Local verification evidence

On 2026-10-10, `bun run verify` completed successfully on Windows:

- ESLint, Next route type generation and TypeScript passed.
- Complete content readiness passed, including approved file hashes and decoded
  raster metadata. The isolated invalid fixture failed as expected.
- All 41 Vitest contract tests passed.
- Next.js 16.4.0 production build passed with Cache Components and partial
  prefetching enabled; `/` and the framework not-found page were prerendered.
- All 10 Playwright production smoke tests passed across the five configured
  browser/viewport profiles, including axe with no reported violations on the
  current public shell and successful Next image optimization.

Installed tooling: Zustand 5.0.15, Zod 4.6.5, Vitest 5.0.3, Playwright 1.64.0,
axe Playwright integration 4.13.0 and Sharp 0.35.5. The local Bun executable reported
1.4.3 at final verification; the repository package-manager declaration and CI
are now aligned on Bun 1.4.3 following the user's global runtime upgrade. The
`@types/bun` dependency remains at `^1.4.2` (locked to 1.4.2), because 1.4.3 types
were not available in the registry. After aligning the runtime pins, frozen
installation, TypeScript and all 41 contract tests passed again. The GitHub
Actions workflow has been configured but
has not been run remotely for these uncommitted changes. No public preview,
actual-device/manual review, integration acceptance or deployment is claimed.
