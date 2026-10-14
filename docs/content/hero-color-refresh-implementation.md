# Hero color refresh integration — issue #66

The final PR activates the two accepted **left** hero sources and restores
`hero-right-clothes-v2` on the right, including its separately accepted narrow
crop. The hero keeps only **Comprar para meninas** and **Comprar para meninos**.
[The revised integration selection](hero-color-refresh-integration.json) and
[its acceptance record](hero-color-refresh-integration-approval.json) capture
the user's explicit instruction before PR creation. Earlier rail photographs,
four-action reviews and runtime captures remain historical evidence.

The user accepted `issue-66-hero-color-v1` with the message “approved”.
[The separate approval decision](hero-color-refresh-approval.json) binds all
56 reviewed files, including three selected originals and six responsive crops.
The review manifest and request retain their immutable pending-review fields;
the approval decision is the authority permitting integration.

`lib/presentation/editorial.ts` gives the selected left sources precedence over
the original homepage. The right resolves through the approved issue #34
image refresh. The original botanical left hero remains archived. Current category, quote,
collection-feature, shop-the-look and social imagery keep their existing
selection and approvals.

The existing static desktop split and left-only behavior below 1024px remain
in place. The approved compact source serves 480–767px as well as mobile and
narrow desktop; the landscape tablet source serves 768–1023px. Headlines,
gradients and interface colors are unchanged. The two retained actions keep
their original shopping destinations.

`checkHeroReadiness` is included in homepage readiness and the existing
Next.js build gate. It validates explicit acceptance, the approval-request hash,
all 56 approved file hashes, references, complete replacement coverage,
original dimensions, crop rectangles/ratios, WebP dimensions and source URLs.
The additional integration gate verifies active left-source selection, restored
right crops, exactly two audience actions and the separately accepted selection
hash. Contract tests reject pending image/integration acceptance, altered review
hashes and changed crop bytes.

## Verification

- Lint, TypeScript, content validation, all 79 unit/contract tests and the
  production build passed.
- [Production runtime checks](hero-color-refresh-runtime-checks.json) passed
  at 390, 480, 768, 1024, 1279, 1280, 1440 and 1920px. Images decode, responsive
  sources match the approved set, the copy stays inside its panel, and contrast
  meets 3:1 for the large heading and 4.5:1 for smaller text. All four hero
  shopping actions reach their existing destinations.
- The broader browser suite encountered failures in retained sticky-look image
  loading, catalog metadata and timed navigation checks. It was stopped after
  the affected Chromium hero, accessibility and image-fallback checks passed.
  The focused hero and image-error fallback rerun passed all 10 tests across
  Chromium, Firefox, WebKit, mobile Chromium and mobile WebKit. Captures target
  the hero rather than entire pages, and a single browser worker avoids the
  timeouts seen during concurrent captures. The development navigation check
  also passed without blocking URL-data or hydration diagnostics.

The future #67/#68 image candidates still need comparison with this accepted
hero for page-level variety. Their production and acceptance are separate work.
Release approval is outside this image integration.

## Revised runtime evidence

`hero-color-refresh-runtime-v2-checks.json` and `hero-color-refresh-runtime-v2-*.png`
capture the final two-action hero with the restored right panel. These supersede
the earlier runtime captures for current storefront verification, while the
original acceptance package stays immutable. The revised production review
passed all eight viewport checks, including overlay contrast and both shopping
destinations. Lint, types, content validation, all 79 tests and the production
build passed for the revised selection.
The revised hero and fallback checks also passed all 10 tests across the five
configured browser/device projects, using one worker.
