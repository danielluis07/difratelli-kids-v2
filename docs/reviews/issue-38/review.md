# Issue #38: persistent favorites

Local implementation evidence for [issue #38](https://github.com/danielluis07/difratelli-kids-v2/issues/38), based on `7355078725ea11729ac62caf48c7c0e69710a9f0` plus this working-tree slice. Integration acceptance and release approval remain separate gates.

## Delivered behavior

- Cards and available product-detail controls save/remove a product independently of colorway, size, quantity or cart contents. Outlined/filled hearts, contextual Portuguese accessible labels, pressed states and a persistent polite announcement communicate each action. Detail controls wait for their interactive view.
- A shared-layout provider owns one separate vanilla Zustand favorites store. Browser storage is acquired only by the idempotent post-mount restoration command. Every subscriber hydrates against the same original pending snapshot. Public content renders while favorite actions wait and counts show a neutral ellipsis.
- Normal favorites persist under `difratelli.favorites` as `{ version: 1, productIds: [...] }`. Only stable product IDs are saved. Restoration never writes storage; normal reload and browser/client navigation retain membership. The cart uses its own store and key.
- Desktop header and compact navigation badges count saved products. `/favoritos` renders curated saved-product cards initially using each default colorway, removes cards immediately, and offers the approved Explorar produtos action when empty. Keyboard removal focuses the next remaining heart, the previous heart for a last-row removal, or the page content when empty. The announcement remains mounted after removal.

## Verification

- `bun run lint`, `bun run typecheck`, `bun run validate:content` and `bun run test:unit` passed. There are 52 passing command/content cases, including two favorites persistence contracts. The production build passed and generated all 48 public pages with `SITE_URL=http://127.0.0.1:3100`.
- Production browser command: `bunx playwright test tests/browser/favorites.spec.ts tests/browser/cart.spec.ts tests/browser/product.spec.ts tests/browser/catalog.spec.ts tests/browser/search.spec.ts tests/browser/browsing.spec.ts --workers=2 --timeout=60000`. The broad run passed 182/185 cases in 14.8 minutes across Chromium, Firefox, WebKit, emulated Pixel Chromium and emulated iPhone WebKit. This includes 25 distinct favorites cases covering all five profiles.
- Three broad-run failures were retained: Firefox card-to-detail navigation exceeded its five-second URL assertion, WebKit's existing cart test added before the replacement color view settled, and an existing WebKit category-navigation URL assertion exceeded five seconds. The favorites navigation assertion now allows fifteen seconds, and the cart test waits for the visible selected-color label before adding. The identical file list with `--last-failed --workers=1 --timeout=60000` passed all three cases in 35.5 seconds, completing passing evidence for all 185 distinct cases. The original category-navigation check passed without modification. These results are not described as a clean first run.
- `bun run test:dev` passed on the updated test, including the public route scan, client navigation, saving a product, independent cart/favorites reload restoration, and the saved-products page. No blocking URL-data or hydration diagnostics were emitted. Its first updated run exceeded the five-second grid assertion just before the favorites content appeared; the targeted cold-navigation assertion now allows fifteen seconds. The passing rerun took 3.7 minutes.
- Initial browser checks found a long visible detail-button label causing horizontal overflow, ambiguous existing listing-status selectors after the shared announcement was added, and an old compact-menu label assertion that did not include the new count. The visible detail label is now compact while its accessible label retains the product name; listing assertions are scoped to visible main content and compact-menu assertions use the approved count copy.
- A card-to-detail test could select the outgoing Suspense fallback during navigation. The fallback favorite control is now gated with the other product controls, and the browser test waits for the visible interactive detail control. The first broad exploratory run was interrupted to apply these corrections; only the final run is treated as candidate evidence.

## Captures and manual coverage

- [390px favorites](favorites-390.png)
- [768px favorites](favorites-768.png)
- [1440px favorites](favorites-1440.png)

These local Chromium captures were inspected: two/three/four columns fit their viewport, garment imagery remains visible, selected hearts remain distinguishable, and the desktop saved count is correct. Automated keyboard and axe checks cover populated/empty favorites; existing product and navigation checks also exercise the added controls. Browser binaries ran on Windows with emulated mobile profiles. Actual-device and manual NVDA/Chrome or VoiceOver/Safari coverage is not claimed.

## Remaining integration gates

The storage-recovery ticket must complete tolerant malformed/unsupported/obsolete state, deduplication and independent once-only read/write warnings before shopping acceptance. This slice preserves unreadable storage and supports temporary in-memory updates defensively, but does not claim the recovery contract is complete. Combined product/cart/favorites acceptance, checkout, public-preview review and release approval remain separate gates. No hosting purchase, deployment or external acceptance is recorded here.

Next.js feedback reporting pass: no verified qualifying framework issue identified in this slice.
