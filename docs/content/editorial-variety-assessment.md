# Editorial imagery variety assessment

Date: 2026-10-14. Status: refresh plan agreed; four implementation/discovery issues published.

## Evidence reviewed

Reviewed the homepage image selection in `app/page.tsx` and `lib/presentation/editorial.ts`, the homepage and refresh manifests, their contact sheets, the editorial contact sheet, and the individual desktop hero, quote, collection-feature and three shop-the-look photographs. This assessment concerns the local implementation and its selected assets, rather than a live deployment capture.

The current homepage selects the later refresh for the right hero and four category tiles. The original homepage contact sheet alone therefore does not represent the current page.

## Findings

- Cream, beige, foliage green and teal dominate many scenes. Blue, coral and lilac provide exceptions, particularly in the other collection looks and refreshed category tiles.
- Warm sunlight, leaf shadows, pale walls, natural wood and ivory linen recur across outdoor scenes, indoor scenes and garment arrangements. Different locations often retain a similar visual atmosphere.
- Several category portraits use a full-length, near-frontal standing pose. The original botanical hero and first social images repeat the quieter gesture of looking down at something held in the hands. Running, walking, crouching and seated activities already provide exceptions.
- Teal or green shorts paired with cream tops recur heavily. Sand and sky-blue shorts vary the color but often retain the same outfit structure. Dresses, trousers and layers are present but have less influence on the overall editorial impression.
- The quote, collection feature, right hero and all three shop-the-look tabs use clothing arrangements. Several share an overhead view, ivory textile background and directional sunlight. The collection feature and Quintal look show particularly similar clothing combinations and arrangements.
- The social strip reuses editorial scenes also seen on collection and brand pages, which reinforces repetition during browsing across pages.

The imagery has a consistent brand mood, but limited variation across several dimensions at once makes the page feel drawn from a small number of shoots. The issue is strongest in the repeated linen arrangements and botanical courtyard imagery; it does not apply equally to every image.

## Initial recommendations

Retain useful existing photographs and prioritize a few prominent replacements. The collection feature is an early candidate for an outdoor childhood scene that better expresses its afternoon-outside story and separates it from the adjacent quote arrangement. Changing the hero could substantially alter the first impression, especially on mobile, where the clothes-only right panel is hidden.

Preserve selected calm images while introducing different activities, camera distances, viewpoints, lighting conditions and garment combinations. The refreshed city, park and running photographs are potential keepers. Review social reuse separately from the main editorial panels.

Product-linked shop-the-look imagery needs to remain consistent with the linked items; general editorial imagery has a broader definition in the root glossary. The agreed scope and work issues below define the next steps. Exact replacement files require separate visual acceptance before integration.

## Decisions from the first interview round

- Start with the large homepage editorial panels, then assess category and social imagery alongside the refreshed panels.
- Introduce a noticeably more colorful and energetic visual direction.
- Retain useful existing images; this is a selective refresh rather than a requirement to replace every image.
- Explore more of the existing clothing assortment and the possibility of creating additional catalog products.
- Organize future work through one GitHub issue per image set.

## Agreed issue boundaries

1. Homepage hero: left/right scenes and their responsive crops reviewed together.
2. Homepage quote and collection feature: two large panels reviewed together to avoid repeating the same composition in adjacent sections.
3. Shop-the-look: the three collection scenes reviewed together, preserving correspondence with linked products and colorways.

Category tiles and the social strip would be assessed after these first sets. Any catalog expansion would have a separate product-definition and photography scope; it is not implicitly part of an editorial image issue.

## Decisions from the second interview round

- The owner agreed to all three proposed image-set boundaries, including the hero in the first refresh.
- Use existing garments for the first refresh; explore catalog additions separately without blocking these image sets.
- Introduce more solid-color outfits first, then consider a small group of distinctive illustrated garments. Additional small repeating prints are not the primary solution to visual repetition.
- Preserve the existing storefront layout. The new colorful, energetic direction applies to photography.

## Published work

- [#66: Homepage hero imagery](https://github.com/danielluis07/difratelli-kids-v2/issues/66).
- [#67: Quote and collection-feature imagery](https://github.com/danielluis07/difratelli-kids-v2/issues/67).
- [#68: Three shop-the-look scenes](https://github.com/danielluis07/difratelli-kids-v2/issues/68).
- [#65: Catalog additions exploration](https://github.com/danielluis07/difratelli-kids-v2/issues/65).

All four issues are labelled `ready-for-agent`. The catalog ticket is ready for exploration and proposal, not unconditional catalog expansion. It explicitly requires reviewing changes to the original 30-product/ten-per-collection assumptions before any additions. Image tickets include responsive review, retained-image selection, recurring identity and garment fidelity, exact-asset acceptance and integration checks.

No new imagery has been generated or integrated during this planning task. No new domain term or architectural decision was needed; the existing glossary distinguishes editorial imagery, catalog imagery, products and colorways.
