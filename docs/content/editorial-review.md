# Editorial imagery review — issue #28

Status: editorial imagery approved by the user; identity assets have a separate approved record. Revision: `issue-28-editorial-v4`.

Authority: [issue #28](https://github.com/danielluis07/difratelli-kids-v2/issues/28), [parent specification #22](https://github.com/danielluis07/difratelli-kids-v2/issues/22), [design contract](../../DESIGN.md), and [image contract](../implementation-spec.md#production-package-and-image-contract).

Open the [complete HTML review](editorial-review.html) in a browser for the responsive hero, every placement crop, Portuguese alt text and links to full originals. The [contact sheet](editorial-contact-sheet.webp) summarizes the eight scenes. Identity is a [separate review](identity-review.md).

| Scene | Placement | Cast | Collection mood |
| --- | --- | --- | --- |
| `hero-left` | Homepage left; compact opening | Bia (`model-002`) | Cream botanical dress, leaf discovery |
| `hero-right` | Homepage right, desktop only | Davi (`model-006`) | Plain cream polo and sand shorts, garden discovery |
| `collection-quintal` | Collection opening/index; homepage feature | Lia and Davi | Sand and teal shorts beside a garden bed |
| `collection-brincadeira` | Collection opening/index; homepage feature | Davi | Sky-blue shorts, chalk and hopscotch on a pedestrian patio |
| `collection-imaginacao` | Collection opening/index; homepage feature | Nina (`model-003`) | Sky-blue shorts, blocks and a blanket tent at home |
| `brand-opening` | Brand opening | Lia and Theo | Sand shorts; red bear T-shirt and sky-blue trousers |
| `brand-play` | First brand section; homepage introduction | Nina (`model-003`) | Sky-blue shorts, drawing stars and arranging blocks |
| `brand-combinations` | Second brand section | Theo | Red bear T-shirt and sky-blue trousers, choosing a cotton top |

All eight scenes were AI generated with approved cast/catalog photographs as identity/clothing references. Editorial clothing uses the offering as its reference without claiming an exact purchasable SKU; the current revision includes the user's requested plain polo, additional bottom colors and bear T-shirt proposals, whose catalog work is deferred. The selected native originals are retained unchanged in `assets/originals/editorial/`; the manifest selects 19 WebP placement variants in `public/images/editorial/`. Nothing was upscaled. A ninth selected raster is the AI-expanded version of the left scene used for wider compact viewports; it is art direction of the same scene, not a ninth editorial slot. At the user’s request, superseded originals and exports have been removed. Only selected approved editorial images remain; historical text manifests and generation records are retained for provenance.

Revision v2 implements the user's request: “in the hero left we have model 001. let's change for model 002 and put a dress on her”. Both portrait and wide left-hero compositions now use Bia's exact approved cast reference and the cream botanical Vestido Passeio no Quintal garment reference. Previous v1 generation, manifest and review-hash records are retained in `editorial-revisions/`. This change request is not an approval of the generated replacement.

Revision v3 implements the user's request to choose one male model and put him in a polo shirt, with catalog discussion deferred. The selected model is Davi (`model-006`) in the right hero. His cream printed T-shirt is replaced by a plain cream short-sleeve cotton polo with a folded collar and two tonal buttons; his teal shorts, pose and garden setting are preserved. The polo is an editorial proposal with no catalog product association. The approved catalog is unchanged; polo assortment/garment approval will be addressed later at the user's request. The previous v2 text review records remain retained; superseded image originals and exports were subsequently removed at the user’s request. This requested change is not human approval of the generated output.

Revision v4 implements the user's request for two additional shorts/trouser colors and a red T-shirt with a large cute bear drawing for the blonde boy. Sand `#D6BE96` and sky blue `#A9CCE0` now vary the editorial bottoms alongside existing teal. Theo wears the same red `#C8443D` T-shirt with a large original seated teddy-bear illustration and sky-blue trousers in both brand scenes. His selected standing photograph is the garment reference for the garden edit. Davi's hero polo stays plain, with sand shorts. Lia has sand shorts in both garden scenes; Nina has sky-blue shorts in both home scenes. Davi retains teal shorts in the garden collection photograph and wears sky blue in the street-play photograph.

These are editorial wardrobe proposals; catalog records and product photography remain unchanged, with assortment work deferred. The home-scene cast labels are also corrected from Bia to Nina (`model-003`), matching the actual approved `product-023` model reference; her appearance is preserved. The left hero continues to show Bia (`model-002`) in the botanical dress. Superseded v3 review/provenance records are retained in `editorial-revisions/`. Requested styling changes do not imply approval of generated output.

## Crop and integration contract

The [manifest](editorial-manifest.json) records native dimensions, source hashes, references, exact crop rectangles, output dimensions/hashes, usage and Portuguese alt text. The [generation log](editorial-generation.json) retains prompts and output provenance. Every selected editorial asset and crop is approved for editorial use, bound to the exact hashes in [the approval record](editorial-approval.json).

- Desktop hero: use `desktop-narrow` (4:5) at 1024–1279px and `desktop` (6:5) from 1280px. Equal panels are approximately 600px high. Align imagery to the top; keep the left heading/buttons on the light wall with the local ivory scrim demonstrated in the review.
- Compact hero: use the left `compact` (3:4) below 480px and left `tablet` (2:1) at 480–1023px, approximately 520px high. Never display the right hero below 1024px. Its compact export is retained as an unused alternative.
- Collection and brand openings: 16:9 desktop, 4:3 compact. The collection compact crop also suits image/text homepage features and the collection index.
- Brand sections: 4:3 on both screen sizes; stack image-first on compact layouts.
- Preserve faces and complete garments. Hero crops may omit lower legs/shoes; both garments remain visible. Do not stretch a raster or apply an additional centered crop that defeats the supplied art direction. Reserve layout space and use responsive local image sources during the later storefront implementation.

The producer inspected all eight scenes and contact-sheet compositions. Full-size crop inspection checked garden, home, brand opening and hero face/garment preservation. The right desktop crop was corrected to retain the full hair silhouette. A landscape expansion corrected the portrait's unsuitable tablet crop. These checks do not constitute human approval.

For revision v2, the producer compared Bia's portrait and tablet outputs with the approved cast reference and botanical dress. Refreshed Chrome previews at all four recorded widths retain her face and complete dress hem. Hash verification confirmed that the other seven editorial asset entries are unchanged from v1; separate identity review hashes still match.

For revision v3, the producer inspected Davi's plain polo and refreshed the four viewport previews. The polo has no drawings, print, embroidery, logo or decorative accents; collar, buttons and fabric texture are functional garment details. Hash verification confirmed that the other seven current scene entries, approved catalog/copy and identity assets are unchanged. WebP export checks, responsive preview checks and repository ESLint passed. Approval was pending at this verification; revision v4 is now approved below.

For revision v4, the producer inspected all seven edited originals and the updated contact sheet, checking bottom colors, unchanged plain polo, faces and the bear graphic across Theo's two poses. The full-size brand compact crop preserves both children, clothing and the large bear drawing. The exporter verified all 19 placement dimensions/ratios. Both hero sources and panel visibility passed viewport checks at 390, 768, 1024 and 1440px with no horizontal overflow; repository ESLint passed. Review file hashes match, Bia's left hero is unchanged from v3, and approved catalog/copy and identity hashes still match. The user subsequently approved revision v4; see the decision below.

## Verification and reproduction

On 10 October 2026, Bun exports verified all 19 WebP dimensions/ratios and all 29 editorial approval-request file hashes. Six identity SVGs and two font sources were parsed successfully. Repository ESLint passed. Chrome on Windows rendered the asset review at 390, 768, 1024 and 1440 CSS pixels through Playwright viewport emulation; this verifies the asset presentation, not the future storefront or actual devices.

```powershell
python scripts/content/prepare-identity.py
bun scripts/content/prepare-editorial.mjs
bun scripts/content/prepare-editorial-review.mjs
python scripts/content/capture-editorial-review.py
bun run lint
```

Python helpers require `fonttools`, `brotli` and `playwright`; these are producer tooling, not app dependencies. Font files and OFL licenses are retained locally. The export script uses the project's installed `sharp` and refuses to replace an original with different bytes. For the approved revision it verifies all recorded hashes and preserves the approved files; changes require a new review revision. Generation log source paths point to the original producer's image output folder; the repository retains the selected approved sources for review/integration separately. Historical revision records may reference superseded images removed at the user’s request. On another workstation, set those paths to their matching retained originals before exporting. Set `EDITORIAL_REVIEW_BROWSER` to an installed Chromium executable when needed.

Screenshots: [390px](editorial-hero-390-review.png), [768px](editorial-hero-768-review.png), [1024px](editorial-hero-1024-review.png), [1440px](editorial-hero-1440-review.png).

## Human decision

The user replied “approved” after the revision v4 editorial review. The [approval record](editorial-approval.json) records that evidence, the reviewed file hashes, and the approved manifest hashes. This covers the eight selected scenes, tablet derivative, 19 placement crops, Portuguese alt text and requested editorial wardrobe changes. The [original approval request](editorial-approval-request.json) remains retained as the pre-approval review snapshot.

Identity assets now have their [separate approval record](identity-approval.json). Catalog changes remain deferred to a follow-up issue. Issue #28’s two asset approval decisions are recorded; complete-content approval, storefront integration acceptance and release approval remain subsequent gates.
