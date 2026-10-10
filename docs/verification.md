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
For that local production browser run, set `SITE_URL=http://127.0.0.1:3100`
before building (`$env:SITE_URL = 'http://127.0.0.1:3100'` in PowerShell).
CI sets the same origin for its build and production test server. This must be
set at build time because prerendered sharing metadata retains that origin.
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
issue #31 adds the public browsing presentation documented below; later slices
complete the shopping interactions.

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

## Responsive catalog slice (issue #31)

The shared storefront now has sticky navigation, click/keyboard category menus,
a compact left Sheet with expandable groups, search/favorites destinations,
a right cart entry Sheet, and the approved shopping/collection/brand footer.
Catalog-backed listings include all 30 products, the approved eight new arrivals,
and girls/boys assortments with suitable-for-both products counted once. Category
links use the existing browsing interface and keep their scope on refresh.

Product cards receive compact presentation records, rather than full content
manifests or garment briefs. They show approved paired photographs, names, BRL
prices and colorway swatches. Pointer hover and keyboard focus reveal isolated
imagery; touch retains model imagery. Preview choices carry to product URLs.
All 30 known product destinations render approved names, prices, descriptions,
composition, fit and selected/default colorways. Product detail shows one large
3:4 photograph with selectable model/isolated thumbnails, keyboard navigation,
pressed-state indication and a polite photo-position announcement. Changing
colorway resets the gallery to its model photograph. Fallback thumbnails stay
disabled until the selected color view hydrates, preventing an early click from
being discarded when Suspense replaces its temporary content. Invalid first color values
use the default. Layout follows the accepted fonts, colors, maximum width and
two/three/four-column thresholds; catalog photographs preserve whole garments,
reserve 3:4 space, use responsive optimized sizes and retain readable fallbacks.

Server Components prerender public copy and catalog content. Focused Suspense
regions resolve query-dependent listings with approved default content in the
static shell. Product pages cache the approved content for each colorway and
select the URL's color in a small client component; the default remains readable
without JavaScript. `ensureStatic = "navigation"` makes Next reject product
changes that require request-time server rendering. Next/React can retain hidden previous route trees and hidden
streamed fragments; browser assertions inspect visible content and accessible
roles. Known products and collections use real `generateStaticParams` values.
The installed Cache Components mode does not support `dynamicParams = false`,
and runtime `notFound()` after streaming returns HTTP 200. `proxy.ts` therefore
checks catalog slugs before rendering and rewrites unknown destinations to the
static `/404` recovery route with HTTP 404. It performs no backend or catalog API
work. Page errors use this installed Next version's `retry` callback and a home
action; error and 404 copy comes from the approved package.

`SITE_URL` explicitly supplies a build's intended origin. Without that override,
preview builds use `VERCEL_URL`, production builds use
`VERCEL_PROJECT_PRODUCTION_URL` (falling back to `VERCEL_URL`), and local development
uses `http://localhost:3000`. Every implemented page has application noindex and
absolute Open Graph/Twitter URLs and approved sharing imagery. Vercel configuration,
public preview and release verification remain later tickets.

