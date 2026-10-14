# Issue #36: product inspection

Implemented the product inspection scope of [issue #36](https://github.com/danielluis07/difratelli-kids-v2/issues/36). Cart commands and the purchase action belong to issue #37. The combined product/cart/favorites integration checkpoint and release approval remain separate.

## Delivered behavior

- Approved model-first and isolated-second pairs retain garment-preserving crops. Thumbnails, wrapping previous/next controls, and horizontal swipe update the displayed photograph and live position. Vertical gestures and pinch gestures do not switch photographs.
- Explicit enlargement and size guidance use shadcn/Base UI dialogs with Portuguese titles/close controls, Escape, focus containment and trigger focus return. Enlargement uses a larger image surface and responsive optimized images. Failed images keep their reserved space and readable fallback.
- The URL selects the first `cor` scalar when valid, otherwise the default colorway; an invalid first scalar falls back without rewriting the incoming URL. User color links replace history. URL-driven changes and Back/Forward retain the chosen size and reset the gallery when the effective color changes.
- Sizes 2/4/6/8 start unselected. The selected size remains visible and pressed; clicking it again keeps the selection. Changing product or reloading starts a new size selection.
- The approved brand-wide measurements, measuring instructions and range caveats are available in the size guide. Description, composition and fit are expandable and readable before hydration. Matching sets state both included pieces and that the price covers both.
- Four other products from the same collection appear in approved curated order through shared product cards.

## Verification

- `bun run lint` and focused lint checks passed. `bun run typecheck` passed. The final production build also passed TypeScript checks and generated all 48 public pages.
- `bun run validate:content` passed, including approved file bytes and approval evidence. All 47 existing unit tests passed.
- Production build used `SITE_URL=http://127.0.0.1:3100`, matching the browser harness origin.
- `bun run test:e2e -- tests/browser/product.spec.ts tests/browser/catalog.spec.ts --workers=2 --timeout=60000`: 87 passed; three test-timing assertions were corrected and passed with the same command plus `--last-failed`. All 90 distinct focused checks now pass across desktop Chromium/Firefox/WebKit and emulated mobile Chromium/WebKit.
- `bun run test:dev` passed separately: the public route and client-navigation matrix emitted no blocking URL-data or hydration diagnostics. Run this separately from production browser tests because its artifact directory sits inside their output directory.
- Checks cover URL/history/size/gallery consistency, keyboard controls, CDP touch input on emulated mobile Chromium, synthetic gesture events on the other engines, both dialogs, representative axe scans, image failure, public content without JavaScript, matching-set copy, related-product navigation and widths 320/390/768/1024/1440. Text scaling uses a 200% root font size; reduced-motion presentation is also checked.
- Two existing zero-filled optimized-image cache files caused decoding failures despite HTTP 200 responses. Removing only those generated cache files restored image loading. Approved source images were unchanged.
- Dialog focus was also inspected directly in Chromium through repeated Tab/Shift+Tab input. Screenshot review confirms stacked mobile layout, two-column tablet/desktop detail layout, visible options, intact garment framing, and a scrollable size dialog with its close control near the top.

Actual physical phones/tablets and manual screen-reader announcement evaluation were not available. This evidence does not grant integration acceptance or release approval.

## Captures

- [Mobile product](product-390.png)
- [Tablet product](product-768.png)
- [Desktop product](product-1440.png)
- [Mobile size guide](guidance-390.png)
- [Desktop size guide](guidance-1440.png)
