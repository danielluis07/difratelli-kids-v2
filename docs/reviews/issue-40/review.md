# Integrated shopping checkpoint — issue #40

Status: agent shopping/visual/development review complete;
human product/cart/favorites acceptance pending.
Checkout implementation remains gated by the owner's explicit decision.

## Exact revision and review scope

Application source: `7e1c9545d205aee3a170f2932bf43c7844c4a52b`, committed locally
on `review/issue-40-shopping-checkpoint`. This source commit is not published to
GitHub and has no public preview. Inspect it with `git show 7e1c954`.
Production build ID: `MsPg9uwZRSpYcyB4gYmzE`. Build and production server use
`SITE_URL=http://127.0.0.1:3100`. This packet adds verification and evidence;
the sole application change is thumbnail fallback wrapping in `app/globals.css`.
Approved content, assets, store modules and dependencies are unchanged.
Any application change requires a new revision and refreshed affected evidence.

Authority: [issue #40](https://github.com/danielluis07/difratelli-kids-v2/issues/40),
[parent specification #22](https://github.com/danielluis07/difratelli-kids-v2/issues/22),
and the accepted handoff revision `de86d01b70030b1b3f6f8a6873c0e6c66b44a3e3`.
Later approved homepage and polo revisions remain authoritative, as recorded in
[homepage implementation](../../content/homepage-implementation.md),
[ADR 0001](../../adr/0001-full-bleed-editorial-storefront.md), and
[polo review](../../content/polo-review.md).
Earlier slice records for [product](../issue-36/review.md),
[cart](../issue-37/review.md), [favorites](../issue-38/review.md), and
[recovery](../issue-39/review.md) explain implementation decisions; their passing
runs do not substitute for this revision's refreshed integration evidence.

The continuous journey starts in the catalog, selects a card color preview,
saves the product, follows the selected color into detail, checks missing-size
focus and both dialogs, changes gallery photo, adds and merges a selected tuple,
adds a distinct size, edits quantity in the Sheet, navigates to favorites,
reloads both stores, removes the favorite independently, removes cart lines,
and verifies persistent empty states. The cart's checkout link points to
`/checkout`; the checkout route is a later implementation stage and is not a
working purchase destination at this checkpoint.

## Evidence and reproduction

- [Production browser run](production-run.json): 135 passed / 5 failed in 13.1 minutes.
- [Unchanged isolated rerun](production-rerun.json): all five previously failed cases passed with one worker in 1.2 minutes.
- [Affected final-candidate run](affected-run.json): the extended failed-image/thumbnail case passed in all five profiles in 27.1 seconds.
- [Case coverage index](case-coverage.json) and [evidence/source hashes](evidence-files.json).
- [Focused/build check record](checks.json) and [development diagnostics](development-run.json).
- [Production capture run](capture-run.json).
- [Capture gallery](gallery.html) and [structured visual observations](visual-observations.json).
- Continuous [shopping journey](../../../tests/browser/shopping-checkpoint.spec.ts).
- Existing [product](../../../tests/browser/product.spec.ts), [cart](../../../tests/browser/cart.spec.ts),
  [favorites](../../../tests/browser/favorites.spec.ts), and [recovery](../../../tests/browser/recovery.spec.ts) suites.
- Focused [module contracts](../../../tests/contracts/).
- Reusable [capture script](../../../scripts/verification/capture-shopping-checkpoint.mjs).

Run from the repository root in PowerShell:

```powershell
bun install --frozen-lockfile
bunx playwright install chromium firefox webkit
bun run lint
bun run typecheck
bun run validate:content
bun run test:unit
$env:SITE_URL = 'http://127.0.0.1:3100'
bun run build
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'docs/reviews/issue-40/production-run.json'
bunx playwright test tests/browser/shopping-checkpoint.spec.ts tests/browser/product.spec.ts tests/browser/cart.spec.ts tests/browser/favorites.spec.ts tests/browser/recovery.spec.ts --workers=2 --timeout=60000 --reporter=list,json,html
# Retain the first run before rerunning failures; the report above is immutable
# evidence of its initial result. The five original failure traces are retained
# in this packet's failures/ directory.
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'docs/reviews/issue-40/production-rerun.json'
bunx playwright test tests/browser/shopping-checkpoint.spec.ts tests/browser/product.spec.ts tests/browser/cart.spec.ts tests/browser/favorites.spec.ts tests/browser/recovery.spec.ts --last-failed --workers=1 --timeout=60000 --reporter=list,json,html
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'docs/reviews/issue-40/capture-run.json'
bunx playwright test tests/browser/shopping-captures.spec.ts --project=chromium --workers=1 --reporter=list,json --output=test-results/issue-40-captures
```

Each production run owns and stops its server. Run development diagnostics separately:

```powershell
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = 'docs/reviews/issue-40/development-run.json'
bunx playwright test --config playwright.dev.config.ts --reporter=list,json
bun scripts/verification/record-shopping-checkpoint.mjs
```

Existing responsive tests refresh their issue #38/#39 captures in place.
The new capture script writes this checkpoint's own evidence. Original Playwright
reports, traces and test attachments are local ignored outputs under
`playwright-report/` and `test-results/`; the committed run records retain case
outcomes. No remote CI execution or public preview is claimed.

## Coverage and conditions

Local reviewer: Codex. Date: 2026-10-14. OS: Windows 11 Home Single Language,
10.0.26300. Runtime: Bun 1.4.3. Framework: Next.js 16.4.0 / React 19.3.0.
Production profiles: desktop Chromium, Firefox and WebKit, emulated Pixel 7
Chromium and emulated iPhone 13 WebKit. WebKit on Windows is not actual Apple
Safari, and mobile emulation is not physical-device evidence.

| Contract | Refreshed evidence |
| --- | --- |
| Selection and galleries | Card preview carried into detail; no initial size; missing-size focus; color retains size and resets gallery; replacement URL/history; paired photographs, buttons, swipe and vertical-gesture rejection |
| Dialogs and Sheet | Keyboard focus containment, initial focus, Escape/close trigger return, guidance content, selected enlargement image, full-width mobile/right-opening 480px larger Sheet |
| Cart | Merged tuples, distinct color/size lines, 1–10 limits and feedback, immediate removal, unit counts, current catalog line totals/subtotal, normal persistence |
| Favorites | Product-level membership, card/detail synchronization, count, saved-page default color, removal focus, populated/empty actions, normal persistence |
| Independence | Favorite removal preserves saved cart; read/write failures isolated by store; in-memory success survives failed saves; no live cross-tab synchronization required |
| Recovery | Malformed/unsupported envelopes preserved, obsolete references removed without substitution, malformed quantities discarded, duplicate merge/deduplication, cap at ten, current prices, once-only explanations |
| Hydration | Public content readable, neutral counts, gated actions, delayed-JS restoration without initial overwrite or false empty flash |
| Failure/empty | Temporary shopping, modal write warning, image fallbacks, empty exploration, reload restoration |
| Accessibility | Scoped labels, semantic controls, visible focus CSS, polite/atomic live regions, keyboard/browser assertions and representative axe scans |

Lint, generated route types/TypeScript, content approval/readiness, 70 focused
tests and the production build passed. The build generated 48 public outputs.
Lint, TypeScript and build were refreshed after the thumbnail correction.
Content and module checks apply from the unchanged baseline; their source and
approved input bytes did not change.
Development diagnostics passed in 4.0 minutes against the final application
source. The public route scan and client shopping/navigation/reload journey
reported no blocking URL-data or hydration diagnostics. This check deliberately
blocks optimized raster images to focus on development prerender diagnostics;
the production browser/capture runs provide the separate imagery evidence.
The final production capture run passed in 1.9 minutes: 36 observations at
390/768/1440 CSS pixels, no horizontal overflow, zero axe findings. All findings
are therefore assessed as none in this capture matrix; broader browser axe
assertions cover open dialogs, populated/empty cart/favorites and recovery.

The broad production run passed 135 of 140 cases. All five continuous-shopping
journey cases passed, one per browser profile. Five existing assertions failed:
desktop WebKit dialog focus containment, the 60-second responsive-test timeout,
desktop WebKit recovery-page horizontal overflow, mobile WebKit initial
add-button readiness, and mobile WebKit failed-image fallback. The identical
file list with `--last-failed --workers=1 --timeout=60000` passed all five cases
without application, assertion or timeout changes. All 140 distinct cases have
passing evidence across these two runs; this is not a clean full-matrix pass.
The failures' cause is unconfirmed. Isolated success is not an application fix
or proof of real-device performance. The original [failure contexts and traces](failures/)
are retained for investigation, alongside both run records and the case index.

These broad and isolated runs used baseline application revision
`240beb7aa31e50fbc0180002789aa447649017cd`
([source](https://github.com/danielluis07/difratelli-kids-v2/tree/240beb7aa31e50fbc0180002789aa447649017cd)),
build `cXiQ9ln-k_kitIvDmnlvn`. Visual inspection then found clipped failure copy
inside 72 × 96px gallery thumbnails. The added browser geometry assertion
[failed before the fix](thumbnail-before-fix.json); see the
[original mobile capture](thumbnail-before-fix-390.png). A scoped CSS rule allows
wrapping, reduces fallback padding and uses a 12px/1.25 line height. The same
extended image-failure case passed against the rebuilt final candidate in all
five profiles. All 36 state captures and their axe scans are refreshed against
that final candidate. Unaffected shopping contracts retain the explicit baseline
evidence; no clean full-matrix run against the CSS-corrected revision is claimed.

Capture-harness corrections are separate: the first attempt was interrupted
after ten mobile captures when axe stalled in a JavaScript-disabled context.
The pending-state capture now blocks application JS requests while allowing axe's
injected script and browser timers. The next [capture attempt](capture-before-fix.json)
failed on an immediate focus assertion at desktop guidance opening; the harness
now polls containment, matching the existing browser contract. Application focus
behavior and assertions in the existing dialog suite are unchanged.

## Visual inspection and manual limits

Codex inspected the 12 captured states at each responsive width: product,
missing-size feedback, guidance, enlargement, populated cart/favorites, empty
cart/favorites, corrected-storage notices, storage-failure notices, pending
favorites and failed imagery. Product selection and cart controls remain
readable; unit/line/subtotal amounts fit. Cart footer actions remain reachable
within the viewport, and dialogs retain visible close controls. Model photographs
preserve the garment, selected outlines remain visible and saved-product grids
use two/three/four columns. Tall galleries/enlargements continue below the
viewport; the original image is contained inside a scrollable dialog rather
than cropped by the image element. At 390px the guidance table is horizontally
scrollable inside its labeled keyboard-focusable region. Recovery notices occupy
a bounded, dismissible panel. The corrected thumbnail fallback wraps completely.
No remaining major layout/crop defect was observed in these captures.

| Review item | Outcome and conditions |
| --- | --- |
| Agent visual inspection | Passed for all 36 responsive state captures; Windows Chromium, 390/768 touch emulation and 1440 desktop |
| Keyboard commands, missing-size/removal focus | Passed browser assertions in five profiles; actual synthetic keyboard events, not a manual human session |
| Sheet/dialog focus containment and return | Passed across baseline/isolated evidence and final Chromium capture assertions; initial concurrent WebKit failure retained |
| Announcement content and live-region semantics | Passed DOM/browser/source checks; actual speech output not listened to |
| Reduced motion | Final captures use reduced motion; existing product suite checks reduced-motion dialog opacity and enlarged text |
| Touch | Existing gallery suite exercises native Chromium touch input and synthetic gestures elsewhere; no physical touch device used |
| Empty, pending and failure presentation | Inspected; normal/recovered/temporary shopping and persistence covered by browser contracts |
| NVDA/Chrome, VoiceOver/Safari, actual mobile devices | Not checked; unavailable in this session |
| Actual browser-toolbar 200% zoom | Not checked; existing enlarged-root-text check is an approximation |
| Real-phone slow-connection/performance review | Not checked; desktop/emulated success does not cover it |
| Remote CI/public preview/release smoke checks | Not performed by this local checkpoint |
| Development diagnostics | Passed against final source in 4.0 minutes; no blocking URL-data/hydration diagnostics |

To conduct the human journey review, run `bun run dev` after the managed checks
have stopped their servers, then open `http://localhost:3000` on this branch:

1. Choose a card color and save its favorite; follow the card into detail.
2. Use both gallery photos and dialogs with keyboard/touch; confirm close/Escape
   returns focus. Add without a size, then choose a size and add repeatedly.
3. Choose another color/size and add it. In the cart, edit quantity up to ten,
   check limit feedback/options/totals, remove a line, and close with Escape.
4. Navigate to Favorites, reload, remove the saved product and confirm the cart
   remains intact. Remove the remaining cart entries and inspect both empty actions.
5. Inspect the linked pending/recovery/failure captures and test recordings;
   perform missing assistive-technology, actual-device, zoom/performance checks
   where available. Record each unchecked coverage item separately.
6. Record the decision for the exact application revision below. The checkout
   link is a future-stage destination; do not interpret it as a working checkout.

The source review uses the [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)
alongside the approved project contracts. Reviewed shopping files:

- `components/storefront/product-card.tsx`: labeled swatches/hearts, link navigation, reserved model/isolated images, live color name — pass.
- `components/storefront/product-gallery.tsx`: explicit gallery buttons alongside swipe, labeled enlargement dialog, live photo position — pass.
- `components/storefront/product-size.tsx`: named options, selected states, semantic guidance table and keyboard-scroll region — pass.
- `components/storefront/product-add.tsx`: pending gate, missing-size focus, polite action feedback and repeated-update sequence — pass.
- `components/storefront/cart-sheet.tsx`: modal keyboard controls, named selection groups, current-price totals, close focus after removal and modal-local write warning — pass.
- `components/storefront/favorite-button.tsx` and `favorites-content.tsx`: contextual names, pressed/pending states, next/previous/empty removal focus — pass.
- `components/storefront/storage-feedback.tsx`: separate store notices, persistent polite/atomic regions and named dismiss buttons — pass.
- `app/globals.css:114` and `app/globals.css:197`: scrollable cart/dialog regions lack explicit `overscroll-behavior: contain`. Advisory: Base UI modal scroll locking is present; no page scroll leak has been established. Native touch boundary scrolling still needs actual-device review.

Immediate cart/favorite removal follows the explicitly approved shopping
contract, which takes precedence over the generic guideline's confirmation/undo
recommendation. Fixed Brazilian Portuguese copy and separate persistent store
state also follow the project contract. No approved copy is rewritten solely
to match generic English typography or localization advice.

## Human acceptance record

No human acceptance has been recorded. Automated checks and agent image
inspection do not create product acceptance or cover manual assistive-technology
checks. Actual devices, NVDA/Chrome, VoiceOver/Safari, browser-toolbar 200% zoom,
and real-phone slow-connection performance remain not checked in this session.
Coverage gaps need an explicit owner decision; release approval remains separate.

Suggested decision, only after reviewing the exact revision and linked evidence:

> I accept the product/cart/favorites checkpoint for application revision
> 7e1c9545d205aee3a170f2932bf43c7844c4a52b, reviewed with the issue #40 packet.
> Coverage gaps accepted for this checkpoint: [explicit list, or none].
> Required follow-up before release: [explicit list, or none].

The gate comes directly from issue #40: “Record explicit human
product/cart/favorites checkpoint acceptance before checkout implementation
advances,” and [implementation plan](../../implementation-plan.md): “Obtain
checkpoint acceptance before advancing to the next implementation stage.”
Keep this issue pending acceptance and do not implement checkout, merge,
publish, or infer permission for hosting purchases from this review.

Next.js feedback reporting pass: no verified qualifying framework issue retained.
Concurrent assertion timeouts and capture-harness corrections are recorded above;
none establishes a Next.js defect. No feedback command is required with zero candidates.
