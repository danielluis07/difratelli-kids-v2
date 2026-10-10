# Imaginação em Casa photography — issue #27

Revision: `issue-27-imaginacao-v1`. Status: **all 28 photographs approved by the user**. Technical verification passed under the accepted collection-specific native-resolution revision.

Authority: [issue #27](https://github.com/danielluis07/difratelli-kids-v2/issues/27), [parent specification](https://github.com/danielluis07/difratelli-kids-v2/issues/22), and [photography standard](photography-standard.md). Approved catalog, garment briefs, copy and cast assignments remain unchanged.

Exactly ten products and fourteen colorways have 28 selected photographs, ordered model first and isolated second. Product-006's approved sample belongs to Quintal and cannot count toward this collection. Both pieces of Conjunto Mundo de Blocos appear completely in both roles. Supporting neutral shirts, shorts and shoes on models of individually sold garments are styling only; isolated photographs show only the purchased garment.

## Review the selected batch

[Complete contact sheet](imaginacao-contact-sheet.webp). Each row shows two model/isolated pairs. The links below open individual full-resolution WebP files.

| Product | Colorway | Assigned child / size | Model | Isolated |
| --- | --- | --- | --- | --- |
| product-021 — Camiseta Blocos de Ideias | cream-teal-peach | Caio / 2 | [View](../../public/images/catalog/product-021-cream-teal-peach-model-v1.webp) | [View](../../public/images/catalog/product-021-cream-teal-peach-isolated-v1.webp) |
| product-022 — Camiseta Estrelas de Papel | lilac-cream-teal | Noah / 8 | [View](../../public/images/catalog/product-022-lilac-cream-teal-model-v1.webp) | [View](../../public/images/catalog/product-022-lilac-cream-teal-isolated-v1.webp) |
| product-023 — Blusa Traços de Imaginação | cream-lilac-peach | Nina / 6 | [View](../../public/images/catalog/product-023-cream-lilac-peach-model-v1.webp) | [View](../../public/images/catalog/product-023-cream-lilac-peach-isolated-v1.webp) |
| product-024 — Vestido Histórias de Estrelas | peach-teal-cream | Iara / 8 | [View](../../public/images/catalog/product-024-peach-teal-cream-model-v1.webp) | [View](../../public/images/catalog/product-024-peach-teal-cream-isolated-v1.webp) |
| product-025 — Conjunto Mundo de Blocos | cream-lilac-teal | Theo / 6 | [View](../../public/images/catalog/product-025-cream-lilac-teal-model-v1.webp) | [View](../../public/images/catalog/product-025-cream-lilac-teal-isolated-v1.webp) |
| product-026 — Casaco Rabiscos de Casa | cream-lilac-teal | Noah / 8 | [View](../../public/images/catalog/product-026-cream-lilac-teal-model-v1.webp) | [View](../../public/images/catalog/product-026-cream-lilac-teal-isolated-v1.webp) |
| product-027 — Blusa Cor de História | lilac | Bia / 6 | [View](../../public/images/catalog/product-027-lilac-model-v1.webp) | [View](../../public/images/catalog/product-027-lilac-isolated-v1.webp) |
| product-027 — Blusa Cor de História | cream | Bia / 6 | [View](../../public/images/catalog/product-027-cream-model-v1.webp) | [View](../../public/images/catalog/product-027-cream-isolated-v1.webp) |
| product-028 — Short Canto de Brincar | peach | Lia / 4 | [View](../../public/images/catalog/product-028-peach-model-v1.webp) | [View](../../public/images/catalog/product-028-peach-isolated-v1.webp) |
| product-028 — Short Canto de Brincar | cream | Lia / 4 | [View](../../public/images/catalog/product-028-cream-model-v1.webp) | [View](../../public/images/catalog/product-028-cream-isolated-v1.webp) |
| product-029 — Calça Cantinho de Ideias | teal | Theo / 6 | [View](../../public/images/catalog/product-029-teal-model-v1.webp) | [View](../../public/images/catalog/product-029-teal-isolated-v1.webp) |
| product-029 — Calça Cantinho de Ideias | cream | Theo / 6 | [View](../../public/images/catalog/product-029-cream-model-v1.webp) | [View](../../public/images/catalog/product-029-cream-isolated-v1.webp) |
| product-030 — Calça Faz de Conta | lilac | Noah / 8 | [View](../../public/images/catalog/product-030-lilac-model-v1.webp) | [View](../../public/images/catalog/product-030-lilac-isolated-v1.webp) |
| product-030 — Calça Faz de Conta | peach | Noah / 8 | [View](../../public/images/catalog/product-030-peach-model-v1.webp) | [View](../../public/images/catalog/product-030-peach-isolated-v1.webp) |

## Resolution decision

The first model photograph returned at native 1086 × 1448 despite an explicit 1536 × 2048 request. The built-in generator exposes no output-size control. The user replied “approved” to the presented choice between accepting native 1086 × 1448 for this collection and trying compliant output through Higgsfield. [imaginacao-resolution-acceptance.json](imaginacao-resolution-acceptance.json) records that collection-specific acceptance. It revises dimensions only and does not approve the complete image batch.

Every selected original and WebP export measures exactly 1086 × 1448, exact 3:4, without enlargement, cropping or resizing. A near-3:4 set-isolation result at 1087 × 1447 was rejected and regenerated. The selected set isolation passes the exact aspect ratio.

## Production and inspection

The built-in image generator produced every photograph. Every model request used the assigned approved child reference. Plain second colorways also used the selected first colorway to preserve identity and garment construction. Every isolated photograph referenced the exact selected worn photograph. Complete prompts, actual input paths and original hashes are retained in [imaginacao-generation.json](imaginacao-generation.json); actual input hashes also appear in the manifest.

Retakes corrected oversized dress stars, set shorts fabric/construction and print shapes, cardigan print colors and crayon marks, trousers rendered as shorts, and invented fly-like stitching/belt loops. Local seam-removal edits were inspected before pairing or colorway changes. Five unapproved construction drafts remain separately under `assets/originals/catalog-inputs/` because they were exact inputs to selected correction requests. They are production inputs, excluded from the 28 catalog photographs, WebP exports and contact sheet.

All selected photographs were inspected for white backgrounds, complete framing, apparent child identity, garment construction, fabric appearance, print/color matching and set completeness. Encoded images were inspected through the contact sheet, with individual full-resolution exports checked for fine print, rib fabric and corrected front seams. Printed motif scale and displayed fabric colors are visual judgments; images are not calibrated physical measurements. Automated checks do not establish human visual acceptance.

**Accepted visual exception:** a faint residual fly-like center-front outline remains in the isolated teal trousers for product-029, despite the seam-removal pass. Its approved brief excludes a fly. The final review explicitly disclosed this detail and asked whether to approve the complete batch including the exception or regenerate that image. The user replied “approved.” [imaginacao-approval.json](imaginacao-approval.json) records acceptance for this exact original/WebP hash pair only. The photograph and original garment brief remain unchanged.

## Deliverables and verification

- [Manifest](imaginacao-manifest.json): 28 stable product/colorway/role associations, explicit gallery order, original and WebP paths, measured dimensions, SHA-256 hashes, exact input references, full-frame crop, usage and Brazilian Portuguese alt text.
- [Generation record](imaginacao-generation.json): actual selected prompts, tool, source paths, references, original hashes, native dimensions and recorded approval status.
- [Requests](imaginacao-requests.json): complete approved garment briefs, colors, cast assignments, Portuguese alt text and intended usage. Requests are not approvals.
- Originals: `assets/originals/catalog/product-021-…` through `product-030-…`, 28 selected PNGs totaling 45,280,828 bytes.
- Web exports: `public/images/catalog/product-021-…` through `product-030-…`, 28 quality-90 WebP files totaling 2,026,116 bytes.
- Preparation commands: `bun scripts/content/prepare-imaginacao-requests.mjs` and `bun scripts/content/prepare-imaginacao.mjs`.

Full preparation passed for ten products, fourteen colorways and exactly 28 unique associations. It verified approved catalog/copy hashes, offered photographed sizes, assigned approved child-reference hashes, exact selected-worn references for isolated photographs, exact native 3:4 dimensions, accepted minimum dimensions, opacity, unchanged export dimensions, original hashes, Portuguese alt/provenance fields and exact selected-folder counts. ESLint passed for all three new content scripts. No storefront code changed.

Reviewed manifest SHA-256: `5a7533149522ffca1e1a6b6e68fedf9d31fe8a0ffe3ebcf9e4a59eddb0108dfc`.

Reviewed contact sheet SHA-256: `2e1708cbc66622a99a58e10c33a7ab7ac1eb86d482eddbb529a74fcfc6df7362`.

## Approval outcome

The user replied “approved” to the complete batch, including the expressly disclosed isolated teal-trouser detail. [imaginacao-approval.json](imaginacao-approval.json) records the reviewer, decision evidence, timestamp (`2026-10-10T02:29:50Z`), reviewed revision, reviewed manifest/contact-sheet hashes, all 28 original/WebP hash pairs and the accepted exception. No corrections were requested.

The preparation script was rerun after approval: all 28 photographs match the approval record and zero remain pending. All 56 original/export hashes and the reviewed contact-sheet hash are unchanged. Only approval metadata and review documentation changed.

Issue #27’s production and approval requirements are satisfied locally under the explicit collection-specific resolution revision and accepted photograph exception. Replacements invalidate the affected approval. Complete-content, integration and release approvals remain separate. No GitHub issue state was changed.

Approved manifest SHA-256: `9c57b235c4ab5bbad3cde5dc402c4aeb042115a84b7b90425b8e6757a5564439`.
