# Visit-only checkout — issue #41

Status: implementation and local production verification complete; human checkout
integration acceptance pending. No release approval or public preview is claimed.

Authority: [issue #41](https://github.com/danielluis07/difratelli-kids-v2/issues/41),
[parent specification #22](https://github.com/danielluis07/difratelli-kids-v2/issues/22),
and the accepted handoff revision `de86d01b70030b1b3f6f8a6873c0e6c66b44a3e3`.
The preceding product/cart/favorites checkpoint is recorded in
[issue-40 review](../issue-40/review.md).

## Source and scope

Verification ran locally against the source based on
`11ebae5a53c789ae60856cf6a750aaec55163ef8`.
[Source hashes](source-hashes.json) identify the exact application/test bytes
and production build `0NOjgjGfx4l_RF3h473h6`. Build and production server use
`SITE_URL=http://127.0.0.1:3100`. Changes invalidate this evidence until the affected
checks and review are refreshed.

Checkout now provides the approved editable delivery defaults, required-field
validation and first-invalid focus, optional complement, all Brazilian states,
Pix/card choice, current cart summary, fixed shipping and integer-centavo totals.
Address number accepts a nonempty value, including `s/n`, as specified.
The shared-layout draft survives client navigation and resets on document reload.
Errors and edited-field state reset on exit, including Activity-cached returns.

Completion validates the current draft/cart, guards duplicates, prepares an
immutable item/price/delivery/payment/total snapshot, clears cart/draft and retains
favorites. The exact disclosure appears only after success. Confirmation is
discarded on exit/reload; Continuar comprando opens the full catalog. Preparation
failure preserves inputs/cart for retry; failed cart persistence still completes
in memory and displays the approved warning about old saved choices returning.
Approved content/asset bytes are unchanged. No backend, payment, address lookup,
order endpoint or application testing endpoint was added.

## Verification

Final local results:

- Lint, generated route types/TypeScript, content readiness and production build passed.
- Vitest: 77 tests passed across nine contract suites.
- Production checkout: all 41 distinct cases verified across Chromium, Firefox,
  WebKit, mobile Chromium and mobile WebKit. The isolated full run passed 40 cases;
  the below-viewport lazy-image assertion was corrected and its focused rerun
  passed in all five profiles. Four intentional skips apply only to the
  fixed-width capture case, which runs once in Chromium. All behavioral cases
  ran in every profile.
- Existing cart/favorites/recovery/shopping checkpoint: 21 Chromium cases passed.
- Development navigation passed across the public-route matrix and the extended
  shopping/checkout journey, with optimized images blocked and no blocking
  URL-data or hydration diagnostics.
- Checkout errors and completion passed axe in all five production profiles.
  Contrast and definition-list findings from the first run were fixed.
- Mouse submission after blur and corrected-field submission pass. Reserved inline
  and summary feedback space prevents validation from moving the submit button
  between pointer press and release.

Running production browsers concurrently with development compilation produced
timeouts and a context-teardown failure. Final production verification runs
separately with one worker; no application change was made for those timing
failures. The failed-image test explicitly scrolls lazy-loaded thumbnails into
view before expecting their error feedback, including below the mobile form.

The checkout tests cover the complete catalog-to-product-to-cart-to-completion
journey, neutral server pending UI, empty exploration, validation/value/focus
behavior, delivery/payment navigation versus reload, current totals, duplicate
commit prevention, failed preparation and retry, cart clearing/favorites retention,
disclosure timing, confirmation disposal and accepted failed-write reload behavior.
Production completion also asserts that no non-GET purchase request occurs.
Focused contracts independently verify snapshot immutability after subsequent
cart/draft changes and cancellation/revalidation during preparation.

The expanded development journey exposed an existing cart image-fallback overlay
that intercepted the checkout link when images were blocked. Cart and checkout
thumbnail containers now contain the fallback and retain readable text. The new
production regression failed against the preceding build, then passed with the
fix; it also verifies reaching checkout and completing with failed images.

Reproduce from the repository root in PowerShell:

```powershell
bun run lint
bun run typecheck
bun run validate:content
bun run test:unit
$env:SITE_URL = 'http://127.0.0.1:3100'
bun run build
bun run test:e2e tests/browser/checkout.spec.ts --workers=1
bun run test:e2e tests/browser/cart.spec.ts tests/browser/favorites.spec.ts tests/browser/recovery.spec.ts tests/browser/shopping-checkpoint.spec.ts --project=chromium --workers=2
bun run test:dev
```

## Visual evidence and remaining gates

| State | Mobile, 390px | Tablet, 768px | Desktop, 1440px |
| --- | --- | --- | --- |
| Form | [Capture](checkout-390.png) | [Capture](checkout-768.png) | [Capture](checkout-1440.png) |
| Errors | [Capture](errors-390.png) | [Capture](errors-768.png) | [Capture](errors-1440.png) |
| Completion | [Capture](completion-390.png) | [Capture](completion-768.png) | [Capture](completion-1440.png) |

Agent visual inspection covered the desktop form, mobile errors and tablet
completion: readable labels and feedback, reserved product imagery, clear totals,
desktop columns and mobile stacking. Automated overflow checks passed at all three
capture widths. These are local browser/emulator captures, not actual-device or
human acceptance evidence. Screen-reader, real-device and complete-candidate
release review remain separate work.

Human checkout integration acceptance is required before advancing to the next
delivery stage under `docs/implementation-plan.md`. Publication remains subject
to approval of the exact candidate commit and public preview.
