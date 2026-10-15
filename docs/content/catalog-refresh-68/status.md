# Issue #68 — accepted and integrated

The user replied **“yes”** to the exact proposed pair and its integration. [approval.json](approval.json) records the reviewer, evidence, timestamp, reviewed revision and original/WebP hashes. The [original review](review.md), candidate manifest and approval request remain unchanged historical artifacts; their pending fields predate this acceptance.

The two accepted photographs for **Calça Passos na Rua / Azul-céu (`product-020` / `sky`)** now resolve through the active [Brincadeira manifest](../brincadeira-manifest.json), shared product cards and individual product gallery. Noah remains the assigned child, size 8; order remains model first and isolated second. The Portuguese alt text and native 1086 × 1448 dimensions come from the accepted candidate records. Original PNGs and quality-90 WebP exports are unchanged from review.

The other **82 active catalog photographs**, their original/export bytes and their approval sources remain unchanged. Catalog products, colorways, garment definitions, prices, sizes, collection membership and merchandising associations remain unchanged. Integration verification checks the pre-production hashes outside the six updated integration records, the preparation entry point and the Git attributes preserving accepted bytes. It permits Git line-ending normalization for ordinary source text while approved content and images remain byte-exact. Pre-existing changes to `AGENTS.md` and `next.config.ts` are excluded from the photography check and the PR. Homepage, collection-page and brand-page editorial selectors, images, copy and layouts remain preserved.

The earlier complete package, package approval, Brincadeira manifest, generation record, contact sheet and collection review are retained byte-for-byte in [before-integration](before-integration/). Old photographs and separate collection/polo approvals remain at their original paths. The new `issue-68-package-v1` combines the previously accepted complete package with only the two newly accepted photographs. It does not claim a new assortment or editorial approval.

Reproduce content/integration verification:

```powershell
bun scripts/content/integrate-catalog-refresh-68.mjs --verify
bun scripts/content/prepare-brincadeira.mjs
bun run validate:content
```

The normal Brincadeira preparation entry point now verifies the integrated revision instead of regenerating a historical batch. Accepted review artifacts are protected against regeneration; integration captures are saved separately.

## Production browser verification

[Browser results](integration/browser-checks.json) verify the production build at **390, 768 and 1440 px**, using the real accepted image URLs and Portuguese alt text, without image substitution. Checks cover successful image responses, responsive source selection, decoded images, card touch/keyboard/hover behavior, model-first and isolated-second gallery order, thumbnails, previous/next controls, enlargement, and gallery reset on switching back to the retained teal colorway. No horizontal overflow or page errors were recorded.

| Width | Product cards | Worn gallery | Isolated gallery |
| --- | --- | --- | --- |
| 390 px | [Cards](integration/cards-390.png) | [Model](integration/gallery-model-390.png) | [Isolated](integration/gallery-isolated-390.png) |
| 768 px | [Cards](integration/cards-768.png) | [Model](integration/gallery-model-768.png) | [Isolated](integration/gallery-isolated-768.png) |
| 1440 px | [Cards](integration/cards-1440.png) | [Model](integration/gallery-model-1440.png) | [Isolated](integration/gallery-isolated-1440.png) |

## Repository validation

- `bun run lint` — passed.
- `bun run typecheck` — passed.
- `bun run validate:content` — passed with the revised package and exact approval evidence.
- `bun run build` — passed, 49 pages generated. For the Playwright metadata check, set `SITE_URL=http://127.0.0.1:3100` during the build as well as at server startup.
- `bunx vitest run --maxWorkers=1` — all 81 tests passed. The default parallel run hit the existing five-second filesystem readiness-test timeout; using one worker passed with the same timeout and no skipped tests or test changes.
- `bun scripts/content/capture-catalog-refresh-68.mjs --integrated` — passed against the production server, with `CATALOG_REVIEW_URL` set to its local URL.
- Catalog and product browser regressions — **36 unique cases passed** in Chromium and mobile Chromium (34 initial passes plus two metadata cases passed after rebuilding with the matching `SITE_URL`).

The catalog/product regression run passed 34 cases initially; its two sharing-metadata cases detected a mismatch between the build's default origin and the test server's configured origin. The build was repeated with the test origin, and both cases then passed. The [integration check record](integration/checks.json) preserves the initial failures and targeted rerun outcome. No application behavior, editorial content or image files changed during verification. The subsequent PR packages this accepted integration; deployment remains separate.
