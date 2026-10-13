# Difratelli Kids design contract

Status: accepted design contract, including the approved issue #34 editorial revision.

This document specifies presentation. [Implementation specification](docs/implementation-spec.md) owns content, routes, behavior, and acceptance; [implementation plan](docs/implementation-plan.md) records the agreed delivery sequence, ownership, and integration checkpoints. Use [GLOSSARY.md](GLOSSARY.md) for domain terms.

Canonical issue resolutions govern these documents. Every section links its authority. Surface contradictions for a human decision rather than silently changing requirements. The human confirmed completeness and sequencing in [Review implementation completeness and sequencing](https://github.com/danielluis07/difratelli-kids-v2/issues/19). Artifact roles and bounded implementer autonomy come from [Define implementation handoff artifacts and detail level](https://github.com/danielluis07/difratelli-kids-v2/issues/12#issuecomment-6086870693).

## Visual direction

Authority: [Choose the Difratelli Kids visual direction](https://github.com/danielluis07/difratelli-kids-v2/issues/3#issuecomment-6085708190), [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152).

Present an invented everyday kidswear brand for ages 2–8 at accessible mid-range prices. Follow the approved Tea Collection-inspired character: expressive serif headings, clear shopping typography, generous spacing, large photographs, minimal product framing, and color supplied mainly by clothes and imagery. Preserve Difratelli's own identity. Tea's generic hero is excluded; the approved opening is the static split composition below. Reference stores supply inspiration, not their campaigns, discounts, assortment, service promises, or assets.

## Typography, colors, and controls

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152).

Use Fraunces for expressive headings and DM Sans for navigation, shopping information, forms, and buttons. No font prototype is required.

| Role | Value |
| --- | --- |
| Main background | Warm ivory `#FAF7F0` |
| Product-image background | White `#FFFFFF` |
| Text and primary buttons | Dark brown `#382C25` |
| Selection, focus, selective accent | Deep teal `#246B63` |
| Decorative accents | Butter yellow `#F2D477`, soft coral `#E9A18F` |
| Body / supporting text | 16px / 14px |
| Section heading, desktop / mobile | 32px / 28px on editorial pages; 36px / 28px elsewhere |
| Hero heading, desktop / mobile | About 90px at wide desktop, 64px at narrow desktop/tablet, 48px mobile |
| Primary control height / corners | 48px / 6px |
| Focus indicator | Visible 2px teal outline with offset |
| Feedback transition | Approximately 150ms; immediate with reduced motion |

Keep shopping information left-aligned. Yellow and coral are decorative; do not use them for small text. Verify readable contrast for actual foreground/background combinations, including photographic overlays, disabled controls, and busy states. Primary buttons are brown, secondary buttons outlined. Hover darkens buttons without moving them. Selected sizes show a teal border and checkmark; selected colors show an outlined ring and visible color name. Favorites use outlined/filled hearts. Field errors include inline text and an icon.

## Responsive layout

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152).

| Property | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Width | Below 768px | 768–1023px | From 1024px |
| Horizontal padding | 16px | 32px | 48px |
| Product grid | 2 columns | 3 columns | 4 columns |
| Header | Compact | Compact | Full navigation |
| Hero | Left image only | Left image only | Equal split |

