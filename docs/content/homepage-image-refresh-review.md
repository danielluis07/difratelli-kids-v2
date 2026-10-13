# Homepage image refresh v2

Revision: `issue-34-image-refresh-v2`. Status: **pending-human-review**.

Open [the replacement review](homepage-image-refresh-review.html) or [contact sheet](homepage-image-refresh-contact-sheet.webp). The user confirmed that the requested four replacements refer to the eight homepage category tiles. These proposals replace the right hero and the Camisetas, Polos, Conjuntos and Vestidos tiles.

| Slot | Selected image |
| --- | --- |
| Right hero | Plain cream polo, lilac star T-shirt and teal shorts on ivory linen, no model; landscape and narrow portrait variants |
| Camisetas | Davi running mid-stride in a city park, wearing the approved leaf-print T-shirt |
| Polos | Miguel walking on a city sidewalk in the approved plain cream polo, wearing sunglasses |
| Conjuntos | Two complete printed-top/teal-short matching sets on a wooden balcony table, no model |
| Vestidos | Iara and Davi smiling together on an open park hill, with blue sky above; approved dress and striped polo |

Actual cast references and approved garment photographs were supplied in every generation request. No new child identity or catalog garment was introduced. Sunglasses are the requested editorial accessory. The other four category tiles use their existing approved photographs. The hero's right photograph still disappears below 1024px.

The first hero composition was too close for narrower panels. Its retained draft is an edit input only. A wider composition and a separate 4:5 portrait derivative retain the complete garments without clipped sleeves. The producer visually inspected all selected originals, the encoded crops and the contact sheet against their references. Human approval remains distinct from this inspection.

Selected originals are retained in `assets/originals/homepage/`; quality-90 WebP crops are in `public/images/homepage/`. [The manifest](homepage-image-refresh-manifest.json) records six crops across five replacement scenes, actual dimensions, exact crop rectangles, hashes, usage, model/product associations, reference hashes and Portuguese alt text. [The generation log](homepage-image-refresh-generation.json) records exact prompts, input references, the discarded close-framing draft and the narrow art-direction request. Assets are exported at native crop sizes without enlargement.

The static review uses the actual proposed hero sources and all eight category tiles. Chrome/Playwright checks cover 390, 768, 1024, 1440 and 1920px: image decoding, correct hero crop/panel visibility, eight tiles and no horizontal overflow. The production script passes lint, and existing storefront content readiness still passes without altering the previous 80 approval-bound files.

Screenshots: [390px](homepage-image-refresh-hero-390.png), [768px](homepage-image-refresh-hero-768.png), [1024px](homepage-image-refresh-hero-1024.png), [1440px](homepage-image-refresh-hero-1440.png), [1920px](homepage-image-refresh-hero-1920.png).

## Approval and application

Approve the selected images/crops in this revision, or identify corrections. The [approval request](homepage-image-refresh-approval-request.json) binds the exact review and asset bytes. The photography standard says: “Replacing an image invalidates its earlier approval until the new file is reviewed.” No human acceptance of these generated files has been inferred from the request to produce them.

After approval, record the decision evidence and reviewed hashes in `homepage-image-refresh-approval.json`, apply the manifest's slot mappings to the presentation layer, and extend content readiness to require that separate exact-file approval. The old approval remains valid evidence for retained content. The right hero maps to both `hero-right-wide`/desktop and `hero-right`/narrow; four category identifiers map to their new portrait images. Existing links, layout and Portuguese shopping copy remain as approved.
