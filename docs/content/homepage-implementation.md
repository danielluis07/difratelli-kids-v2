# Issue #34 implementation

The storefront uses the content approved in [homepage-approval.json](homepage-approval.json). The original pending-review manifest, copy proposal, contact sheet, review and screenshots remain immutable evidence; their recorded status is historical. The separate approval decision permits integration of their exact bytes. `checkHomepageReadiness` verifies that decision, the approval request and all reviewed files as part of the existing build/content gate. New imagery or copy requires a new revision and human approval.

The homepage follows the issue's mapped Tea structure with static split hero, both product carousels, lifestyle categories, quote and collection editorial, three product-matched look tabs and seven social photographs. The existing header/footer remain shared. Approved non-price announcement messages rotate every six seconds, pause through a visible control and keyboard focus, and stop under reduced motion or while the document is hidden. No other carousel autoplays.

Carousels use native horizontal scrolling and scroll snapping, labeled arrows, and arrow/Home/End navigation when the track has focus. Fully off-screen items are inert; swatches keep their own keyboard behavior. The look tabs use Base UI through shadcn with automatic activation on keyboard focus. Product cards retain model/isolated imagery and colorway previews. The look panels start with the exact photographed colorways.

Art direction is manifest-driven. The server prepares optimized `<picture>` sources with `getImageProps`; the client image wrapper handles failed sources, including failures before hydration. Containers reserve the approved ratios or hero minimum height. Collection and brand routes run edge to edge, while other browsing routes retain their existing content cap. Collection details reuse the shared listing filters, sorting and prerendered default ten-product grid. Unknown slugs still return 404 through the existing proxy.

The owner-authorized design revision is recorded in [DESIGN.md](../../DESIGN.md) and [ADR 0001](../adr/0001-full-bleed-editorial-storefront.md). No pricing, backend, hosting purchase or deployment work is included.

The subsequent image revision is approved in [homepage-image-refresh-approval.json](homepage-image-refresh-approval.json). It replaces the right hero with clothes alone and four category tiles: Camisetas (running in a city park), Polos (city scene with sunglasses), Conjuntos (clothes alone), and Vestidos (two smiling children under a blue sky). The refresh request binds all 34 reviewed files separately from the original approval. The content gate checks both revisions, including replacement crop dimensions and file hashes.

At desktop widths of 1024px and above, each look's editorial image sticks 104px below the viewport top while its product grid scrolls, then leaves with the bottom of the look panel. Below 1024px the image retains the stacked layout and normal scrolling.

## Validation commands

```powershell
bun run lint
bun run typecheck
bun run validate:content
bun run test:unit
$env:SITE_URL = 'http://127.0.0.1:3100'
bun run build
bunx playwright test --workers=2 --timeout=60000
bun run test:dev
```

Use the same `SITE_URL` during build and production-server startup: prerendered sharing metadata includes the build origin. Run the two Playwright configurations sequentially because the main runner cleans its output directory, which contains the development runner's artifacts.

Browser coverage includes 390, 768, 1024, 1440 and 1920px; a CSS viewport equivalent to 200% browser zoom plus enlarged root text; desktop and mobile engines; native Chromium touch swipe; keyboard carousels and look tabs; announcement rotation/pause/reduced motion; collection and brand content; failed-image recovery; and representative WCAG A/AA axe scans. Native touch injection is tested through Chromium's protocol; other engines exercise the shared scroll and keyboard behavior.

## Verified outcome

- Lint, type checking, content readiness, production build and 47 unit/contract tests passed.
- All 152 applicable production browser cases were verified across Chromium, Firefox, WebKit, mobile Chromium and mobile WebKit. The full matrix produced 151 passes, three platform-specific touch-injection skips and one transient computed-layout assertion failure. That existing grid assertion now polls for the settled layout; its affected mobile Chromium case passed the targeted rerun. The assertion still requires the same column counts and no horizontal overflow.
- The development-navigation check passed across the public routes and shopping navigation, with no blocking URL-data or hydration diagnostics.
- Full-size rendered homepage, brand and collection captures were visually inspected after loading all images. Desktop/mobile image decoding and no horizontal overflow were independently confirmed.
- The original 80 approval-bound files still match. Both production scripts preserve the approved content/review instead of rewriting it.
- The approved image refresh passed lint, type checking, content readiness, production build and all 47 unit/contract tests. The approval contract now also rejects pending or mismatched refresh evidence. The preparation script preserved all 34 refresh-bound files.
- The refreshed hero source/structure check passed in all five browser projects at all five viewport widths. Replacement-image decoding and sticky positioning passed in all five projects across all three look tabs and desktop widths, with normal mobile flow checked at 390px and 768px. Safari's fractional-pixel rounding is allowed within a two-pixel boundary tolerance. The sticky desktop capture was visually inspected.
