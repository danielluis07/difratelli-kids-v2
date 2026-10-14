# Hero color refresh — issue #66

Revision: `issue-66-hero-color-v1`. Status: `pending-human-review`.
Implementation allowed: **false**. This package proposes exact imagery, not a
change to the approved storefront selection.

## Audit and selection

Resolve current imagery through `lib/presentation/editorial.ts`. The existing
`homepage-approval.json` and `homepage-image-refresh-approval.json` are the
acceptance authorities; pending fields in their immutable production manifests
are historical, not revoked approvals.

| Current selection | Decision | Reason |
| --- | --- | --- |
| `hero-left-wide`: `hero-left-wide-desktop-v1.webp` | Replace | Quiet downward gaze, cream botanical dress, courtyard and leaf shadows repeat later panels. |
| `hero-left`: `hero-left-portrait-v1.webp`, `hero-left-narrow-v1.webp` | Replace | The mobile scene must establish color and activity independently of the hidden right panel. |
| `hero-left-tablet`: `hero-left-tablet-tablet-v1.webp` | Replace | Coordinate the tablet scene with the new left campaign and retain the complete outfit. |
| `hero-right-clothes-v2`: desktop and narrow exports, with its separate narrow original | Replace | Clothes-only remains useful, but ivory linen and cream/teal styling repeat quote and look arrangements. |
| Original `hero-right-wide` / `hero-right` child photos | Archive retained | Already superseded by the approved clothes-only revision; not current homepage images. |
| Four category replacements from issue #34, quote, collection feature, three looks, social images and remaining editorial originals | Retain | Keep their existing approvals; show neighboring images in this review and reserve their refresh decisions for #67/#68. |

No existing source, approved crop, approval record, content gate or runtime
selector is overwritten. Candidate files live in dedicated `issue-66` image
directories.

## Proposed set

Left: Bia plays on a blue recreation court, smiling toward the camera while
stepping toward a coral ball. Lilac `product-027/lilac` and peach
`product-030/peach` introduce solid-color separates and full-length trousers.
The actual approved Bia reference and exact catalog garments are inputs.
The top's catalog image includes teal shorts; those shorts are explicitly
excluded from the generation intent. This is general editorial styling,
not a change to product photography or product-to-child catalog assignments.

Right: blue patterned `product-014/sky-cream-coral` dress and solid
`product-008/butter` and `product-019/coral` shorts in a hanging-clothes
composition. It adds dress/twill silhouettes, yellow and coral without another
linen overhead arrangement. Existing garments only; no catalog additions.

The portrait left source is deliberately composed for the lower headline and
actions. The distant landscape source supplies desktop and tablet crops;
Earlier landscape, portrait and right-panel drafts are retained as rejected
framing evidence. The final left sources move the child clear of the copy;
the final right source keeps all three garments inside the narrow crop.
Generation intent, inputs, measured dimensions, SHA-256 hashes, source rectangles
and Brazilian Portuguese alt text are in the generation record and manifest.
All WebP crops use Sharp quality 90 without enlargement.

## Responsive and page-level review

Open [the responsive review](hero-color-refresh-review.html). It shows the
proposed hero with the existing headline, actions, fonts and gradient, compares
the current hero, and displays retained category, quote, collection-feature and
all three look scenes. Exact crops are displayed individually below.

The desktop remains an equal static split. Below 1024px only the left panel is
visible. One image-source adjustment is proposed for review: use the compact
left source from 480–767px instead of the landscape tablet source. A tall 480px
panel crops too much horizontal content from a landscape image. This changes
photographic source selection only. Tablet uses the landscape crop from
768–1023px; narrow desktop uses the portrait composition from 1024–1279px.

Automated browser checks cover 390, 480, 768, 1024, 1279, 1280, 1440 and 1920px:
actual selected picture sources, image decoding, panel visibility, copy/button
bounds, horizontal overflow and rendered overlay contrast. Background sampling
at all text-character boxes passes 3:1 for the large headline and 4.5:1 for
small text with the existing gradient unchanged. Hero screenshots are retained at every width;
context screenshots are retained at mobile, tablet and desktop widths.
These are static content-review checks. Runtime loading, shopping navigation
and the production content contracts must be verified after approved integration.

For #67, preserve the botanical dress quote as a calm pause unless that review
finds a reason to replace it; use outdoor discovery for the Quintal feature.
For #68, distinguish outdoor discovery, street play and indoor imagination and
keep each scene faithful to its four shoppable colorways. Reserve the blue court,
ball action and hanging-clothes viewpoint for this hero. These are coordination
proposals; no new #67/#68 assets have been generated or accepted here. Page-level
comparison with their eventual candidates remains required.

## Acceptance and integration handoff

Agent inspection does not establish human acceptance. Review the child identity,
garment construction/colors, anatomy, photographic quality, all six crops,
subject framing and headline/action readability. The approval request binds
the exact local originals, references, crops and review evidence by hash.

After explicit human acceptance, record reviewer, verbatim decision evidence,
timestamp, revision and exact accepted hashes in the separate approval decision.
Then extend the homepage readiness contract to validate this revision and its
approval request, integrate the replacement mapping and the proposed 480–767px
source selection, and verify content contracts, responsive sources, loading,
overlay contrast and shopping destinations. Preserve earlier acceptance records
for retained assets. The issue stays open until those integration checks pass.

No Next.js feedback candidate arose while preparing the independent review.
