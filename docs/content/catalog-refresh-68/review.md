# Catalog photography review — issue #68

Revision: `issue-68-catalog-v1`. **Pending explicit human acceptance. Not integrated.**

[Issue #68](https://github.com/danielluis07/difratelli-kids-v2/issues/68) requires acceptance of the exact replacement originals and exports before integration. Agent inspection and passing checks do not constitute acceptance.

Open the [responsive comparison review](review.html), which includes all 42 colorways. The [contact sheet](contact-sheet.webp) shows the current pair on the left and the proposed pair on the right. [approval-request.json](approval-request.json) binds the exact candidate paths, dimensions, SHA-256 hashes and the 82 retained photographs with their existing approvals.

## Audit and selection

All 30 current products, 42 colorways and 84 photographs across the three collections were audited. [audit.json](audit.json) records each product/colorway/role, retain-or-replace decision, original/export hashes, measured dimensions, assigned child, photographed size, source manifest, separate approval sources and accepted exceptions. Inspection used the active collection contact sheets, full-resolution selected worn photographs and approved cast references, followed by original/export/reference byte checks for every active photograph. It is a selective photography review, not a new assortment decision or physical garment measurement.

The final proposal replaces **two photographs**, both for **Calça Passos na Rua / Azul-céu (`product-020` / `sky`, collection-002)**. It retains **82 photographs**. The sky-blue isolated candidate removes the old photograph's fly-like front stitching and shows the same pull-on construction as its newly generated worn counterpart. Both roles preserve the visible elastic waist, two side pockets, straight ankle-length legs, sky-blue cotton-stretch twill and complete framing. Noah (`model-008`) remains the assigned fictional child, photographed in size 8. Supporting cream shirt and shoes are styling only; the isolated photograph shows only the trousers.

Leaf-green `product-009` and teal `product-029` pairs were also tested. Their retakes failed to improve construction fidelity sufficiently: the generator repeatedly introduced curved fly-like front stitching, and one local correction degraded fabric texture. Those candidates were discarded from the proposed manifest. The existing approved pairs remain selected. Their earlier exact-file approvals and expressly accepted exceptions remain valid. [generation.json](generation.json) retains every attempted prompt, actual references, source output path, native dimensions, original hash and rejection reason. The unused worn files remain retained production inputs, excluded from candidate exports and active catalog manifests.

Other retained photographs show no priority correction in the contact-sheet review to silhouette, print/color relationships, matching-set completeness, framing or role continuity. This does not erase their previously disclosed exceptions: product-009's isolated trouser details, the product-018/product-019 shorts and product-029's isolated teal front outline remain tied to their previous acceptance records. Historical pending flags and superseded T-shirt approvals do not revoke the later polo approvals.

## Exact proposed files

Gallery order is explicit: **model first (1), isolated second (2)**.

| Role | Original | Full-resolution export |
| --- | --- | --- |
| Model | [PNG](../../../assets/originals/catalog-refresh-68/product-020-sky-model-refresh68-v3.png) | [WebP](../../../public/images/catalog-refresh-68/product-020-sky-model-refresh68-v3.webp) |
| Isolated | [PNG](../../../assets/originals/catalog-refresh-68/product-020-sky-isolated-refresh68-v3.png) | [WebP](../../../public/images/catalog-refresh-68/product-020-sky-isolated-refresh68-v3.webp) |

The built-in `image_gen` tool generated the worn photograph first, using Noah's actual approved `model-008-reference-v1.png` and the current garment photograph. The isolated request then used that exact new worn file. [requests.json](requests.json) and [generation.json](generation.json) preserve the complete final prompts and inputs. The tool exposes no seed, explicit output-size argument or model revision; none are invented in the records.

Both originals and quality-90 WebP exports measure native **1086 × 1448**, exactly **3:4**, with opaque backgrounds and full-frame conversion. There is no cropping or enlargement. This follows the existing Brincadeira [native-resolution acceptance](../brincadeira-resolution-acceptance.json); it does not claim the standard's default 1200 × 1600 minimum. [manifest.json](manifest.json) contains actual encoded dimensions, bytes, hashes, reference hashes, Portuguese alt text and usage. It remains `pending-human-review` and is not imported by the storefront.

Agent inspection found complete garment framing, neutral studio lighting, natural apparent anatomy and identity, readable seams and consistent color/construction across the proposed pair. The photographs preserve the existing catalog's presentation and opaque white studio treatment. Fabric color is a visual comparison, not a calibrated physical measurement. Review the full-resolution exports to accept or request corrections to the exact files.

## Responsive review

The comparison HTML is a standalone review artifact. Actual storefront captures use the existing unchanged React product card and gallery through browser-only substitution of the two optimized image responses. This substitution is restricted to the Playwright context; active source URLs and storefront alt text remain the current approved metadata until integration. Candidate Portuguese alt text is recorded separately in the candidate manifest. This is a pre-integration preview, not evidence of deployed or integrated replacements.

| Width | Current/proposed comparison | Cards beside retained photos | Model gallery | Isolated gallery |
| --- | --- | --- | --- | --- |
| 390 px | [Comparison](comparison-390.png) | [Cards](cards-390.png) | [Model](gallery-model-390.png) | [Isolated](gallery-isolated-390.png) |
| 768 px | [Comparison](comparison-768.png) | [Cards](cards-768.png) | [Model](gallery-model-768.png) | [Isolated](gallery-isolated-768.png) |
| 1440 px | [Comparison](comparison-1440.png) | [Cards](cards-1440.png) | [Model](gallery-model-1440.png) | [Isolated](gallery-isolated-1440.png) |

[browser-checks.json](browser-checks.json) records Chromium results, selected responsive sources, optimizer substitutions, HTTP status and viewport details. Checks cover decoded image loading, model-first/isolated-second ordering, touch retaining the worn card image, keyboard focus and desktop hover revealing isolation, thumbnail selection, previous/next controls, enlargement, retained-colorway navigation, gallery reset and no horizontal overflow. Captures use device pixel ratio 1; mobile uses touch emulation. The review is independent of all editorial imagery.

## Verification and preservation

- `bun run lint` — passed.
- `bun run typecheck` — passed.
- `bun run validate:content` — passed for the current approved content, including retained files and their approval evidence.
- `bun scripts/content/prepare-catalog-refresh-68.mjs` — passed candidate dimensions, opacity, no enlargement, full-frame exports, original/export hashes, cast assignment, exact worn reference and preservation checks.
- `bun scripts/content/capture-catalog-refresh-68.mjs` — passed at 390, 768 and 1440 px against the local dev server on port 3200.

[baseline.json](baseline.json) records the working bytes of every previously tracked file before production. The preparation script checks those hashes unchanged, including all current catalog manifests, original photographs, approvals, assortment records, prices, sizes, collection membership, merchandising associations and storefront components. Homepage, collection-page and brand-page editorial selectors, assets, copy and layouts remain unchanged. Existing unrelated working changes to `AGENTS.md` and `next.config.ts` were present before this work and preserved. No GitHub state, branch, commit or PR was changed.

No application code changed, so a production build and full regression suite were not repeated for this review-only package. Integration and its repository/browser checks remain pending acceptance.

## Decision and subsequent integration

Accept the exact two original/WebP pairs in [approval-request.json](approval-request.json), or name corrections by role. A later decision record must retain the reviewer, explicit evidence, timestamp, revision and all four file hashes. No acceptance is recorded yet.

After acceptance, integrate only `product-020` / `sky`, preserve historical originals and approvals, and update the affected Brincadeira generation/manifest and complete-package/readiness records to resolve the new photography approval while retaining every other exact-file approval. Keep catalog product data and all editorial files unchanged. Verify the real integrated source URLs, candidate alt text, responsive loading and gallery behavior, then run the appropriate repository checks. The current review does not satisfy those post-acceptance steps.
