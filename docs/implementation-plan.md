# Difratelli Kids implementation plan

Status: accepted planning handoff; sequence, ownership, and integration checkpoints confirmed through live review. No storefront implementation or deployment is authorized by this document.

Use [DESIGN.md](../DESIGN.md) for presentation and [implementation specification](implementation-spec.md) for behavior, contracts, acceptance, and release rules. This plan orders work and verification without prescribing every edit. Canonical resolutions govern all three documents. [Define implementation handoff artifacts and detail level](https://github.com/danielluis07/difratelli-kids-v2/issues/12#issuecomment-6086870693) authorized document assembly; [Review implementation completeness and sequencing](https://github.com/danielluis07/difratelli-kids-v2/issues/19) records acceptance after inspecting the actual documents.

## Dependencies and gates

First finish handoff review. Then complete approved content production. Only then begin storefront implementation. Automated/content validation, browser evidence, manual review, candidate approval, and production smoke checks are separate checkpoints. The content-production gate cannot be traded for placeholders; automated passes cannot substitute for human release approval.

The human accepted the stage order below in [Review implementation completeness and sequencing](https://github.com/danielluis07/difratelli-kids-v2/issues/19). Within a stage, internal task organization and equivalent implementations remain flexible. A changed visual direction, shopping behavior, catalog scope, dependencies, or release policy requires another human decision. Any concrete gap becomes a decision ticket with native blockers on affected work.

## Ownership and integration review

Authority: [Review implementation completeness and sequencing](https://github.com/danielluis07/difratelli-kids-v2/issues/19), with the standing release policy in [Define Vercel configuration and the release workflow](https://github.com/danielluis07/difratelli-kids-v2/issues/18#issuecomment-6089098614).

The executing agent prepares production proposals, produces the content and assets within approved briefs, implements the storefront when separately authorized, runs automated checks, and assembles review evidence. It corrects rejected output and surfaces changes outside its agreed autonomy for a human decision.

The human approves catalog/copy and garment briefs, child references, the sample photograph pair, collection photograph batches, identity assets, and the complete content package. The human reviews the integrated result after public pages/browsing, after product/cart/favorites, and after checkout; each checkpoint presents the revision and relevant automated/browser evidence with unresolved defects identified. Obtain checkpoint acceptance before advancing to the next implementation stage. These checkpoints do not replace complete-candidate verification or release approval.

The human approves the exact release candidate, controls hosting purchases and recovery, and retains ownership of the Vercel account. Production approval remains tied to the exact commit and preview under the standing release policy. Planning acceptance grants no authorization to begin content production, implement the storefront, provision hosting, or publish production.

## 1. Review and settle the handoff

Authority: [Define implementation handoff artifacts and detail level](https://github.com/danielluis07/difratelli-kids-v2/issues/12#issuecomment-6086870693), [Assemble the agreed implementation handoff documents for review](https://github.com/danielluis07/difratelli-kids-v2/issues/20).

Human reviews all three documents in Review implementation completeness and sequencing. Check that source authority, precise behavior, module boundaries, production gates, evidence, and release obligations are actionable. Settle this sequencing; resolve any surfaced decisions and update documents before the implementation handoff is accepted.

Exit evidence: review resolution identifies reviewed document revision and accepted sequence, with no known unanswered decision before the next stage. Assembly alone is not final handoff acceptance.

## 2. Produce and approve the complete catalog and copy

Prerequisite: accepted handoff. Authorities: [Define concrete catalog and imagery production contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/14#issuecomment-6087291362), [Choose collection names and creative themes](https://github.com/danielluis07/difratelli-kids-v2/issues/21#issuecomment-6089165766), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Use the three approved collection briefs to propose the complete 30-product catalog and garment briefs. Include permanent IDs/Portuguese slugs, all copy, category/audience/collection allocations, printed/plain/striped split, 42 colorways, sizes, positive regular prices, swatches/shared families, matching-set contents, and explicit curated ordering/selections. Follow the later approved [issue #51 polo revision](content/polo-review.md): six T-shirts and two polos across eight categories; 16 printed, 13 plain and one striped product overall. Preserve ten products, fourteen colorways and the audience allocation in each collection. Approve eight new arrivals and four products per homepage product section; do not manufacture popularity or dates.

Produce hero/collection/brand copy, brand-wide size chart and measuring instructions, product fit guidance, fictional delivery defaults, and all shopping/checkout/error/recovery copy. Use Brazilian Portuguese, exact already-agreed labels/disclosure, modest claims, no washing instructions. The chart's measurements are invented consistent brand measurements without external-standard claims.

Exit evidence: human approval of complete catalog/copy/garment design briefs and curated selections, with all required record fields and no unresolved copy placeholders. This approval precedes photography.

## 3. Approve child references and all required assets

Prerequisite: approved catalog/garment briefs. Authority: [Choose imagery, brand assets, and editorial voice](https://github.com/danielluis07/difratelli-kids-v2/issues/7#issuecomment-6086244718), [Define concrete catalog and imagery production contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/14#issuecomment-6087291362).

Approve eight recurring child-model references and their batches. Produce one sample colorway's worn/isolated pair for approval before full photography. Then produce/review catalog photographs by collection: 84 photographs at minimum 1200 × 1600, 3:4, white backgrounds, consistent garment/child identity, both set pieces visible.

Produce eight editorial photographs with required crops: two static hero, three collection, three brand-page. Reuse collection images in homepage features and approved catalog photographs for category tiles. Separately approve the wordmark (brown/white), three motifs, and favicon, all delivered as editable SVG assets. Correct rejected assets; preserve originals separately from web-ready WebP/SVG files.

Compile the repository-owned catalog/content package and asset manifest with associations, roles/order, usage, dimensions, crops, Portuguese alt text, approval status, and complete web-ready paths.

Exit evidence: approved cast, sample pair, per-collection catalog-photo batches, identity package, editorial/copy/size guidance, and complete manifest whose references resolve. Every required asset/content entry is complete and approved. Storefront implementation must not begin before this gate.

## 4. Establish modules, validated content, and verification infrastructure

Prerequisite: full approved production package. Authorities: [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454), [Choose verification tooling and acceptance evidence](https://github.com/danielluis07/difratelli-kids-v2/issues/17#issuecomment-6088975765).

Read installed Next.js guides for Server/Client Components, Cache Components, route prerendering/Suspense, URL hooks/history, images, metadata, Playwright, and Vitest before code/config changes. Keep Bun/lockfile and existing configuration contracts. Establish catalog, browsing, cart, favorites, checkout, presentation interfaces from the specification. Integrate readonly records and integer money; validate required content with actionable diagnostics and a build-blocking check.

Install/configure already selected Zustand, Vitest, Playwright, and axe with compatible versions. Establish focused tests and GitHub Actions for lint, TypeScript, content validation, focused tests, production build, and production-code browser tests. Select scripts/paths without changing tooling policy.

Exit evidence: full content passes validation; invalid representative records produce record/field errors; module boundaries are inspectable; agreed checks can run reproducibly with Bun. Configuration is framework-compatible. These are future implementation checks, not checks performed during document assembly.

## 5. Build the public shell, editorial routes, and browsing

Prerequisite: validated package/module foundation. Authorities: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

Apply approved fonts/palette/layouts and image interface. Build sticky navigation/Sheets/footer; static split desktop and left-only compact hero; homepage sections; catalog/audience/new-arrival listings; collection index/details; brand; search; and 404/error states. Prerender public content and known product/collection routes. Use manifest assets, responsive art direction/reserved space, current image loading guidance, and application noindex/sharing metadata.

Implement pure browsing rules, URL parsing/serialization and scoped filters/sorts/search. Preserve repeated/scalar encoding, every-word matching, OR/AND, sort ties, history, fresh navigation/reset, and invalid-input behavior. Build cards, color preview/detail links, and all result/empty states. Keep public content independent of personalized hydration.

Exit evidence: all public routes render approved content; mobile/tablet/desktop layouts follow DESIGN.md; static hero and crops correct; URL/browsing focused tests and production browser navigation checks pass; no broken destination or dead-end forms. Accessibility scans and manual keyboard checks begin here and continue through later interactive stages. Present this evidence and integrated public browsing to the human for checkpoint acceptance.

## 6. Implement product interaction, persistent cart, and favorites

Prerequisite: catalog/browsing/shell. Authorities: [Define the shopping journey and simulation boundaries](https://github.com/danielluis07/difratelli-kids-v2/issues/8#issuecomment-6086395963), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

Build product detail/gallery/enlargement/size guidance/related products and selected-color URL behavior. Implement independent persistent Zustand cart/favorite stores: versioned envelopes, tuple identity/quantities, stable references/current prices, product-level favorites, typed outcomes, restoration/status gating, tolerant recovery, independent failures, and once-only feedback.

Wire right-opening cart Sheet, counts, favorite controls/page, selected options, quantity/remove/subtotal/checkout actions. Keep in-memory shopping usable after failed persistence. Preserve accepted last-successful-save behavior across tabs without live synchronization.

Exit evidence: normal journey and missing-size focus, color/size/gallery/history, merges/limits/distinct lines, removal/counts, favorites, refresh/return, obsolete/malformed/unsupported/corrupt storage, duplicate recovery, price-change notices, independent failures, and no hydration overwrite/empty flash pass focused/browser checks. Manual Sheet/dialog focus-return and accessible announcements work. Present this evidence and integrated product/cart/favorites to the human for checkpoint acceptance.

## 7. Implement visit-only checkout and simulated completion

Prerequisite: restored cart and shopping actions. Authorities: [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

Add shared-layout in-memory checkout provider, approved fictional defaults, local touched/errors, field validation, fixed shipping/totals, Pix/card selection, order summary, and empty checkout. Implement validation-before-commit, duplicate guard, immutable completion snapshot, cart/draft clear, favorite retention, exact post-action disclosure, and confirmation discard on exit/reload.

Exit evidence: values survive client navigation but reset on reload; validation triggers/first-invalid focus and payment switching work; integer totals correct; no credentials/order/payment; disclosure timing/exact wording correct; duplicate submission safe; pre-commit failure retains retry state; failed storage write succeeds in memory with warning; confirmation lifetime and stale saved-cart limitation match specification. Present this evidence and integrated checkout to the human for checkpoint acceptance.

## 8. Verify the complete candidate and prepare hosting configuration

Prerequisite: complete storefront contracts. Authorities: [Choose verification tooling and acceptance evidence](https://github.com/danielluis07/difratelli-kids-v2/issues/17#issuecomment-6088975765), [Define Vercel configuration and the release workflow](https://github.com/danielluis07/difratelli-kids-v2/issues/18#issuecomment-6089098614).

Complete all automated checks and representative axe scans against production code across Chromium/Firefox/WebKit/mobile viewports. Walk every page and full journey at all three width classes, including populated/empty/error/loading states. Review keyboard, focus/return, announcements, 200% zoom, reduced motion, NVDA/Chrome and VoiceOver/Safari when available. Review images/crops/touch and visible performance on phone/slower connection. Record actual browsers/devices separately from emulation.

When execution is authorized, configure repository/runtime/build/image/metadata and document Vercel dashboard ownership, integration, main production branch, public preview/production access, plan, and recovery settings. Verify current compatible Beta Bun Functions family, actual versions and successful build/runtime/image behavior. Do not silently substitute Node. Verify hosting eligibility/cost with owner before purchase; paid hosting allowed without an assumed authorized spend. No special first-release bootstrap sequence is imposed.

Create one release-review issue for the candidate commit and public preview, linking automated results/traces and manual evidence. Mark manual checks passed/failed/not checked, with devices/reviewers/observations/screenshots. Link separate defects, assess axe findings, and fix blockers. Record explicit acceptance of permitted cosmetic issues and unavailable-device coverage gaps separately. No quantitative performance gate is introduced.

Exit evidence: candidate meets all release blockers; complete approved content; reproducible build/test evidence; actual compatibility/metadata/image evidence; recorded manual results and accepted exceptions. Obtain human approval tied to this exact reviewed candidate before production publication. Changes invalidate approval until evidence/review are refreshed.

## 9. Publish the approved candidate and verify production

Prerequisite: exact candidate approval. Authority: [Define Vercel configuration and the release workflow](https://github.com/danielluis07/difratelli-kids-v2/issues/18#issuecomment-6089098614).

Merge approved candidate into main to trigger production. Follow approval discipline for every production path; mandatory branch protection is not required. A preview is review evidence, not an artifact-promotion guarantee. Record production commit, deployment identity, and provider URL. Smoke-check catalog/product routes, optimized imagery, shopping/simulation, application noindex and absolute sharing metadata; link evidence from the candidate review issue.

If build fails, fix/reverify/review on a working branch. For published blockers, owner controls restoration to a previous working deployment and records target/reason/results. If none exists, record that limitation. Follow with reviewed fix and reconcile main. After rollback, deliberately restore automatic production-domain assignment when the next approved deployment is ready.

Exit evidence: approved production deployment and successful smoke checks, or explicit failure/recovery record. Custom domain remains deferred.

## Handoff review notes

The final source-consistency review found no substantive contradiction or new planning decision. Clarified that every identity asset, including motifs and favicon, must be delivered as editable SVG. Approved revisions are carried consistently: exact 30-product allocations, static hero, unavailable actual-device checks requiring explicit coverage-gap acceptance. Remaining catalog details, exact copy/measurements, child identities, assets, compatible tool versions, and platform evidence belong to the production/implementation/release gates above; they are not invented or asserted here. The human accepted the sequence, ownership division, and three integration checkpoints, then confirmed that the reviewed revision captures the shared understanding and completes the planning handoff. Stage 1 is complete; the next authorized effort starts with stage 2 catalog/copy production.
