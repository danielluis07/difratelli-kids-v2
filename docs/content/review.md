# Current catalog content review

Revision: `issue-51-polos-v1`. **Approved by the user**, including the exact revised catalog and four replacement photographs. [approval.json](approval.json) records catalog acceptance; [polo-approval.json](polo-approval.json) binds the replacement photographs and revised file hashes. Earlier issue #23 approval remains bound to its [unchanged historical catalog snapshot](catalog-revisions/pre-issue-51/catalog-proposal.json).

Review [the two polo products and exact acceptance scope](polo-review.md) and [their photograph pairs](polo-review.html). The structured source remains [catalog-proposal.json](catalog-proposal.json). Copy outside the two product records is unchanged; [copy-review.md](copy-review.md) and [copy-proposal.json](copy-proposal.json) retain their earlier approval. Neither content file is imported into the starter storefront yet.

| Category | Products | Regular price |
| --- | --- | --- |
| Camisetas (`t-shirts`) | 6 | R$ 59,00 |
| Polos (`polos`) | 2 | R$ 79,00 |
| Blusas (`tops`) | 4 | R$ 59,00 / R$ 69,00 |
| Shorts (`shorts`) | 5 | R$ 89,00 |
| Calças (`trousers`) | 4 | R$ 109,00 |
| Vestidos (`dresses`) | 3 | R$ 129,00 |
| Conjuntos (`matching-sets`) | 4 | R$ 149,00 |
| Peças leves (`light-layers`) | 2 | R$ 129,00 |

There are 30 products, 42 colorways and 84 active catalog photographs. Each collection retains ten products, fourteen colorways and the 4 girls / 4 boys / 2 both audience allocation. The pattern split is now 16 printed, 13 plain and one striped. All products offer sizes 2, 4, 6 and 8; no size is selected initially. No stock, discounts, popularity or dates are invented.

Product-002 becomes **Polo Lisa do Quintal**, cream, replacing Camiseta Besourinhos. Product-011 becomes **Polo Listrada da Rua**, cream/sky-blue with a solid cream collar, replacing Camiseta Volta de Bicicleta. Both have one colorway. The remaining 28 product records, collection stories, collection positions, coordinating products, new-arrival and homepage product selections remain unchanged. Polos receives a category tile using product-002 / cream. Existing product-011 selections now resolve to the striped polo.

Both affected collection manifests and contact sheets select the approved new polo photographs. Twenty-six exact photos per affected collection retain their original approval; the four new photos are approved in the issue #51 record. Earlier catalog/manifest/approval/review files are retained under `catalog-revisions/pre-issue-51/`, and all old originals/exports remain available for provenance and editorial references. Historical Markdown snapshots retain their original text and relative links; consult current sources above for active associations. Approved editorial imagery remains byte-identical.

Run `bun scripts/content/prepare-polos.mjs` to verify catalog scope, category/collection/audience/size/tile associations, child identities, native dimensions, original/WebP hashes, active gallery completeness and editorial integrity. Exact prompts and references are recorded in [polo-generation.json](polo-generation.json). Complete-content, storefront integration and release approvals remain separate.
