# Difratelli Kids implementation specification

Status: accepted planning handoff following final human confirmation. This specifies the future storefront; it does not claim implementation, approved production content, passing tests, or a deployment.

[DESIGN.md](../DESIGN.md) owns presentation; [implementation plan](implementation-plan.md) records the agreed dependencies, ownership, and checkpoints. Use [GLOSSARY.md](../GLOSSARY.md) for Product, Collection, Matching set, Colorway, Color family, Catalog imagery, Editorial imagery, Child model, Simulated checkout, and Favorite.

## Authority and scope

Authority: [Define implementation handoff artifacts and detail level](https://github.com/danielluis07/difratelli-kids-v2/issues/12#issuecomment-6086870693), [Map the Difratelli Kids storefront decisions through deployment](https://github.com/danielluis07/difratelli-kids-v2/issues/1).

Build a convincing fictional everyday kidswear showcase for prospective clients, ages 2–8, with accessible mid-range prices. Site copy is Brazilian Portuguese; documentation, communication, code, and identifiers are English. Bun is required. There is no backend implementation, catalog API, database, real order, payment, or purchase-contact endpoint.

Canonical issue resolutions govern disagreements. This specification translates them into requirements without repeating discussions. Explicit later revisions replace the earlier approximate catalog quantities, alternating desktop hero, and unconditional actual-device coverage gate. Do not choose silently between conflicting requirements; surface a decision ticket. Final human acceptance is recorded in [Review implementation completeness and sequencing](https://github.com/danielluis07/difratelli-kids-v2/issues/19).

Implementers may choose function names, files within module boundaries, internal helpers, equivalent techniques, exact compatible dependency versions, and test organization while preserving these observable contracts. Changes to visual direction, shopping behavior, catalog scope, dependencies, or release policy require another human decision. The already selected Zustand, shadcn Sheet, Next image treatment, Playwright, Vitest, axe, and Vercel are standing constraints.

## Routes and navigation

Authority: [Choose the storefront structure and homepage opening](https://github.com/danielluis07/difratelli-kids-v2/issues/6#issuecomment-6086002380), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

| Surface | Route and contents |
| --- | --- |
| Homepage | `/`; approved editorial and merchandising sequence in DESIGN.md |
| Full catalog | `/produtos` |
| New arrivals | `/novidades`; eight curated products |
| Girls / boys | `/meninas`, `/meninos`; relevant audience plus products suitable for both |
| Collections index | `/colecoes`; three collections |
| Collection detail | `/colecoes/[slug]`; story, photograph, ten products |
| Product detail | `/produto/[slug]`; one product and selected options |
| Brand | `/sobre`; approved editorial content |
| Search | `/busca?q=...` |
| Favorites | `/favoritos`; saved products |
| Checkout / temporary confirmation | `/checkout` |

Portuguese slugs are separate from permanent English IDs. Category links filter the relevant listing; do not add category routes. Cart is a right-opening Sheet with no standalone route; confirmation stays within checkout. Navigation is Novidades, Meninas, Meninos, Coleções, Sobre a Difratelli. Search submits to results, heart opens favorites, cart opens its Sheet. Compact navigation retains every destination.

Comprar para meninas / Comprar para meninos link to their listings. Homepage Ver todos links to the corresponding listing or collection. Related products are up to four other products from the same collection in curated order. Unknown products, collections, or paths return a 404 with a catalog link. Supporting editorial pages add no forms.

## Catalog and content contracts

Authority: [Define the Difratelli Kids catalog scope](https://github.com/danielluis07/difratelli-kids-v2/issues/5#issuecomment-6085814860), [Define concrete catalog and imagery production contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/14#issuecomment-6087291362), [Choose collection names and creative themes](https://github.com/danielluis07/difratelli-kids-v2/issues/21#issuecomment-6089165766), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

### Assortment

Exactly 30 distinct products, clothing only; accessories and footwear are excluded. A matching set is one product containing two pieces sold together. Each product belongs to exactly one collection and offers sizes 2, 4, 6, 8, with every option available.

| Category | Products | Regular BRL price range |
| --- | --- | --- |
| T-shirts | 6 | R$49–79 |
| Polos | 2 | R$79 |
| Tops | 4 | R$49–79 |
| Shorts | 5 | R$69–119 |
| Trousers | 4 | R$69–119 |
| Dresses | 3 | R$99–159 |
| Matching sets | 4 | R$119–179 |
| Light layers | 2 | R$99–149 |

Each of three collections has ten products and fourteen colorways. The user-approved [issue #51 polo assortment](content/polo-assortment-approval.json) replaces two boys' printed T-shirts with separate solid and striped polos, each with one colorway. Quintal has five printed and five plain products (the cream polo has one colorway; the other four plain products retain two). Brincadeira has five printed, four plain and one striped product. Imaginação retains six printed and four plain products. Total: 16 printed, 13 plain, one striped, 42 colorways, 84 active catalog photographs. Each collection has four girls' products, four boys' products, and two suitable for both: disjoint overall counts of 12/12/6. Products suitable for both appear in both audience views without duplicate catalog records. Every printed separate has at least one coordinating plain separate in its own collection. Solid and striped polos use 100% cotton piqué, a relaxed straight fit, short sleeves and two tonal buttons, without logos or contrasting trim. Both cost R$79 and retain all four offered sizes. Earlier photograph approvals apply only to the unchanged assets; exact replacement files require revised human content approval.

Prices are regular, consistent within categories, and shared across a product's sizes/colorways. No launch discounts.

### Collection creative briefs

| Public name | Theme | Garment palette | Prints / story direction |
| --- | --- | --- | --- |
| Quintal de Descobertas | Exploring a garden and noticing little things | Cream, leaf green, deep teal, butter yellow | Airy hand-drawn leaves, beetles, small discoveries; curiosity during an afternoon outside |
| Brincadeira de Rua | Hopscotch, bicycles, chalk, movement | Cream, sky blue, deep teal, soft coral | Chalk-like hopscotch, looping bicycle paths, irregular stripes; neighborhood play and friendship |
| Imaginação em Casa | Drawing, blanket forts, invented stories | Cream, soft lilac, deep teal, peach | Crayon marks, building-block shapes, simple scattered stars; ordinary things becoming imaginary worlds |

Shared cream and deep teal coordinate all collections. Keep a restrained number of print colors and motifs legible on small garments. Themes serve all audiences. These garment palettes do not replace the website palette. Final stories, precise garment colors, print artwork, names, and individual designs require production approval; do not treat these briefs as completed content.

### Repository record interface

Use readonly TypeScript records in one repository-owned catalog. Required logical fields and relationships are:

| Record | Required contract |
| --- | --- |
| Product | Permanent English ID; unique Portuguese slug; Portuguese name, short description, composition, fit guidance; category, audience, collection; positive integer-centavo price; offered sizes; colorways and default colorway; garment design brief including matching-set contents where applicable; curated ordering |
| Colorway | ID scoped to its product; Portuguese name, swatch, shared color-family associations; ordered model/isolated photograph references |
| Collection | Permanent English ID, Portuguese name/slug, short story, photograph references, product IDs in curated order |
| Merchandising | Explicit product-ID selections: eight new arrivals, four products per homepage product section, approved category-tile selections |
| Asset | Stable reference/path, dimensions, role, Portuguese alt text where applicable, usage/crops, approval status, product/colorway associations and child-model identity where applicable |
| Size guidance | Approved brand-wide body measurements for 2/4/6/8: height, chest, waist, hips in centimetres; short measuring instructions |
| Editorial/UI copy | Approved hero heading/supporting sentence, collection stories, brand content, shopping/checkout labels, fictional defaults, validation and recovery messages |

IDs are independent of display copy, for example `product-001`, `collection-001`, `model-001`; colorway IDs need only be unique within their product. Filenames identify product, colorway, and photograph role. Money is integer BRL centavos, formatted only for display. Do not invent product dates or popularity to derive approved merchandising. Color-family labels and associations are approved with the catalog. Washing instructions are excluded; comfort/material claims remain modest and internally consistent. Size measurements are invented brand measurements without claiming an external standard.

Validate unique IDs/slugs, relationships, offered/default options, prices, assortment and allocation totals, merchandising, and required approved content/assets. Every required reference resolves; errors identify record and field. Invalid required content blocks build/readiness. Browser storage has separate tolerant recovery below.

### Production package and image contract

Authority also: [Choose imagery, brand assets, and editorial voice](https://github.com/danielluis07/difratelli-kids-v2/issues/7#issuecomment-6086244718).

All photographs are AI generated. First approve eight recurring fictional child models: four girls and four boys spanning younger and older ages within 2–8 with varied appearances. Preserve each identity across their batch and use the same child across a product's colorways.

Each colorway has two white-background photographs: child wearing the approved garment, then isolated garment. Color, print, and silhouette match the product and paired image. Both pieces of matching sets are visible. Each is 3:4, at least 1200 × 1600px; preserve the whole garment. Deliver web-ready WebP files separately from retained higher-resolution originals. Reuse pairs on cards/details.

Eight editorial photographs are required: two static hero, three collection, three brand-page (opening plus two sections). Reuse collection photographs in homepage features and catalog photographs in category tiles. Editorial clothing fits the offering but need not identify a purchasable product. Provide desktop/mobile crops where needed, preserving faces/clothing; record dimensions/usage in the manifest. Follow DESIGN.md ratios and hero text space.

Identity package: wordmark in brown and white, three motifs, and favicon, all delivered as editable SVG assets, with transparency where appropriate. Approve separately. Generation tools are producer choice within these outputs. No further font prototype is required.

Before implementation, approve collection themes (resolved), complete catalog/copy/garment briefs, child references, one sample colorway's paired photographs, remaining catalog photographs by collection, required editorial assets/copy/size guidance, and identity package. Correct rejected assets. Deliver complete catalog, manifest, approved copy, size guidance, and separate originals/web-ready files. Every required entry is approved and every reference resolves. No placeholders, reduced assortment, or missing-asset waiver is permitted.

## Modules and rendering

Authority: [Choose frontend architecture and local catalog and state boundaries](https://github.com/danielluis07/difratelli-kids-v2/issues/10#issuecomment-6086624845), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

| Module | Callable interface and ownership |
| --- | --- |
| Catalog | Records, validation, ID/slug lookup, curated selections, assets; missing lookup returns explicit absence |
| Browsing | Route scope plus query/filters/sort → ordered products and count; URL parsing/serialization |
| Cart | Separate persistent Zustand store; add selection, set quantity, remove, clear; resolved lines, units, subtotal, restoration/persistence status |
| Favorites | Separate persistent Zustand store; toggle, membership, saved products/count, restoration/persistence status |
| Checkout | Visit-only draft updates, delivery validation, integer totals, simulated completion, confirmation discard |
| Presentation | Render results, invoke actions, translate typed outcomes into approved feedback |

Catalog and browsing are independent of React/Zustand. Invalid commands keep state unchanged and return a typed reason. UI never writes directly to stored arrays. Temporary selection/open-menu state is local to components.

Server Components own layouts, editorial content, metadata, catalog-backed route content. Client Components own interactive listings, selections/gallery, search controls, favorites, cart, checkout. Prerender public content and every known product/collection route. Focused Suspense fallbacks surround URL-dependent client regions as required by installed Next.js documentation. Browser stores do not participate in server rendering. Public content appears immediately; restoration gates personalized controls/actions.

Repository baseline at assembly: Next.js 16.4.0, React 19.3.0, Bun packageManager 1.4.2, committed bun.lock, starter App Router, Cache Components and partial prefetching enabled, shadcn configuration present. Zustand and test tooling are not installed/configured yet. Read relevant `node_modules/next/dist/docs/` guides before code/configuration changes; preserve the runtime and rendering contracts rather than importing old framework assumptions. Prerendering is not a static-export requirement.

Image interface accepts asset reference and placement and obtains manifest dimensions, alt text, crops. Web-ready files live under `public/`; originals separately. Use `next/image` for raster optimization and responsive picture treatment for distinct art-directed crops. Reserve space, supply accurate responsive sizes, lazy-load below-opening imagery, and choose opening-image hints using actual layout/performance evidence. The installed Image documentation deprecates `priority`; follow current guidance. Image failure preserves space and readable fallback without relaxing the asset gate.

## Browsing and URL contract

Authority: [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

| Parameter | Meaning / encoding |
| --- | --- |
| `categoria` | Category; repeated key for multiple values |
| `tamanho` | Offered size; repeated key |
| `familia` | Shared color family; repeated key |
| `colecao` | Stable collection ID; repeated key |
| `publico` | Audience; repeated key |
| `ordem` | Sort; first scalar occurrence |
| `q` | Search query; first scalar occurrence |
| `cor` | Product colorway; first scalar occurrence |

Identifier values are stable English catalog values; display text remains Portuguese. Example: `?categoria=t-shirts&tamanho=4&familia=blue&colecao=collection-001&publico=girls&ordem=preco-asc`. This illustrates encoding, not an approved production color-family dataset.

Collect valid unique filter values; serialize consistently and omit empty filters/default sort. Category/size/color/collection filters apply where relevant; audience applies on full catalog/search. OR within a filter, AND across filters. Ignore unknown parameters/values and irrelevant filters. Scalars use first occurrence and invalid values fall back to approved defaults. Do not rewrite incoming URLs automatically; later user changes serialize canonically.

Sort: curated, lowest price, highest price. Equal-price ties use curated order. Show all results without pagination. Committed filter/sort changes add history entries and update immediately. Refresh/Back/Forward preserve URL state; URL is authoritative. Reset filters retains route scope or search query. Ordinary shopping navigation resets filters except the category expressed by a category link; new search submission resets filters. Valid zero-result combinations show count zero and Limpar filtros.

Search matches product names, categories, collection names: partial words, every entered word matching somewhere across fields, case/accent insensitive. Trim and collapse whitespace, retain spelling in URL, normalize for matching. Enter or search button submits; no autocomplete. Blank query prompts; no match shows message/catalog link. Opening search starts with the current results query where applicable; closing without submission preserves the page. No persisted last-used search; explicit URL reopen/share/refresh/Back retains its query.

## Product, cart, and favorites behavior

Authority: [Define the shopping journey and simulation boundaries](https://github.com/danielluis07/difratelli-kids-v2/issues/8#issuecomment-6086395963), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

Default colorway initially selected; size initially unselected. Card swatches preview colorway imagery and carry that choice to detail via `cor`. Invalid color falls back to default. User color changes replace the current history entry, retain selected size, and reset gallery to the first photograph. URL navigation causing color changes does the same. Respect gallery/enlargement/size-guidance presentation in DESIGN.md.

Adding without size shows Selecione um tamanho and focuses the selector. Quantity starts at one, 1–10 per product/colorway/size tuple. Repeated additions merge up to ten; exceeding the limit retains maximum and explains. Different tuples remain separate. Actions report added, merged, quantity limited, or invalid selection. Add feedback is brief/accessibly announced and does not open cart. Decrement stops at one; removal is separate, immediate, with no confirmation. Header cart count is total units. Cart displays current catalog price and subtotal.

Favorites save products independently of options; default colorway for presentation, normal detail selection for buying. Removal updates the view immediately. Header favorite count is saved products. Cart/favorites persist independently in the same browser without an account.

## Browser persistence and recovery

Authority: [Choose frontend architecture and local catalog and state boundaries](https://github.com/danielluis07/difratelli-kids-v2/issues/10#issuecomment-6086624845), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

| Store | Persistence contract |
| --- | --- |
| Cart | `difratelli.cart`, versioned JSON envelope starting at version 1; lines `{ productId, colorwayId, size, quantity }` plus `lastSeenUnitPriceCents` solely for price-change comparison |
| Favorites | `difratelli.favorites`, versioned JSON envelope starting at version 1; product IDs only |

Current catalog prices always govern totals; saved comparison price is not authoritative. Restoration and persistence statuses are exposed, never persisted. Future format changes need explicit migrations.

Restore stores independently after mounting. Do not overwrite saved content with initial empty state. Neutral pending counts/indicators and blocked dependent actions avoid false empty flashes; public content remains visible.

Validate entries against current catalog. Remove missing products/colorways/sizes without substitution; remove unavailable favorites and deduplicate IDs. Merge duplicate cart lines, cap valid positive integer quantities at ten, discard malformed quantities. Recover valid entries from readable envelopes. Announce removals, quantity corrections, and price changes once per restoration.

Unreadable JSON/envelopes or unsupported versions remain untouched and use temporary state. Unsupported versions are not migrated implicitly. Blocked/failed reads leave usable temporary shopping with a brief explanation. A write failure after a successful action keeps in-memory results, marks only the affected store temporary, and warns once that changes cannot survive visits. Do not roll back shopping because storage failed. Store recovery/failure is independent.

There is no live multi-tab synchronization. Each tab restores on opening and saves its own changes; last successful save wins independently per store. Concurrent tabs may overwrite changes. This accepted limitation must not turn into an unapproved consistency guarantee.

## Checkout and simulation

Authority: [Define the shopping journey and simulation boundaries](https://github.com/danielluis07/difratelli-kids-v2/issues/8#issuecomment-6086395963), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

In-memory checkout module belongs to a Client provider in the shared layout, separate from persistent stores. Edited fictional delivery defaults and payment selection survive client navigation within the visit; document reload restores defaults. Errors/touched state remain local to the form.

| Delivery field | Validation |
| --- | --- |
| Name | Required, nonempty after trim |
| Email | Required, conventionally valid format |
| CEP | Required, eight digits |
| Street | Required, nonempty after trim |
| Number | Required, nonempty after trim; `s/n` accepted |
| Neighborhood | Required, nonempty after trim |
| City | Required, nonempty after trim |
| Brazilian state | Required, selected from Brazilian state list |
| Address complement | Optional |

Validation is local without address lookup; on leaving an edited field and on submission, with no errors before interaction. Invalid submission preserves values, shows inline errors, focuses first invalid field. Payment changes preserve delivery values. No CPF, phone, coupons, installment controls, or payment credentials.

One shipping option: 1,590 centavos (R$15,90), 5–8 business days independent of address. Shared pure validation/totals functions use integer centavos; total is merchandise plus shipping. Pix initially selected, card alternative, neither causes payment or a real order.

Finalizar compra validates current draft and cart, guards duplicates, and creates an immutable completed item/price/total snapshot. On commit, clear cart/draft, retain favorites, display snapshot and exactly:

> Esta compra foi uma simulação. Nenhum pagamento foi realizado e nenhum pedido foi criado.

No earlier fictional-store notice, site-wide notice, or checkout-entry demo label is permitted. No invented order number or email promise. Continuar comprando opens `/produtos`. Confirmation exists only while remaining on the completed checkout screen; leaving or reloading discards it. Returning shows current cart or empty-cart state; no persistent history.

Pre-commit failure retains cart and draft for retry. Storage-write failure still counts as successful in-memory completion with a persistence warning; old saved cart data may return on reload. This is an explicitly accepted limitation, not a transaction rollback.

## Empty, error, loading, and accessible states

Authority: [Define responsive behavior, accessibility, and interaction quality](https://github.com/danielluis07/difratelli-kids-v2/issues/9#issuecomment-6086531343), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Empty cart/favorites/checkout offers Explorar produtos. Zero filtered results offers Limpar filtros; unmatched search offers catalog link; blank search offers prompt. Unknown paths offer 404/catalog link. Unexpected page error offers Tentar novamente/home link. Image failure retains reserved space/readable fallback. Local updates are immediate with no artificial delays; personalized controls await restoration. Preserve keyboard operation, focus, labeled controls, contrast/touch targets, inline errors, announcements, Sheet/dialog focus and return, and reduced motion as specified in DESIGN.md.

## Verification and acceptance evidence

Authority: [Define showcase verification and deployment readiness](https://github.com/danielluis07/difratelli-kids-v2/issues/11#issuecomment-6086731750), [Choose verification tooling and acceptance evidence](https://github.com/danielluis07/difratelli-kids-v2/issues/17#issuecomment-6088975765).

Use Vitest for focused catalog/browsing/recovery/checkout rules, Playwright for visitor journeys/browser behavior, and `@axe-core/playwright` for representative accessibility scans. Do not require every presentational component to have unit tests. Async Server Component verification belongs in E2E per installed guidance. GitHub Actions runs lint, TypeScript, content validation, focused tests, production build, and browser tests against production code in Chromium/Firefox/WebKit with mobile viewport coverage. Exact versions/scripts/organization remain implementation choices.

| Acceptance area | Required observable evidence |
| --- | --- |
| Content | Invalid IDs/slugs/relationships/options/prices/counts/selections/assets fail with record/field diagnostics; full approved package passes |
| Browsing | Every-word partial/accent-insensitive search; filter OR/AND; sort ties; repeated/scalar/unknown/invalid URL cases; canonical changes; refresh/Back/Forward; fresh navigation/reset |
| Shopping | Missing-size focus; color retains size/resets gallery; tuple identity, merges/limits/distinct selections/removal/counts; product-level favorites; independent persistence |
| Recovery | Corrupt/unsupported storage untouched; recover valid entries; obsolete selections removed; deduplication/quantity correction; current prices/once-only notices; independent read/write failure; usable memory after failed writes |
| Hydration | Immediate public content, restoration-gated actions, no false empty flash or initial overwrite |
| Checkout | Field validation/focus/value preservation; integer totals; navigation/reload lifetime; duplicate protection; pre-commit retry; immutable summary |
| Simulation | Exact post-action disclosure; no credentials/real transaction/order; cart/draft clear, favorites retain; confirmation discarded on exit/reload; accepted failed-write behavior |
| Empty/failure | Useful actions, 404, page retry, reserved image fallback; missing content still blocks readiness |
| Accessibility | Representative pages, open navigation/cart/dialogs, checkout errors/completion scanned with axe; each finding fixed or assessed; manual review retained |

Tests respect the accepted lack of live multi-tab synchronization.

Manual review walks the full journey and every page at mobile/tablet/desktop widths, with populated/empty/validation/failure states. Review static split desktop/left-only compact hero, crops, loading, touch, keyboard/focus/dialogs, error correction, announcements, 200% zoom, reduced motion. Use NVDA with Chrome; add VoiceOver/Safari when available. Intended journey coverage: Chrome, Firefox, Safari, iPhone Safari, Android Chrome. Record actual browser/OS/device versus emulation.

Judge loading, responsiveness, image delivery, layout shifts on a phone/slower connection manually, recording conditions/observations. No numeric score or threshold gates. Missing actual browser/device checks are **not checked**, with explicit human acceptance of the coverage gap before publication; emulation does not convert them into passes. This revises the earlier unconditional coverage expectation.

One GitHub release-review issue per candidate records commit/preview, reports/traces, each manual result (passed/failed/not checked), reviewer/device details, screenshots/observations, separate linked defects, and approvals. Assess every axe finding. Broken shopping, persistence without approved recovery, incorrect simulation, accessibility barriers, missing imagery, major layout issues, visibly poor loading/responsiveness block release. Minor cosmetic defects need explicit acceptance; coverage-gap acceptance is separate. Automated passes alone do not authorize publication.

## Hosting and release contract

Authority: [Define Vercel configuration and the release workflow](https://github.com/danielluis07/difratelli-kids-v2/issues/18#issuecomment-6089098614).

The driving developer's personal account owns Vercel and authorizes production. Integrate GitHub; main is production, working branches/PRs create publicly accessible previews. Production is public too; configure Deployment Protection accordingly. Start with provider URL, defer custom domain. Track runtime/build/image/metadata configuration in repo; document dashboard integration/branch/access/account-plan/recovery settings.

Use committed lockfile and Bun build script. Accept Beta Bun Functions where applicable; package-manager selection alone does not select Functions runtime. Configure `bunVersion` in `vercel.json` using a currently supported compatible family (the approved resolution recorded 1.4.x). Provider manages patches; verify current support and record actual build/runtime compatibility during implementation. Do not silently fall back to Node.js. Standard managed Next deployment/image optimization preserves prerendering; no static export or separate image host is required.

Explicit application noindex policy covers previews and production while preserving polished titles/descriptions/sharing image. Verify responses and valid absolute sharing URLs against each intended origin. Provider preview headers supplement application policy.

Human approval in candidate review issue binds exact commit and preview before merge into main; changed candidates require refreshed evidence/approval. Approved merge automatically triggers a production build; do not claim preview artifact promotion. Record production commit/deployment/URL and smoke-check routes/images/shopping/simulation/indexing/sharing. Approval is release discipline, not mandatory technical branch protection; direct pushes/dashboard/CLI/config changes honor it. No special first-release sequence is prescribed.

Failed build is not a release; fix on a working branch, rerun affected checks, review again. Published blockers require human-controlled restoration of previous working deployment, reason/target/evidence, and restored-URL verification. If none exists, owner controls recovery and records that limitation. Reconcile main after a reviewed fix; rollback may disable automatic production-domain assignment, so restore normal publication deliberately.

Paid hosting is acceptable if needed, but no plan/price/purchase is authorized. Verify current eligibility/pricing/usage with owner before purchase; do not assume Hobby eligibility for a client-acquisition showcase. Runtime/provider compatibility and actual deployment evidence are future verification obligations, not asserted successes.

## Completeness boundaries

All detailed prerequisite decisions are resolved. The final source-consistency review identified no substantive contradiction or new planning gap. Remaining creative content and measurements are explicitly governed production approvals, not agent-invented values. The human accepted the plan's sequence, ownership, and integration checkpoints and confirmed the complete planning handoff. There is no claim that the current starter implements these contracts or that the future catalog/assets/tests/hosting already exist. New specific gaps found during subsequent work require a human decision before affected work proceeds.
