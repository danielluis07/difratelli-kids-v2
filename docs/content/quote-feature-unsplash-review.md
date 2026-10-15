# Unsplash editorial candidates — issue #67

Archived candidate review from before the approved homepage Unsplash refresh.
References to current neighbors and pending decisions below describe that earlier
review. The storefront now follows [the approved homepage manifest](homepage-unsplash-manifest.json)
and [its acceptance record](homepage-unsplash-approval.json), which retain both
original large banners. The accompanying gallery and preparation script preserve
the earlier comparison; they do not represent the current storefront selection.

Revision: `issue-67-unsplash-candidates-v1`. Status: `pending-human-review`.

The owner changed the sourcing direction during this task: fetch Unsplash
candidates and present them for approval. Catalog photographs and individual
product-page images remain generated. Issue #67 covers only the homepage
quote and collection feature; it does not refresh the catalog or product pages.

## Selection to review

Retain `quote-garments`, its original and both approved crops. It keeps the
botanical dress tied to “Meu vestido tem um jardim!” and offers a calm pause.
Replace the `editorial-quintal` linen arrangement with one outdoor photograph.
Retain all existing source files and approval records.

| Candidate | Photographer | Contribution | Integration constraint |
| --- | --- | --- | --- |
| A — Watering the vegetable garden | Filip Urban | Strongest direct gardening story; a child actively watering plants. | Dark foliage and watering can occupy the existing right-hand text area. |
| B — Gardening together | Mieke Campbell | Shared activity, two dress silhouettes, pink and blue. | Right child conflicts with the existing text; preserve both children and review the visible garden sign. |
| C — Discovering spring blossoms | Ayla Meinberg | Strongest color: pink blossoms, red tulips, bright dress. | Quieter close framing; lower dress is already outside the original frame, and the right background is dark. |
| D — Running through the garden | Kelly Sikkema | Most movement, wide framing, a solid peach dress. | Weaker gardening connection; the runner occupies the right-hand text area. |

Recommend **A for story** or **C for color**, subject to the owner's choice and
a later overlay review. These are credible photographic candidates, but none
is represented as ready to integrate with the unchanged dark text overlay.
An alternative source may be needed if the owner requires the existing overlay
placement to remain fully unchanged. No copy or layout revision is approved.

Open [the candidate gallery](quote-feature-unsplash-review.html) for desktop
16:9 and compact 4:3 crops, source links and downloaded originals. The gallery
also resolves the current approved hero, retained dress quote and Quintal
shop-the-look arrangement from the current manifests and hero integration
selection, rather than an obsolete contact sheet. The proposed outdoor scenes
give these consecutive panels distinct photographic roles. They avoid the
hero's blue court and ball action and the look's overhead garment arrangement.

## Provenance and scope

The four source pages identify their photographs as free under the Unsplash
License, rather than Unsplash+. Their creator links, CDN download URLs,
timestamps, measured native dimensions, SHA-256 hashes, crop rectangles,
encoded dimensions and Brazilian Portuguese alt text are retained in
[the manifest](quote-feature-unsplash-manifest.json). Original downloads remain
under `assets/references/homepage/issue-67-unsplash/`; crop previews use Sharp
WebP quality 90 and downsampling only. No retouching, mirroring, synthesized
background extension or garment alteration was performed.

Stock children and clothing are general editorial mood imagery. The owner's
new sourcing instruction supersedes the issue's generated-cast and exact
garment requirements for these editorial candidates; it does not change those
requirements for catalog photography. Do not call a stock child Bia or imply
that a photographed outfit is a listed product. The botanical-dress quote
remains associated with its retained approved photograph.

Existing Portuguese copy and destinations stay unchanged:
`/produtos?categoria=dresses` and `/colecoes/quintal-de-descobertas`.

## Approval boundary

The owner is reviewing candidate photographs and the proposed crops. No
human acceptance has been recorded. No production selector, content-readiness
gate, catalog record, storefront copy or shopping link was changed.

After selection, present the chosen image with the actual overlays alongside
retained neighbors at mobile, tablet and desktop widths. Any necessary copy,
overlay or composition revision requires explicit review. Record human
acceptance of the final exact files and crops before integration, then update
the content contract and verify source selection, decoding, overlay contrast
and shopping destinations. Coordinated comparison with issue #68 remains
pending until its shop-the-look candidates exist.
