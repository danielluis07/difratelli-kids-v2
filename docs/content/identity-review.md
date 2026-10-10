# Identity asset review — issue #28

Status: separately approved by the user. Revision: `issue-28-identity-v1`.

Open the [HTML review](identity-review.html) for all six editable SVG files, or the [contact sheet](identity-contact-sheet.webp) for a quick overview. Editorial imagery has its [own review](editorial-review.md).

| Asset | Purpose |
| --- | --- |
| `wordmark-brown-v1.svg` | Header/footer on warm ivory or white |
| `wordmark-white-v1.svg` | Wordmark on dark brown or another verified dark background |
| `motif-sprout-v1.svg` | Restrained garden/editorial decoration |
| `motif-chalk-path-v1.svg` | Restrained street-play decoration |
| `motif-spark-v1.svg` | Restrained imagination/editorial decoration |
| `favicon-v1.svg` | Brown Fraunces “d” on an ivory rounded tile |

Files live in `public/identity/`. Wordmarks use exact Fraunces outlines with a DM Sans `kids` descriptor. Individual vector paths/groups remain editable and no fonts are required to render the supplied SVGs. Edit wording through [the export script](../../scripts/content/prepare-identity.py) using the retained font sources and OFL licenses in `assets/identity/fonts/`. The manifest records font settings and file hashes. The three motifs are repository-native vector paths, using the accepted teal, butter, coral and brown. They are decorative and should have empty alt text or be hidden from assistive technology when placed beside meaningful content.

Keep the full wordmark aspect ratio and all its lettering. Use it sparingly with the motifs; do not animate them. White lettering needs a dark background for contrast. The favicon's tile has an intentional ivory fill with transparent corners; wordmarks and motifs have transparent backgrounds.

The [manifest](identity-manifest.json) and [approval request](identity-approval-request.json) bind the six SVGs and their review state to exact hashes. XML parsing, font parsing and visual contact-sheet inspection passed. App favicon replacement and header/footer integration belong to the later approved-content implementation stage.

[Issue #28](https://github.com/danielluis07/difratelli-kids-v2/issues/28) requires separate human approval for identity assets. The user subsequently replied “approved” and authorized the PR after being told identity approval remained pending separately. The [identity approval record](identity-approval.json) binds that decision to the reviewed and approved file hashes. Editorial imagery has its own independent approval record. Complete-content, integration and release approvals remain subsequent gates.
