# Issue #34 — content review v1

Status: **pending-human-review**. Revision: `issue-34-content-v1`.

Open [the review page](homepage-review.html) or [the contact sheet](homepage-contact-sheet.webp). The review presents the requested homepage sections in order, all proposed copy, the eight category photographs, every look panel, seven social crops, and existing collection/brand photographs and stories. It is a local content presentation, not an implemented storefront or a deployed site. Review actions display their intended destination rather than navigate.

## Scope for approval

- Fifteen new originals: eight category lifestyle photographs, three four-product look flat-lays, a dress quote flat-lay, a collection editorial flat-lay, and two landscape hero variants.
- Ten reuse entries: approved portrait hero sources, the approved tablet derivative, and seven square crops of existing editorial scenes. Every newly exported crop needs this approval even when its source is already approved.
- Twenty-eight WebP crops, quality 90, measured at their native crop dimensions without enlargement. Category portraits are exactly 3:4, look photographs 4:3, social photographs 1:1, and wide editorial photographs 16:9. The manifest records actual sizes, exact rectangles, file hashes, input references, usage and Portuguese alt text.
- New Brazilian Portuguese copy is an additive package in [homepage-copy-proposal.json](homepage-copy-proposal.json). Existing approved catalog/copy files remain unchanged. Implementation must compose this extension with the base package after approval.
- Collection index/detail and brand pages reuse the six corresponding approved image entries and existing introductions, collection stories and two brand sections. The collection index links to all three details; each detail will show its ten approved products during implementation.

The same eight approved fictional children appear across the content package. Every new worn category scene uses its assigned child and approved catalog photograph as references. Hero variants retain the approved editorial wardrobe; they do not revise catalog assignments. Bia's fictional quote is proposed editorial copy, not a customer testimonial. Promotional messages announce collections and outfit combinations, with no price discounts, new service promises or email signup.

## Hero and editorial placement

The old issue #28 mockup and ivory copy box are superseded. The review shows equal static panels with text directly over the lower-left photograph and a dark gradient for contrast; only the left photograph appears below 1024px. Landscape variants prevent the wide desktop crop from clipping heads or dress hems. Narrow desktop uses the approved portraits, mobile uses the approved left portrait, and tablet uses its approved wide derivative. The new left landscape variant has calm space on its left for large white copy.

The quote has empty linen on the left; the collection flat-lay has empty linen on the right. At compact widths, their copy follows the photograph to preserve garments. Look images show exactly the four products/colorways recorded beside them; each look uses a single collection. Social images have no external destinations.

The producer visually inspected the source-reference sheet, the full contact sheet, both editorial flat-lays, the wide hero, and the mobile/desktop overlay screenshots. Catalog silhouettes, colors and motif families were compared with the supplied photographs. These are AI-generated editorial proposals and still require human visual acceptance; producer checks are not approval.

## Verification

The review rendered in Chrome through Playwright at 390, 768, 1024, 1440 and 1920 CSS pixels. All images decoded, the two/one hero-panel threshold was correct, copy stayed within the left panel, and the document had no horizontal overflow. Screenshots: [390](homepage-hero-390-review.png), [768](homepage-hero-768-review.png), [1024](homepage-hero-1024-review.png), [1440](homepage-hero-1440-review.png), [1920](homepage-hero-1920-review.png).

The dedicated package validator checks dimensions, opacity, crop ratios and bounds, reference hashes, approval-bound file hashes, category/cast coverage and look-to-product/colorway associations. Repository content validation still passes for the existing approved content. Lint passes for the three new JavaScript production/validation scripts.

These checks cover the review package. Carousel keyboard/touch behavior, announcement rotation/pause, 200% zoom, storefront axe scans, Next.js prerendering and unknown-slug behavior remain implementation acceptance work after approval.

```powershell
bun scripts/content/prepare-homepage.mjs
bun scripts/content/prepare-homepage-review.mjs
python scripts/content/capture-homepage-review.py
bun scripts/content/prepare-homepage-review.mjs
bun scripts/content/validate-homepage.mjs
```

The initial review generation needs the five screenshot files for its approval record. To bootstrap on a checkout without screenshots, retain the supplied screenshots or capture from the supplied HTML first. Python requires Playwright and an installed Chrome; `EDITORIAL_REVIEW_BROWSER` can point to another Chromium executable. Existing originals are retained under `assets/originals/homepage/`; reproduction does not require access to the producer's generated-image directory. The generator refuses to overwrite a retained original with different bytes and preserves a hash-verified approved revision.

Higgsfield's product-photoshoot enhancement service was unreachable during the initial production attempt. Production therefore used the built-in image generator, as used for existing editorial assets. [homepage-generation.json](homepage-generation.json) records the exact prompts, input reference paths and generated output locations. [homepage-manifest.json](homepage-manifest.json) records retained originals and WebP crops. [homepage-approval-request.json](homepage-approval-request.json) binds the review to exact hashes, with `implementationAllowed: false`.

## Required human decision

Approve `issue-34-content-v1` explicitly in issue #34, or name the images/copy that need revision. Approval must bind to the files listed in the approval request; a replacement image or copy revision requires renewed review. No approval evidence has been fabricated, and no storefront implementation is authorized by this pending record.

After approval: record reviewer, timestamp, decision evidence and reviewed hashes in `homepage-approval.json`; integrate the new package into content readiness; update `DESIGN.md` and record the superseding layout decision in `docs/adr/`; then implement and verify the storefront criteria in issue #34.
