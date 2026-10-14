# Public browsing checkpoint — issue #35

Status: agent review complete; human acceptance pending. Product/cart/
favorites implementation must not advance until the owner accepts this checkpoint.

The local preview is stopped at the owner's request. To inspect the storefront,
run `bun run dev` and open `http://localhost:3000`. Production verification used
the separately built candidate on port 3100 under Playwright's managed server
lifecycle. No public deployment or release approval is claimed.

## Reviewed revision and scope

The reviewed application source revision is
`7daa98573b452fa3e3361b7305bedcde43109a94` ([source](https://github.com/danielluis07/difratelli-kids-v2/tree/7daa98573b452fa3e3361b7305bedcde43109a94)).
The PR adds a subsequent documentation/evidence commit without changing that
application source. Its verification was originally recorded against baseline
`4905b6ce4881e4219eb446b0859ecadae0973542` ([source](https://github.com/danielluis07/difratelli-kids-v2/tree/4905b6ce4881e4219eb446b0859ecadae0973542))
plus the retained [application patch](reviews/issue-35/application.patch), whose
SHA-256 is `bd9ddffb22322935e49720902739ccce2ae8dd7358ff5370c02086bd456e14ef`.
The patch adds a 104px scroll margin to the main-content anchor so keyboard skip
navigation leaves content below the sticky header. The complete working-copy
`app/globals.css` SHA-256 is
`c154d0401f6273d102f31f0aba5d11d53e7033f75426c7d930f46980e7ed82a7`.
No other application code, approved content, imagery or dependencies change.
The source revision commits the same verified CSS change, checkpoint tests and
reusable capture/retry scripts. Source fingerprints in the evidence manifest
normalize CRLF to LF; the original Windows CSS fingerprint is retained separately.
Evidence bytes remain exact across checkouts through `.gitattributes`. Any further
application change requires refreshed evidence and a new candidate identity.

Authority: [issue #35](https://github.com/danielluis07/difratelli-kids-v2/issues/35),
[parent specification #22](https://github.com/danielluis07/difratelli-kids-v2/issues/22),
and the accepted handoff revision
`de86d01b70030b1b3f6f8a6873c0e6c66b44a3e3`. The later approved
[homepage revision](content/homepage-implementation.md),
[ADR 0001](adr/0001-full-bleed-editorial-storefront.md), and
[polo assortment revision](content/polo-review.md) supersede the earlier
homepage presentation and category allocations. Their content approvals are
distinct from this integration acceptance.

Review covers the homepage, catalog, new arrivals, both audience listings,
search, collection index, all three collection pages, brand page, and all
30 readable product destinations with all 42 offered colorways. Favorites and
the cart entry are inspected as existing navigation surfaces; persistence,
size selection, add-to-cart, favorites mutations, full gallery interactions and
checkout belong to subsequent tickets. `/checkout` is not implemented or linked
at this checkpoint and is not claimed as a working shopping destination.

## Reproduce

From the repository root in PowerShell:

```powershell
bun install --frozen-lockfile
bunx playwright install chromium firefox webkit
bun run lint
bun run typecheck
bun run validate:content
bun run test:unit
$env:SITE_URL = 'http://127.0.0.1:3100'
bun run build
bunx playwright test --workers=2 --timeout=60000
bun run test:dev
```

Run production and development suites sequentially. Production tests start their
own server and use the build-time origin for metadata. The checkpoint route
matrix has its own five-minute allowance for 48 image-loaded captures/axe scans;
the exhaustive product check allows three minutes for 42 colorway views per
browser profile. These allowances introduce no UI delays.

To inspect the production application or reproduce the synthetic retry exercise,
after Playwright releases port 3100:

```powershell
$env:SITE_URL = 'http://127.0.0.1:3100'
bun run start --hostname 127.0.0.1 --port 3100
```

In another terminal:

```powershell
bun scripts/verification/review-public-retry.mjs
bun scripts/verification/capture-public-products.mjs
```

The retry script changes one intercepted `/sobre` HTML/Flight response into a
synthetic server-page error. Subsequent responses remain intact. It inspects the
real production error boundary, homepage recovery link, desktop axe result,
mobile layout, and keyboard retry into the healthy brand page. The injection
depends on the installed Next.js 16.4 response format; it fails explicitly if it
cannot find the intended payload. It introduces no application fault endpoint,
backend, or component-test seam. An expected browser error from this injected
response is part of the exercise, not an observed application crash.

## Route and state coverage

| Destination/state | Evidence |
| --- | --- |
| `/` | Approved nine-section sequence; static equal split from 1024px, approved left crops below 1024px; five widths through 1920px; hero/category/product/collection links; keyboard carousels and look tabs; announcement pause/reduced motion |
| `/produtos`, `/novidades`, `/meninas`, `/meninos` | Exact 30/8/18/18 product membership, no duplicates, two/three/four columns, scoped category links, all filter dimensions, OR/AND, sorting and ties |
| `/colecoes` and each `/colecoes/[slug]` | Three real destinations, approved stories/photography, ten products per collection, scoped filter reset and sorting |
| `/sobre` | Approved opening and two brand sections, photography and motifs; synthetic error/retry recovery |
| `/busca` and query URLs | Blank prompt, normalized every-word case/accent-insensitive search, results/counts, no-match recovery, query-preserving reset, fresh-search reset, cancel/focus return |
| All 30 `/produto/[slug]`, all 42 colorways | HTTP 200, approved names/prices/descriptions/composition/fit, selected color name/link state and model alt text; no uncaught page errors; card preview carried into detail |
| History/refresh | Filter/sort/search push entries, product color replaces entry, return to exact filtered/sorted listing, Back/Forward and reload restore committed state |
| Unknown routes/products/collections | Real HTTP 404 and working catalog recovery |
| Image failures | Reserved catalog ratio and editorial space, readable Portuguese fallbacks |
| Pending hydration | Public content readable; filter/sort/gallery controls gated until functional |
| Navigation/search/filter/cart overlays | Keyboard operation, visible controls, focus return and representative axe scans |
| `/favoritos`, cart entry | Existing entry surfaces only; no personalized state or shopping completion claimed |

Sources: [checkpoint suite](../tests/browser/checkpoint.spec.ts),
[catalog suite](../tests/browser/catalog.spec.ts),
[browsing suite](../tests/browser/browsing.spec.ts),
[search suite](../tests/browser/search.spec.ts),
[editorial suite](../tests/browser/editorial.spec.ts),
[foundation suite](../tests/browser/foundation.spec.ts),
[development diagnostics](../tests/development/navigation.spec.ts), and
[focused contracts](../tests/contracts/).

The checkpoint capture matrix uses desktop Chromium at 390/768/1440 CSS pixels
for 16 destinations/states. Screenshot preparation explicitly loads clipped
carousel images; natural lazy loading is retained by the application. Product
and history checks run in all five profiles. Representative editorial checks
also cover 1024/1920px, reduced motion and enlarged text at a 720px CSS viewport.
This zoom approximation is not an actual browser-toolbar 200% zoom check.

## Evidence and conditions

Local run date: 2026-10-13. Reviewer: Codex. OS: Windows 11, build 10.0.26300.
Runtime: Bun 1.4.3. Framework: Next.js 16.4.0 / React 19.3.0.
Corrected production build ID: `liRl_LbdrXlnhay4FiDxW`.
Profiles: desktop Chromium/Firefox/WebKit, Pixel 7 Chromium emulation and
iPhone 13 WebKit emulation. None is evidence of a physical mobile device or
Apple Safari on macOS/iOS.

| Check | Outcome |
| --- | --- |
| ESLint, generated route types/TypeScript | Passed |
| Content readiness/approved byte hashes | Passed |
| Focused Vitest contracts | 47 passed |
| Production build | Passed, 48 static outputs generated |
| Production browser matrix | All 173 applicable cases verified across the baseline and affected reruns; seven intentional profile skips. Not a single clean full run; details below |
| Loaded responsive route captures/axe matrix | Passed: 48 observations, zero reported WCAG A/AA axe violations |
| Synthetic production retry | Passed: desktop axe zero violations, mobile no horizontal overflow, keyboard retry recovered brand page |
| Development diagnostics | Passed against the existing local development server: no blocking URL-data/hydration diagnostics across public routes and client navigation |
| Agent visual inspection | Passed for all 16 mobile route/state captures and representative desktop/tablet editorial/product captures; no major layout/crop defect observed |
| Actual devices, NVDA/Chrome, VoiceOver/Safari | Not checked; equipment/session unavailable |
| Browser-toolbar 200% zoom, real-phone slow connection/performance | Not checked; emulation/text enlargement is separate evidence |
| Remote GitHub Actions, public preview, release/production smoke checks | Not performed by this checkpoint |

Generated browser reports, traces, attachments and original captures are under
the ignored `playwright-report/` and `test-results/` directories. The regular CI
workflow uploads them under its candidate commit when run; no remote CI run is
claimed here. Retained evidence: [48 route observations](reviews/issue-35/route-matrix.json),
[successful capture run](reviews/issue-35/route-run.json),
[retry result](reviews/issue-35/retry-results.json),
[retry axe result](reviews/issue-35/retry-axe.json), and
[evidence file hashes](reviews/issue-35/evidence-files.json).

The [case coverage index](reviews/issue-35/case-coverage.json) maps the latest
recorded result for each browser case to its retained run summary. The baseline
full run had 164 passes, seven intentional skips and four failures. After the
capture correction, linked product journey and CSS fix, the affected 25-case
run had 19 passes, four intentional skips and two timing failures. The two
earlier WebKit history cases then passed all three single-worker repetitions
([six passes](reviews/issue-35/isolated-url-run.json)); the affected
[WebKit product journey](reviews/issue-35/isolated-products-run.json) and
[mobile WebKit homepage](reviews/issue-35/isolated-homepage-run.json) each passed
unchanged in isolation. Retain both [baseline](reviews/issue-35/baseline-run.json)
and [refreshed](reviews/issue-35/refreshed-run.json) summaries; do not present these
results as a clean full-matrix run. Assertions and existing timing windows were
not relaxed, and page errors were not suppressed.

The initial full run verifies unchanged browsing contracts. The rebuilt candidate
refreshes the affected keyboard/layout/hero/route-capture evidence in all five
profiles and the product journey after its navigation correction. The separate
[development record](reviews/issue-35/development-run.json) documents reuse of the
owner's already running development server; the default development command
initially refused to start a second instance. The separate
[manual production artifact run](reviews/issue-35/manual-run.json) refreshed retry,
product and keyboard captures under a Playwright-managed production server.

Temporary harnesses and server-override configs referenced by the historical
run records have been removed. Reproduce development diagnostics with
`bun run test:dev` when no other Next development instance is running, and
reproduce manual production captures with the two retained scripts above.
The selected screenshots and run summaries remain; the redundant full-DOM
failure snapshot was removed while retaining the before-fix image and measured
failure outcome.

Representative original captures:

- Homepage: [mobile](reviews/issue-35/homepage-mobile.png),
  [tablet](reviews/issue-35/homepage-tablet.png),
  [desktop](reviews/issue-35/homepage-desktop.png).
- Editorial: [collection mobile](reviews/issue-35/collection-mobile.png),
  [brand desktop](reviews/issue-35/brand-desktop.png).
- Product: [mobile](reviews/issue-35/product-390.png),
  [desktop](reviews/issue-35/product-1440.png).
- Recovery: [unmatched search](reviews/issue-35/search-empty-mobile.png),
  [retry desktop](reviews/issue-35/retry.png),
  [retry mobile](reviews/issue-35/retry-mobile.png).
- Keyboard fix: [before](reviews/issue-35/skip-link-before.png),
  [after mobile](reviews/issue-35/skip-link-after-390.png),
  [after tablet](reviews/issue-35/skip-link-after-768.png),
  [after desktop](reviews/issue-35/skip-link-after-1440.png), and
  [measured heading/header bounds](reviews/issue-35/skip-link-results.json).

The `screenshot` fields in the route JSON identify the complete generated matrix
in Playwright's output directory, rather than implying all 48 PNGs are retained
in this document's folder. The selected originals above are retained separately.

## Defects and acceptance

The keyboard review found an application accessibility blocker: the skip link
positioned the listing heading 40/56/64px from the viewport top at
390/768/1440px, behind the sticky header ending at 89px. The retained CSS patch
gives the main anchor a 104px scroll margin. The new regression exercises real
keyboard skip-link activation and subsequent tab navigation at all three widths.
The regression failed on the original production build with 49px overlap, then
passed on the corrected build in all five profiles at all three widths, including
subsequent tab navigation into the main content. No application blocker remains
reproducible in the recorded checks.

The initial capture assertion included off-screen carousel images that browser
lazy loading correctly leaves unloaded. Capture preparation now explicitly loads
those assets; application behavior and approval-bound files are unchanged. This
was an evidence defect, not an application blocker. The corrected matrix passed
all 48 observations in a targeted run against the same production build.

The initial mobile WebKit product scan reported a same-origin prefetch error
while successive full-document navigations interrupted prefetches. The scan now
follows actual catalog/product links throughout and retains its page-error
assertion. All 30 products and 42 colorways passed that linked journey in every
profile across the refreshed and isolated runs.

WebKit timing failures occurred under concurrent browser work: two URL assertions
in the baseline, one product-heading assertion and one 90-second multi-width
homepage artifact run in the refresh. None reproduced in the recorded isolated
runs. Their cause is unconfirmed; serial verification is evidence, not an
application navigation fix. Failure traces remain under the original and
`refreshed` Playwright output directories. A clean future full-matrix/CI run and
real-device visible-performance review remain useful follow-up conditions. Do
not silently treat these failures as passed or infer production readiness from
the isolated results.

No human checkpoint acceptance has been recorded. The owner must review the
specified application SHA and evidence, resolve defects, and explicitly accept
any proposed coverage gaps separately from integration acceptance. Unavailable
checks remain not checked until performed or explicitly accepted; automated
passes and agent inspection do not create approval.

The required gate comes from [implementation plan](implementation-plan.md),
"Obtain checkpoint acceptance before advancing to the next implementation
stage," and issue #35's requirement to record explicit human acceptance tied to
the reviewed revision. This is independent of publication/hosting approvals.

Suggested acceptance record, only after the owner's decision:

> I accept the public-browsing checkpoint for application source revision
> 7daa98573b452fa3e3361b7305bedcde43109a94,
> reviewed with the issue #35 packet.
> Coverage gaps/conditions accepted: [explicit list, or none].
> Remaining defects/required follow-up: [explicit list, or none].

Until that decision exists, leave issue #35 open and do not advance shopping
implementation. Do not infer release approval from checkpoint acceptance.