The homepage, collection index/details and brand page run edge to edge with no 1440px cap, per [issue #34](https://github.com/danielluis07/difratelli-kids-v2/issues/34) and [ADR 0001](docs/adr/0001-full-bleed-editorial-storefront.md). Apply side padding only to text and shopping rows; other routes retain their 1440px maximum. Section spacing is 80px desktop and 48px mobile. Preserve the compact header/hero threshold. Cards have no borders or shadows.

Product imagery is 3:4 portrait and preserves the whole garment. Category tiles are also 3:4. Editorial openings use 16:9 desktop and 4:3 mobile; the hero has its own placement-compatible crops. Paired image/text sections stack image-first on mobile. Crops preserve faces and clothing; approximate heights must grow when text or zoom needs more space.

## Shared header, menus, and footer

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define responsive behavior, accessibility, and interaction quality](https://github.com/danielluis07/difratelli-kids-v2/issues/9#issuecomment-6086531343).

Use the existing sticky header. Desktop includes the wordmark; Novidades, Meninas, Meninos, Coleções, Sobre a Difratelli; search; favorites; and cart. Shopping menus open on click or keyboard activation and present category links in a simple panel. Compact navigation shows menu, logo, and cart; a left-opening Sheet with expandable groups retains every desktop destination, search, and favorites. Issue #34 approves a thin full-width announcement bar above this header, rotating approved Portuguese messages with previous/next, Detalhes and pause controls. Reduced motion stops rotation; header transparency and image mega menus remain a separate follow-up.

Search opens from the header and submits to its results page. Favorites has a dedicated page; the cart opens a right Sheet. Keep public navigation usable while personalized state restores; counts and favorite indicators use neutral pending presentation.

Keep the existing footer with shopping links, collection links, and a short brand introduction. Place the wordmark in header and footer. Use playful motifs sparsely in editorial sections without decorative animation. Issue #34 permits approved fictional non-price promotions such as collection launches and combining pieces; never advertise a discount that catalog/cart/checkout do not apply. Do not add dead-end social/contact links, email-capture popups, signup forms, quick-add or invented service promises.

## Homepage

Authority: [Choose the storefront structure and homepage opening](https://github.com/danielluis07/difratelli-kids-v2/issues/6#issuecomment-6086002380), [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152).

Authority for the following revision: [issue #34](https://github.com/danielluis07/difratelli-kids-v2/issues/34), the owner's approval in `docs/content/homepage-approval.json`, and [ADR 0001](docs/adr/0001-full-bleed-editorial-storefront.md). This supersedes the earlier homepage sequence and the issue #28 hero mockup/review screenshots; do not reapply them.

Follow Tea Collection's mapped homepage structure section by section: announcement bar; existing sticky header; static split hero; Novidades product carousel with all eight approved arrivals; promo heading strip; lifestyle category carousel with all eight categories; full-bleed quote editorial; full-bleed collection editorial with text right; three shop-the-look tabs with a large image beside a 2×2 product grid; Brincadeira de Rua product carousel using its approved selection; seven square editorial photos in a carousel; existing footer. Omit Tea's “Inspired by the world” row and email signup band. All three collections appear through arrivals, the collection feature and look tabs.

Product carousels show about four cards on desktop, category tiles about 3.3, and photo strips about five. Compact widths expose part of the next card. Native horizontal scrolling/swipe, labeled previous/next buttons and arrow/Home/End keyboard navigation work without autoplay. Fully off-screen items leave the tab order. Ver todos and all editorial/category destinations lead to existing store routes.

Desktop hero: equal 50/50 split without a gap, about 600–640px tall, one static photograph per side. Place large white Fraunces text, a small eyebrow and a 2×2 grid of light outlined actions directly over the lower-left photograph. Comprar para meninas and Comprar para meninos are required; Novidades and Todas as roupas complete the grid. Below 1024px, show only the left image with art-directed portrait/tablet crops and overlaid text. Allow the section to grow when text or zoom requires space.

Use a localized dark gradient where needed for white text contrast; there is no ivory copy box. Preserve faces and clothing through the approved placement crops. The hero is static for everyone, with no autoplay, crossfade, video or playback control. The quote block has a large pull-quote, cast attribution with age, body and listing link; its wording is fictional approved editorial copy. The collection block has an eyebrow, bold heading, story and dark action on the right; stack copy below imagery at compact widths. Each look image matches its four linked product/colorway cards from one collection. The square photo strip has captions and no external social links.

## Listings, search, favorites, and collections

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Listings use heading, short introduction where useful, result count, compact filter/sort toolbar, and product grid. Desktop filters use a popover; mobile filters use a Sheet. Preserve access to the same browsing controls across widths; exact tablet filter presentation may follow the available space without changing behavior. Search results reuse the grid and show the query. Favorites reuses the product grid and presents saved products using their default colorway.

Cards show the product name, regular price, color swatches, and a favorite button over the photograph. Model photograph first; desktop hover and keyboard focus reveal the isolated garment photograph. Touch retains the model photograph and opens product detail on tap. Swatches preview the selected colorway. There is no quick-add button.

The full-width collections index links to all three collection pages with their approved photographs and stories. Each detail opens with its approved full-bleed photograph, then its story and ten-product grid using shared filters/sorting. Known collection slugs are prerendered; unknown slugs return a 404 with a catalog action. Homepage category tiles use the lifestyle photographs approved for issue #34. Collections group coordinating products; a matching set remains one separately purchasable product.

## Product detail

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Desktop uses photographs on the left and product name, price, color, size, and purchase action on the right. Mobile stacks gallery above purchase information. Reuse the selected colorway's paired catalog photographs in model-first, isolated-garment-second order. Mobile shows one photograph at a time, visible thumbnails, previous/next controls, and swipe support. An explicit enlarge action opens a dialog; size guidance opens a dialog beside the size selector.

Expandable description, fabric, and fit sections follow the purchase action; then show up to four other products from the same collection. Exclude washing instructions. Render visible option names and selection states. Adding without size shows Selecione um tamanho and focuses the size selector. Successful addition gives brief accessible feedback without opening the cart.

## Brand page

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Choose imagery, brand assets, and editorial voice](https://github.com/danielluis07/difratelli-kids-v2/issues/7#issuecomment-6086244718).

Use the approved full-bleed opening photograph, concise introduction, and two alternating image/text sections about everyday childhood and clothing combinations. The page has no 1440px cap. Stack images before copy on compact screens; use sparse approved motifs without decorative motion. Keep storytelling concrete and approachable. Do not introduce an earlier fictional-store disclosure into this or another shopping surface.

## Cart, checkout, and confirmation

Authority: [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Cart is a right-opening shadcn Sheet on every screen: 480px desktop, full width mobile. Lines show photograph, selected options, quantity, and remove action; subtotal and checkout button follow. There is no cart page.

Checkout places delivery/payment sections left and order summary right; mobile stacks summary below the form. Editable fictional defaults and illustrative shipping should feel like normal shopping. Pix is initially selected with a card alternative; neither requests credentials. Present inline field errors and preserve values. Do not show a site-wide fiction notice or a demonstration label on checkout entry.

After Finalizar compra succeeds, show the exact disclosure specified in the implementation specification, a temporary completed-item/total summary, and Continuar comprando. Do not invent an order number or email promise.

## Accessibility and feedback

Authority: [Define responsive behavior, accessibility, and interaction quality](https://github.com/danielluis07/difratelli-kids-v2/issues/9#issuecomment-6086531343), [Define the visual system and page layouts for DESIGN.md](https://github.com/danielluis07/difratelli-kids-v2/issues/13#issuecomment-6087100152), [Define routes and detailed shopping behavior](https://github.com/danielluis07/difratelli-kids-v2/issues/15#issuecomment-6087443967).

Support complete keyboard operation, labeled controls, visible focus, readable contrast, comfortable touch targets, and announcements for cart/favorite changes. Sheets/dialogs receive appropriate focus on opening and return it on closing. Validation appears by the relevant field, and failed submission focuses the first invalid field. Empty states offer the relevant next shopping action. Unexpected page errors offer Tentar novamente and a home link. Failed images preserve layout and show a readable fallback.

Keep local updates immediate without artificial delays. Gate personalized actions during restoration without an empty-state flash. Busy and disabled states remain readable. Reduced motion makes brief feedback transitions immediate; there is no decorative animation.

## Asset and copy integration

Authority: [Choose imagery, brand assets, and editorial voice](https://github.com/danielluis07/difratelli-kids-v2/issues/7#issuecomment-6086244718), [Define concrete catalog and imagery production contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/14#issuecomment-6087291362), [Choose collection names and creative themes](https://github.com/danielluis07/difratelli-kids-v2/issues/21#issuecomment-6089165766), [Define module interfaces and browser-state contracts](https://github.com/danielluis07/difratelli-kids-v2/issues/16#issuecomment-6088870454).

All photographs are AI generated. Catalog imagery uses the approved recurring eight-child cast, white backgrounds, paired matching garments, and complete colorway coverage. Editorial imagery depicts natural play outdoors and at home; clothing fits the assortment but need not identify a purchasable product. Use manifest-approved dimensions, crops, associations, and Brazilian Portuguese alt text. Keep source originals separate from web-ready assets; implementation uses optimized raster imagery with reserved layout space.

Identity includes a wordmark in brown and white, three playful motifs, and a favicon, all delivered as editable SVG assets. Collection garment palettes and motifs are specified in the implementation specification; they do not replace the website palette. Site copy is Brazilian Portuguese: warm and direct shopping language, short playful collection stories, and modest, consistent fabric/fit claims.

The entire approved content package is required before implementation; runtime image fallback never permits placeholders or missing production assets. Exact creative assets and remaining copy are produced and reviewed in the plan's production gates.
