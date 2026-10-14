# Issue #39: browser-storage recovery

Local implementation evidence for [issue #39](https://github.com/danielluis07/difratelli-kids-v2/issues/39), based on `3ef79af1d2725a5493fd28be1e904e90219f6eab` plus this working-tree slice. This evidence does not record combined shopping integration acceptance or release approval.

## Delivered behavior

- Recover valid entries from readable version-1 envelopes independently. Remove obsolete products/colorways/sizes without choosing replacements; discard malformed/nonpositive/noninteger quantities. Merge duplicate cart tuples, cap positive integer quantities and merged totals at ten, and deduplicate valid favorites.
- Resolve merchandise using current catalog prices. Compare valid saved last-seen prices solely for correction feedback; missing/malformed comparison metadata does not remove an otherwise valid selection. Stored envelopes still contain only the agreed stable references, quantities and comparison prices or favorite IDs.
- Expose nonpersisted restoration/persistence status, recovery flags and warning reason. Combine correction details once per store restoration using approved Portuguese copy. Persistent shared-layout live regions and dismissible notices survive navigation without repeating dismissed feedback.
- Keep unreadable JSON, malformed envelopes, unsupported versions and failed reads untouched. Temporary shopping remains usable. A failed save keeps the successful command in memory, preserves the last successful saved value and makes only that store temporary for the remaining visit; the other store continues saving.
- Announce a first save failure within the modal cart's existing action feedback, since the modal hides page live regions. Further changes/removal remain usable, and reopening the Sheet does not repeat its action warning.
- Preserve pending personalized counts/actions and public content during hydration. Restoration remains idempotent, acquires storage after mount and makes no writes. No storage-event synchronization is added: existing tabs keep their snapshots and each key follows its own last successful save.

## Verification

- Lint, generated route types/TypeScript, approved-content readiness and the production build passed. The build generated all 48 public pages with `SITE_URL=http://127.0.0.1:3100`.
- Production regression command: `bunx playwright test tests/browser/recovery.spec.ts tests/browser/cart.spec.ts tests/browser/favorites.spec.ts tests/browser/product.spec.ts --workers=2 --timeout=60000`. The broad run passed 133/135 cases in 10.6 minutes across Chromium, Firefox, WebKit, emulated Pixel Chromium and emulated iPhone WebKit. This includes 55 distinct recovery cases, plus existing shopping/gallery/responsive/keyboard/axe coverage.
- Two broad-run failures are retained: Firefox's second-tab navigation assertion timed out, and the unchanged emulated iPhone WebKit favorites test exceeded its five-second restored-card assertion after reload while the page remained pending. The second-tab scenario now opens Favorites and navigates into the saved product, exercising retained tab state across client navigation rather than loading the identical initial product URL in both tabs. Foregrounding alone did not remove the Firefox timeout. The identical file list with `--last-failed --workers=1 --timeout=60000` passed both cases in 29.6 seconds, completing passing evidence for all 135 distinct cases. The existing favorites test passed without modification. This is not described as a clean first run.

- `bun run lint`, `bun run typecheck` and `bun run test:unit` passed together in a separate final run. All 70 focused tests passed, including 18 added recovery contracts; the complete-package readiness case completed within its unchanged timeout.
- The revised tab scenario was rerun in all five profiles with `bunx playwright test tests/browser/recovery.spec.ts --grep 'tabs keep independent' --workers=1 --timeout=60000`: 5/5 passed in 53.7 seconds.

- `bun run test:dev` passed in 2.3 minutes. The development check scanned public routes and exercised client navigation, cart/favorites actions and independent reload restoration without blocking URL-data or hydration diagnostics.

An initial exploratory production run passed 48/50 recovery cases. Firefox's background-tab assertion timed out waiting for navigation even though its captured saved count was correct; the test now brings each tab forward before checking it and allows fifteen seconds for readiness. An emulated iPhone WebKit case exceeded the five-second initial add-button readiness assertion; that cold-hydration assertion now allows fifteen seconds. The final run includes the added modal-write warning and delayed-hydration mutation-observer checks against the rebuilt application.

A concurrent focused-test run after adding two recovery cases passed 69/70 tests, with the unchanged full-package readiness test exceeding its five-second timeout while the browser run was active. The separate final focused-test run passed all 70; the readiness test's implementation and timeout are unchanged.

## Captures and manual coverage

- [Desktop recovery notices](recovery-chromium.png)
- [Emulated mobile recovery notices](recovery-mobile-chromium.png)

The local Chromium captures were inspected. Correction details and independent dismiss controls fit their viewport; the mobile panel occupies a bounded scrollable area without horizontal overflow. The browser checks cover keyboard shopping, modal feedback, pending rendering, populated/empty states, and axe scans with recovery notices visible. Browser binaries ran on Windows; mobile profiles are emulation. Actual-device review and manual NVDA/Chrome or VoiceOver/Safari results are not claimed.

## Remaining gates

Human acceptance of the combined product/cart/favorites slice is still required before advancing to checkout. Public preview review, complete journey/manual verification and release approval remain separate. No external acceptance, hosting purchase, merge or deployment is recorded here.

Next.js feedback reporting pass: no verified qualifying framework issue identified in this slice; the observed test-readiness timeouts are routine verification timing, not a verified framework defect.
