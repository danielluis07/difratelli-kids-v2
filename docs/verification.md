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
| Cart | `lib/cart/index.ts`, `lib/shopping/contracts.ts` | Isolated vanilla Zustand commands, immutable resolved snapshots, tuple/quantity rules and opt-in version-1 persistence with post-mount restoration |
| Favorites | `lib/favorites/index.ts`, `lib/shopping/contracts.ts` | Independent persistent vanilla Zustand store, product membership/count, tolerant restoration and typed outcomes |
| Visit checkout | `lib/checkout/index.ts`, `lib/shopping/contracts.ts` | Approved draft defaults, delivery validation, centavo totals and interface for future visit/completion lifecycle |
| Presentation | `lib/presentation/contracts.ts`, `app/` | Invoke domain interfaces and translate outcomes to approved Portuguese copy; no direct array mutations |

The cart factory supports independent in-memory commands or an injected storage
adapter acquired by its explicit `restore()` command. The shared-layout cart
provider opts into persistence and restores only after mounting; public content
continues rendering while dependent cart controls wait. The independent favorites
provider follows the same mount/restoration boundary. Both stores recover valid
entries and expose visit-only correction/failure feedback. Later shopping slices
implement the shared-layout visit checkout provider, completion and confirmation
lifetime. The public shell uses approved copy, local approved fonts and noindex;
issue #31 adds the public browsing presentation documented below; later slices
complete the shopping interactions.

## Persistent favorites slice (issue #38)

Card and product-detail hearts toggle product membership with labeled controls,
pressed states and a shared polite announcement that survives card removal.
The shared-layout provider restores a separate Zustand store after mount, using
the original pending snapshot for hydration. Pending counts show an ellipsis;
dependent actions and the favorites page wait without displaying false emptiness.
The available detail control also waits for its interactive color view.

`difratelli.favorites` stores `{ version: 1, productIds: [...] }` only. Normal
restoration is idempotent and never writes storage. Favorites do not contain
options or quantities, and commands never alter the independently persisted cart.
The header and compact menu count products. `/favoritos` uses default-colorway
cards, immediate removal with focus on the next remaining control (or the page
content when empty), and the approved Explorar produtos action.

Contract tests cover pending rejection, no initial access/overwrite, membership,
count, normal reload persistence, invalid commands and independence in both
directions. Production browser tests cover card/detail synchronization, option
independence, navigation/reload, keyboard toggles/focus, announcements, pending
server rendering, populated/empty axe scans and responsive grids. Local results
and remaining integration gates are recorded in `docs/reviews/issue-38/review.md`.
The recovery behavior and independent once-only storage warnings are covered by
issue #39 below. Combined shopping integration acceptance remains a separate gate.

## Storage recovery slice (issue #39)

Readable version-1 envelopes recover valid entries individually. Favorites remove
malformed/obsolete IDs and deduplicate products. Cart recovery removes obsolete
products/colorways/sizes without substitution, discards nonpositive/noninteger
quantities, merges duplicate tuples and caps positive integer quantities and sums
at ten. Current catalog prices govern every resolved line and subtotal; valid
saved comparison prices detect changes. Missing/malformed comparison metadata
does not invalidate an otherwise usable selection.

Restoration never writes storage. Corrupt JSON, malformed envelopes, unsupported
versions and failed reads leave saved data untouched and use temporary shopping
with approved feedback. A failed write retains the successful command in memory,
preserves the last saved value and disables further persistence for that store
during the visit. The other store continues restoring/saving independently.
Existing tabs retain their own snapshots; there is no storage-event synchronization.

Snapshots expose restoration/persistence status, correction flags and one warning
reason, none of which enter saved envelopes. The shared layout mounts persistent
polite live regions and dismissible notices using approved copy. Corrections are
combined once per store restoration; routine commands, client navigation and
Sheet reopening do not repeat dismissed notices. A first write failure inside the
modal cart is also included in its action announcement because the modal hides
the page's live regions. Personalized actions/counts retain their neutral pending
state while public content renders; no initial empty state overwrites saved data.

`tests/contracts/recovery.test.ts` covers recovery, envelope preservation, independent
failures, command outcomes and last-successful saves. `tests/browser/recovery.spec.ts`
covers production-browser recovery/feedback, corrupt/unsupported data, independent
read/write failures, modal feedback, delayed hydration without a false empty flash
or storage overwrite, and tab independence. Local evidence is recorded in
`docs/reviews/issue-39/review.md`.

## Persistent cart slice (issue #37)

Product detail now invokes cart commands with the selected product/colorway/size.
Missing-size submission announces the approved copy and focuses the first size
control. Successful additions announce briefly without opening the cart. Identical
selections merge to ten; different colors or sizes remain separate. The right
Sheet shows approved selected imagery/options, current catalog unit/line prices,
quantity controls, immediate removal, subtotal and the `/checkout` action.
Checkout itself belongs to its later delivery slice; this action currently targets
that reserved route. The header badge counts units, using a neutral ellipsis
during restoration. Empty carts offer the approved catalog exploration action.

`difratelli.cart` stores `{ version: 1, lines: [...] }`, with stable product and
colorway IDs, size, quantity and last-seen unit price only. Restoration does not
write storage and is idempotent; pending commands reject without changing state.
Current catalog prices always govern resolved totals. Normal carts survive reload
and client navigation. The defensive temporary fallback preserves unreadable
data; partial recovery, obsolete-entry correction and once-only failure/price
notices are implemented by issue #39 above. Cart state remains independent of
favorites and public rendering. Combined shopping acceptance remains separate.