The home, collections and brand destinations currently provide readable approved
entry content; issue #34 completes their editorial imagery, crops and page sequences.
Search/favorites/cart entry surfaces intentionally have no personalized counts,
saved-state claims or mutations. Issues #33 and #36–39 finish search, additional
product interactions and shopping interactions. Issue #32 adds filter/sort
controls and browser-history journeys. This slice does not claim those later tickets or the integrated public
browsing checkpoint (#35) are complete.

### Local verification evidence for issue #31

On 2026-10-10 on Windows with Bun 1.4.3:

- Final repository-wide ESLint and generated route types/TypeScript checks passed.
- Content readiness passed with every approved asset and approval hash intact.
- All 41 domain contract tests passed; route generation, TypeScript and the
  production build passed with Cache Components and partial prefetching enabled.
- Production browser coverage comprises 55 cases in Chromium, Firefox, WebKit,
  Pixel 7 Chromium and iPhone 13 WebKit emulation. The full run passed 53 cases;
  two test failures were corrected by inspecting only the visible streamed grid
  and using storefront links instead of interrupting WebKit prefetches with rapid
  full-document navigation. All 10 affected case/profile combinations then passed
  in the final targeted rerun. No application error was suppressed by the tests.
- Browser checks verify approved assortment membership/counts, category scope and
  refresh, 390/768/1024/1440px grids, sticky header, compact destinations,
  keyboard/click menus, Sheet focus return, selected/default colorway detail,
  touch versus pointer/keyboard image behavior, reserved image-failure space,
  real HTTP 404 responses, origin-correct sharing metadata, and readable content
  with JavaScript disabled. Representative axe scans passed on listings, product
  pages, open navigation and open cart surfaces without reported violations.
- Codex inspected Chromium screenshots of desktop/mobile/tablet listings,
  desktop product detail and the compact menu. A separate reduced-motion check
  found no horizontal overflow at 320/390/768/1440px and confirmed two/three/four
  columns and the approved Fraunces heading font. This is browser emulation and
  agent screenshot inspection, not human integration acceptance or actual-device,
  200% browser zoom, NVDA/Chrome or VoiceOver/Safari review.

Reports and traces use the existing ignored `playwright-report/` and
`test-results/` directories. ESLint and TypeScript also exclude those generated
reports (and coverage), so checks remain repeatable after browser failure traces
have been generated. GitHub Actions has the same origin configuration but
has not been run remotely for this branch. No deployment or public preview is
claimed by this slice.

### Product gallery and development warning follow-up

The supplied warning was Next's development-only Instant URL-data diagnostic,
not a page crash. It reproduced on both product and collection detail pages:
their slug was awaited before a Suspense boundary. The documented loading-boundary
fix cleared that diagnostic but hid known prerendered content when JavaScript was
disabled. Both detail route segments now explicitly use `instant = false` to
allow slug resolution and preserve their concrete content. This is an intentional
route-level validation opt-out; validation remains enabled on other routes.
Product pages additionally enforce complete static server output with
`ensureStatic = "navigation"`, cache their approved colorway content, and resolve
color selection in the browser. Collection query results keep their existing
focused Suspense boundary. The header wordmark loads eagerly because it is above
the fold.

On 2026-10-10:

- `bun run test:dev` failed on the exact supplied diagnostic before the change.
  The final sweep passed across all 42 public URLs (30 products, three collection
  details and nine entry/listing pages), plus catalog-to-product, colorway and
  collection link navigation. Neither browser nor server logs contained Instant,
  blocking-prerender or hydration diagnostics. The test blocks optimized image
  requests through CDP, preserving browser caching and Next's validation;
  Playwright request routing would bypass this validation. Production checks
  continue to load real optimized images.
- All 30 affected production browser cases passed across Chromium, Firefox,
  WebKit, Pixel 7 and iPhone 13 emulation. They cover thumbnail selection and
  keyboard operation, colorway reset and URL reload, delayed hydration,
  selected/default colors, metadata/404
  recovery, default product and collection content without JavaScript, and axe
  scans of listings, products, navigation and cart. Accessibility scans wait for
  menu/Sheet opacity to reach its final value, rather than measuring a transition.
- ESLint, all 41 domain tests, content readiness and the final production build
  (including TypeScript) passed. Approved source assets and hashes are intact.
- Desktop/mobile gallery screenshots were inspected. Temporary reproduction
  scaffolding and the supplied `warning.log` were removed. `test:dev` is included
  in both `verify` and the CI workflow; CI has not been run remotely.

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

The first Linux CI run caught checkout normalization of `cast-approval.json`
and the six identity SVGs: their committed LF bytes differed from the approved
CRLF bytes retained on Windows. Git attributes now preserve those exact bytes,
and the approved working-copy files have been restaged verbatim. Approval hashes
and production content remain unchanged. CI's existing readiness checks guard
this cross-platform regression.
