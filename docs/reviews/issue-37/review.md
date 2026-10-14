# Issue #37: persistent cart

Local implementation evidence for [issue #37](https://github.com/danielluis07/difratelli-kids-v2/issues/37), based on `e6f8c1daeb5de8014f20c6bf959cd393126e6ab8` plus the working-tree changes in this slice. This is not an approved release candidate or a public-preview review.

## Delivered behavior

- Product additions use the selected product/colorway/size. Missing-size feedback focuses the size selector; successful additions announce briefly without opening the cart. Repeated additions merge up to ten; different colors and sizes remain separate.
- The shared-layout provider owns one separate vanilla Zustand cart. It acquires browser storage and restores after mount. Public content remains prerendered independently, while the badge shows a neutral ellipsis and add commands remain gated. Every subscriber hydrates against the same original pending snapshot, including late-mounted product content.
- Normal carts persist under `difratelli.cart` as `{ version: 1, lines: [...] }`. Lines contain stable selection references, quantity and last-seen unit price only. Restoration is idempotent and never writes saved data. Current catalog integer-centavo prices govern every displayed amount.
- The right-opening Sheet uses 480px from tablet width and full width below 768px. Selected photographs/options, unit/line totals, quantity controls, removal, subtotal and checkout action are visible. Decrement stops at one with feedback; increment stops at ten with feedback. Removal is immediate and places focus on the close control. Escape restores trigger focus; empty exploration closes the Sheet and opens the catalog.
- The checkout action targets `/checkout`, whose implementation belongs to the later checkout slice. This cart ticket does not implement the delivery/payment/completion flow.

## Verification

- `bun run lint`, `bun run typecheck`, `bun run validate:content` and `bun run test:unit` passed. The command suite contains 50 passing cases, including three new persistence contracts. The final production build passed TypeScript and generated all 48 public pages with `SITE_URL=http://127.0.0.1:3100`.
- Initial production command: `bunx playwright test tests/browser/cart.spec.ts tests/browser/product.spec.ts tests/browser/catalog.spec.ts --workers=2`. All 20 new cart cases passed across Chromium, Firefox, WebKit, emulated Pixel Chromium and emulated iPhone WebKit. The complete run passed 107/110; three existing WebKit catalog cases exceeded their 30-second test timeout during navigation or responsive checks. Their isolated rerun and final cart verification are recorded below.
- After rebuilding the final provider/badge changes, the same three files with `--last-failed --workers=1 --timeout=60000` passed all three previously timed-out cases. All 110 distinct focused browser checks have therefore passed, with the initial timeout failures retained here rather than described as a clean first run.
- Final cart command: `bunx playwright test tests/browser/cart.spec.ts --workers=2 --timeout=60000`. Nineteen cases passed; Chromium measured a 480px Sheet as `480.00006103515625px`, exposing an overly strict geometry assertion. The test now polls rounded bounds while the opening animation settles. Its corrected `--last-failed --workers=1 --timeout=60000` rerun passed, completing all 20 cart cases on the final application build. Focused lint on the updated browser/development tests also passed.
- `bun run test:dev` passed separately. The complete public route scan and client navigation, including adding the selected color/size, opening the cart and restoring its unit count on reload, emitted no blocking URL-data or hydration diagnostics. No remote CI execution or public deployment is claimed by this local evidence.

## Captures and manual coverage

- [390px cart](cart-390.png)
- [768px cart](cart-768.png)
- [1440px cart](cart-1440.png)

The captures were inspected locally: the selected garment remains fully visible, controls and options fit, and the subtotal/action remain at the bottom. Browser contracts verify Sheet dimensions and focus/announcements; axe scans cover populated and existing empty cart surfaces. These checks use Windows browser binaries and emulated mobile profiles, not physical phones. Manual NVDA/Chrome, VoiceOver/Safari and actual-device checks remain unclaimed.

## Remaining integration gates

The storage-recovery slice must implement partial malformed/obsolete/duplicate-entry recovery, unsupported-envelope handling, price-change explanations and independent once-only read/write warnings before shopping acceptance. The defensive temporary fallback in this slice preserves unreadable storage but does not claim that full recovery contract. Favorites and checkout remain their separate delivery slices. Combined product/cart/favorites integration acceptance, public-preview review and release approval remain separate human gates.

Next.js feedback reporting pass: no verified qualifying framework issue identified in this slice.
