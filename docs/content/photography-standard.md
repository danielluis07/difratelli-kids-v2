# Photography standard — issue #24

Revision: `issue-24-cast-v3`. Authority: [issue #24](https://github.com/danielluis07/difratelli-kids-v2/issues/24), [implementation specification](../implementation-spec.md#production-package-and-image-contract), and [delivery plan](../implementation-plan.md#3-approve-child-references-and-all-required-assets).

## Production gates

Catalog, copy and garment briefs are approved in [approval.json](approval.json). The eight current cast references and their product assignments in [cast-proposal.json](cast-proposal.json) are approved in [cast-approval.json](cast-approval.json). Cast references use neutral casting clothes; they are identity references, not catalog photographs or proposed changes to approved garments.

After cast approval, produce and present the `product-006` / `cream-teal-leaf` sample pair on `model-006` (Davi), photographed in size 4. Record human approval of the exact worn and isolated images before producing collection batches. The sample exercises a printed two-piece set. Approving cast references does not approve this future pair.

Then produce catalog batches for `collection-001`, `collection-002` and `collection-003`. Each batch has 14 colorways and 28 photographs. An approved sample may count toward its collection batch. Collection-batch review and the complete-content gate remain separate approvals.

## Identity and garment continuity

- Use the actual approved reference file for the assigned child in every worn-image request. Preserve apparent age, face shape, complexion, eyes, hair texture/color/length and body proportions. Text descriptions aid production but do not replace image references.
- Keep one assigned child for all colorways of each product. Product assignments cover all 30 products once; products suitable for both audiences still have one assignment.
- Supply the approved catalog record, garment brief, colorway colors and included pieces. Do not add logos, slogans, trim, pockets, closures or other features absent from that brief.
- Generate the worn photograph first. Inspect it against the garment brief, then use that exact worn image as the garment reference for the isolated photograph. Preserve silhouette, fabric, collar, sleeve/hem length, pocket/waist details, print shapes/scale/placement and color relationships.
- Do not promise identical future generations. Retain exact input references, intent/prompt, tool, output files, hashes and any generation settings/job identifiers the tool actually exposes. Visually review every output and correct drift.

## Photograph and export contract

Catalog photographs have an opaque white seamless background, soft neutral studio lighting and natural texture. Use a frontal or near-frontal relaxed pose with arms clear of the garment. Keep the complete garment within the frame with breathing room. Matching sets show both complete pieces in both photograph roles. Avoid props, accessories that cover garments, embedded text and watermarks.

Each catalog original and web-ready file must be portrait 3:4, at least 1200 × 1600 pixels. Request 1536 × 2048 or larger 3:4 output. Measure the actual output rather than trusting the request. An undersized result requires regeneration; enlargement does not establish a compliant original. Casting references are not catalog photographs and retain their actual native dimensions.

Keep source originals under `assets/originals/cast/` and later `assets/originals/catalog/`. Place derived WebP references under `public/images/cast/` and later catalog files under `public/images/catalog/`. Never overwrite source originals during conversion. Convert with the repository's installed Sharp dependency, preserve the complete frame and use WebP quality 90. Record actual encoded dimensions and file SHA-256 hashes. Inspect encoded images for loss of small print details or edge artifacts before acceptance. Do not claim a hex color is a fabric or screen calibration guarantee.

Catalog names identify all associations:

```text
assets/originals/catalog/product-006-cream-teal-leaf-model-v1.png
assets/originals/catalog/product-006-cream-teal-leaf-isolated-v1.png
public/images/catalog/product-006-cream-teal-leaf-model-v1.webp
public/images/catalog/product-006-cream-teal-leaf-isolated-v1.webp
```

Keep gallery order explicit: model first (1), isolated garment second (2). For each asset record product ID, colorway ID, model ID where applicable, photographed size, role/order, source/web paths, dimensions, hashes, usage, full-frame crop and Brazilian Portuguese alt text. Proposed sample alt text:

- Model: `Criança usando o Conjunto Descobertas, com camiseta creme estampada com folhas e besouros e short verde-petróleo; as duas peças aparecem inteiras.`
- Isolated: `Conjunto Descobertas com camiseta creme estampada com folhas e besouros e short verde-petróleo, apresentado sem modelo sobre fundo branco.`

## Human acceptance record

Approval must name the reviewed revision, assets and SHA-256 hashes, reviewer, explicit decision evidence, timestamp, scope and any corrections. Pending files retain `pending-human-review`; agent visual inspection is not human approval. Replacing an image invalidates its earlier approval until the new file is reviewed.

The cast review checks four girls/four boys, varied appearances, younger/older ages within 2–8, distinguishable identities and complete product/batch coverage. The sample review checks the approved identity and garment brief, matching print/silhouette/colors, both set pieces, complete framing, white background and measured output dimensions. Storefront implementation and remaining photography cannot pass their content gates on missing or pending files.
