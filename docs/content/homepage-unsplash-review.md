# Approved homepage photography

Revision: `homepage-unsplash-v1`. Exact acceptance is recorded in
[the approval](homepage-unsplash-approval.json), following the owner's review
of the final homepage and message: “perfect. we can create a PR for this work.”

The default homepage uses 20 Unsplash photographs and 24 responsive WebP
exports for the hero, eight category tiles, three shop-the-look scenes and
seven social images. The two large banners below categories retain their
original approved photographs, responsive crops, copy and transparent overlay
styling. Catalog, product cards, product galleries, collection-page imagery
and brand-page imagery retain their existing assets and selectors.

The owner supplied the final hero photographs in left/right order and the
exact polo, T-shirt and shorts category photographs. These decisions and all
selected source URLs are recorded in [the sources](homepage-unsplash-sources.json).
The polo category is now a clothes-only photo. Remaining child photographs
are general editorial images; they do not use the recurring generated cast.

[The manifest](homepage-unsplash-manifest.json) records associations, source
paths and SHA-256 hashes, measured native dimensions, crop rectangles,
encoded dimensions, locally served URLs and Brazilian Portuguese alt text.
Original downloads and exports live under `assets/originals/homepage/unsplash/`
and `public/images/homepage/unsplash/`. Crops use Sharp WebP quality 90 with
downsampling only. Earlier accepted originals and approval records are retained.
Initial sourced photos are under the Unsplash License. Photographer attribution
is not guessed for the direct CDN links supplied by the owner.

The selection applies in both development and production; no preview flag is
required. The content-readiness gate verifies acceptance, exact file hashes,
complete slot coverage, original banner retention, crop dimensions and bounds.
The production script preserves generation intent and refuses to overwrite an
approved revision. Further changes require a new revision and acceptance record.

Run `bun scripts/verification/verify-homepage-unsplash.mjs` against the default
development server, or set `HOMEPAGE_IMAGE_REVIEW_URL` to a production server.
It checks responsive selection and decoding at mobile, tablet and desktop
widths, exact user-supplied sources, restored banners and overlay styling,
all look tabs, browsing destinations, overflow and unchanged product-page
catalog imagery. Runtime screenshots and results are retained alongside this file.

## Relationship to issues #67 and #68

The owner changed the original generated-photography brief to general Unsplash
imagery and then chose to retain both original quote/collection banners. This
work therefore preserves the issue #67 panels instead of replacing them.

Issue #68 explicitly proposes changing the three shop-the-look editorial
images while preserving correspondence to each tab's four linked products and
colorways. This accepted set replaces those illustrations with general
clothes-only stock images, leaving the linked products unchanged. It does not
fulfill #68's exact garment-matching requirement, so the PR does not close #68.
Catalog photography remains generated and unchanged. Existing copy and social
captions remain in place and are not literal descriptions of every stock scene.