The new command contracts cover restoration gates, absence of initial writes,
the version-1 envelope, normal resume, current-price totals and invalid commands.
Browser contracts cover missing-size focus, add feedback, tuple merge/limits,
distinct lines, counts/totals, decrement limits, removal, empty exploration,
reload/navigation, prerendered pending controls, Sheet width/focus and axe scans.
Local verification and responsive captures are recorded in
[`reviews/issue-37/review.md`](reviews/issue-37/review.md). Integration and release
approval remain separate from these implementation checks.

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

## Shareable listing controls (issue #32)

Listings expose category, size, color-family and collection filters; collection
routes omit the redundant collection control, and audience controls appear only
on catalog/search routes. Desktop uses category-specific popovers; mobile/tablet
uses a scrollable filter Sheet. Both presentations commit changes immediately
through the existing browsing/URL interface. Sorting offers curated order and
both price directions. Local optimistic selection feedback accompanies router
navigation; the committed server results and restored selections come from the URL.
Controls are disabled until hydration makes their handlers available; the public
heading, count and product results remain readable during that interval.

Incoming links are interpreted without replacement. User changes serialize valid
unique values canonically and push history entries without scrolling the page.
Reset clears filters/sort while retaining the route and normalized search query.
Filtered empty states provide that same reset action. The search route reuses the
listing so shared search links can expose all applicable controls; blank and
unmatched-query states use approved search copy. Search entry/submission is
covered by issue #33 below.

`tests/browser/browsing.spec.ts` covers repeated/invalid incoming parameters,
canonical changes, reload/Back/Forward, each filter dimension, keyboard selection,
price sorting and curated ties, zero-result scoped resets, fresh shopping
navigation, irrelevant control omission, tablet/desktop continuity, axe and
overlay focus return. These cases run against the production build in all five
configured browser/viewport profiles. A delayed-JavaScript case also verifies
that controls enable after hydration and then accept keyboard input. The browsing
contract suite additionally checks repeated sizes/families/collections/audiences,
malformed numbers/encoding,
first scalars, colorway matching and scoped reset assortments. Existing catalog
tests retain category-link navigation and default assortment checks.

Local Windows verification on 2026-10-10 passed ESLint, Next route generation and
TypeScript, approved content readiness, all 44 Vitest contract tests, and the
production build. With `SITE_URL=http://127.0.0.1:3100` set before building,
`bun run test:e2e -- --workers=2 --timeout=60000` passed all 100 production browser
cases across Chromium, Firefox, WebKit, Pixel 7 and iPhone 13 emulation. The
60-second per-test allowance accommodates the local Windows WebKit runtime;
it changes no assertions. Desktop popover and mobile Sheet screenshots were
inspected locally. `bun run test:dev` also passed its public-route and client
navigation diagnostic scan with no blocking URL-data or hydration diagnostics.
This evidence is for the local working tree; it does not claim
remote CI, actual-device review, human integration acceptance or publication.

## Header catalog search (issue #33)

Desktop search and the compact menu open a labeled search Sheet with the approved
Portuguese copy. Opening on `/busca` reads the first committed `q` value; other
routes start blank. Closing or Escape discards the draft, returns focus to the
trigger and preserves the page URL. Compact search nests within navigation;
submission closes both surfaces. URL-dependent form content has a focused
Suspense boundary, preserving the public header's prerendered navigation.

Enter and the search button normalize whitespace while preserving spelling and
submit a new `/busca` URL containing only the query. Existing listing controls,
counts and sorting apply to results; reset retains the query. Blank searches
show the approved prompt, and unmatched searches offer the catalog. No query is
stored and no autocomplete is provided. The input remounts when its committed
route/query changes, preventing a previous query from surviving navigation.

`tests/browser/search.spec.ts` checks submissions, cross-field matching, spelling,
reload/Back/Forward, current-query reopening, cancellation and focus return,
fresh search sorting reset, query-preserving filter reset, blank/unmatched
recovery and representative axe scans. The browsing contract suite covers
whitespace, reserved-character URL round trips, case/accent-insensitive partial
words and collection/category matching. The development diagnostic sweep also
opens and submits search during client navigation.

Local Windows verification on 2026-10-11 passed ESLint, generated route types and
TypeScript, approved content readiness, all 45 Vitest contracts and the production
build. The full production run passed 114 of 115 cases; one existing Firefox
history case reached its 60-second timeout while the development scan ran
concurrently. After the final 48px search-input height adjustment and rebuild,
all 20 search/history cases passed across the five configured profiles, including
that Firefox case. Search-panel and no-match axe scans reported no violations.
`bun run test:dev` passed the public-route scan and client search submission with
no blocking URL-data or hydration diagnostics. Desktop and 390px mobile search
screenshots were inspected locally with no horizontal overflow. Reports remain
in the ignored Playwright output directories. Next.js feedback review found no
qualifying framework issue in this slice. This is local agent evidence; remote
CI, actual-device/manual review, human integration acceptance and publication
remain unclaimed.

## Public-browsing checkpoint (issue #35)

The [integrated review packet](public-browsing-review.md) binds the reviewed
source commit and original verification patch to retained browser summaries,
responsive captures, axe observations and reproduction commands. It adds
exhaustive product/colorway and listing-history browser journeys and fixes
keyboard skip navigation hidden by the sticky header. Human checkpoint acceptance
remains pending; the packet documents unavailable manual coverage and concurrent
WebKit timing failures separately from successful isolated reruns. Shopping
implementation must wait for the owner's explicit acceptance of that candidate.
