# Issue #23 content review

Status: approved by the user on 9 October 2026. Revision: `issue-23-proposal-v1`.

This is the complete stage-2 catalog/copy/garment proposal under [issue #23](https://github.com/danielluis07/difratelli-kids-v2/issues/23), [parent #22](https://github.com/danielluis07/difratelli-kids-v2/issues/22), and the accepted handoff at `de86d01b70030b1b3f6f8a6873c0e6c66b44a3e3`. Shopper-facing text is Brazilian Portuguese. Structural notes and garment-production instructions are English.

Review this document for the assortment and garment designs; review [copy-review.md](copy-review.md) (rendered from [copy-proposal.json](copy-proposal.json)) for every editorial/UI string, fictional delivery default, validation/recovery message and size measurement. [catalog-proposal.json](catalog-proposal.json) is the structured source for product/collection records and merchandising. Neither file is imported into the starter app. These are production proposals; readonly TypeScript integration and build-blocking content/asset validation belong to stage 4 after the complete imagery/identity gate.

## Review outcome

The user explicitly replied “approved” in this conversation on 9 October 2026, recorded at 21:44:40 UTC (18:44:40 America/Sao_Paulo). Approval covers the complete package presented for review: all 30 products and 42 colorways, garment briefs, compositions/fit, collection stories, Portuguese editorial and shopping copy, validation/recovery/checkout copy, size guidance, fictional delivery defaults and merchandising. No corrections or exceptions were requested. The content-approval acceptance criterion of issue #23 is satisfied locally. The JSON files now carry approved status; only their approvalStatus fields changed after review. [approval.json](approval.json) binds the reviewed hashes below to the approved-file hashes and records the evidence and scope.

| File | SHA-256 of content presented for approval |
| --- | --- |
| catalog-proposal.json | `85f1086348e7c5ca9422e3fcd377e9e270551a722f247957a78bc75ba8adf005` |
| copy-proposal.json | `2324a208ab3d8cf7c319a4079289a58930f789e281ea80ef7b1f99f3acf33c4a` |

The catalog/copy/garment approval prerequisite for child-reference and subsequent photography production is satisfied. The later child-cast, sample-pair, collection-photo, editorial/identity, complete-content, integration and release approvals remain required. This approval records stage 2 only. No generated-photo path, manifest entry, child identity or image approval is asserted before its production stage; these omissions are stage boundaries, not content placeholders or a readiness waiver.

## Assortment check

| Category | Count | Proposed regular prices | Approved range |
| --- | --- | --- | --- |
| Camisetas (`t-shirts`) | 8 | R$ 59,00 | R$ 49,00–R$ 79,00 |
| Blusas (`tops`) | 4 | R$ 69,00, R$ 59,00 | R$ 49,00–R$ 79,00 |
| Shorts (`shorts`) | 5 | R$ 89,00 | R$ 69,00–R$ 119,00 |
| Calças (`trousers`) | 4 | R$ 109,00 | R$ 69,00–R$ 119,00 |
| Vestidos (`dresses`) | 3 | R$ 129,00 | R$ 99,00–R$ 159,00 |
| Conjuntos (`matching-sets`) | 4 | R$ 149,00 | R$ 119,00–R$ 179,00 |
| Peças leves (`light-layers`) | 2 | R$ 129,00 | R$ 99,00–R$ 149,00 |

Exactly 30 products, 18 printed and 12 plain, 42 colorways. Each collection has ten products: six printed with one colorway, four plain with two; four girls, four boys, two suitable for both. All sizes 2/4/6/8 are offered for every colorway, without stock exclusions. Prices are positive integer BRL centavos and apply unchanged across sizes/colorways. Product default color is explicitly the first listed colorway; no size is selected initially. Product/collection IDs are permanent English identifiers; slugs are unique Portuguese names.

Color families: `cream` = Creme; `green` = Verde; `yellow` = Amarelo; `blue` = Azul; `pink` = Rosa e coral; `purple` = Lilás; `orange` = Pêssego e laranja. Deep teal and leaf green both use the green family; coral uses pink, peach uses orange. Printed swatches show the base color; their visible names and filter associations include all print colors. Hex values specify flat garment colors for production, not a guarantee of screen or fabric color matching.

Fabric weights and construction are proposed garment briefs for imagery, not external certifications or performance claims. Composition is identical across each product’s options. Both matching-set pieces use the stated cotton jersey composition; bindings and rib cuffs use cotton. No washing instructions, discounts, dates, popularity or service promises are proposed.

## Quintal de Descobertas

ID: `collection-001`; slug: `quintal-de-descobertas`.

Um besourinho na folha, uma semente no chão, um caminho novo entre as plantas. Cores de quintal e desenhos pequenos acompanham uma tarde de descobertas.

Palette: Creme (`#F3EBDD`), Verde-folha (`#78946A`), Verde-petróleo (`#246B63`), Amarelo-manteiga (`#F2D477`).

Collection order is the following product sequence.

### product-001: Camiseta Folhas ao Vento

Slug: `camiseta-folhas-ao-vento`; category: `t-shirts`; audience: `both`; printed; R$ 59,00 (5900 centavos); curated rank 1.

**Description:** Folhas pequenas espalhadas em uma camiseta de malha para acompanhar as descobertas do dia.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, com espaço no corpo e mangas curtas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-leaf-teal` | Creme, verde-folha, verde-petróleo | `#F3EBDD` | `cream`, `green` | Creme: `#F3EBDD`; Verde-folha: `#78946A`; Verde-petróleo: `#246B63` |

Default: `cream-leaf-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; crew neck with cotton rib binding; hip length. Airy hand-drawn leaves, 20–30 mm, leaf green and deep teal on cream; no text. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-007 (Short Passo Leve); product-008 (Short Explorador).

### product-002: Camiseta Besourinhos

Slug: `camiseta-besourinhos`; category: `t-shirts`; audience: `boys`; printed; R$ 59,00 (5900 centavos); curated rank 2.

**Description:** Besourinhos desenhados aparecem entre espaços de amarelo em uma camiseta de mangas curtas.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, sem ajuste na cintura.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `butter-teal` | Amarelo-manteiga, verde-petróleo | `#F2D477` | `yellow`, `green` | Amarelo-manteiga: `#F2D477`; Verde-petróleo: `#246B63` |

Default: `butter-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; rib crew neck; hip length. Small simplified beetles, 15–25 mm, deep teal on butter yellow, spaced at least 40 mm apart. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-008 (Short Explorador).

### product-003: Camiseta Pequenas Sementes

Slug: `camiseta-pequenas-sementes`; category: `t-shirts`; audience: `girls`; printed; R$ 59,00 (5900 centavos); curated rank 3.

**Description:** Sementes e brotinhos dão cor à malha clara desta camiseta para brincar ao ar livre.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, com mangas curtas e comprimento até o quadril.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-butter-leaf` | Creme, amarelo-manteiga, verde-folha | `#F3EBDD` | `cream`, `yellow`, `green` | Creme: `#F3EBDD`; Amarelo-manteiga: `#F2D477`; Verde-folha: `#78946A` |

Default: `cream-butter-leaf`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; crew neck; no gathers or ties. Tiny seed-and-sprout pairs, 15–25 mm, butter yellow and leaf green on cream; scattered, not a dense floral. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-007 (Short Passo Leve).

### product-004: Blusa Jardim Miúdo

Slug: `blusa-jardim-miudo`; category: `tops`; audience: `girls`; printed; R$ 69,00 (6900 centavos); curated rank 4.

**Description:** Uma blusa sem mangas com folhas e pequenos besouros, para combinar com os shorts do quintal.

**Composition:** 100% algodão.

**Fit:** Modelagem levemente ampla, com alças largas e barra reta.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-leaf-teal` | Creme, verde-folha, verde-petróleo | `#F3EBDD` | `cream`, `green` | Creme: `#F3EBDD`; Verde-folha: `#78946A`; Verde-petróleo: `#246B63` |

Default: `cream-leaf-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Sleeveless jersey top with broad 40 mm shoulder straps at size 4, rounded neckline, straight hem at hip; no closures. Hand-drawn leaves and beetles, 20–30 mm, leaf green and teal on cream; airy repeat. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-007 (Short Passo Leve).

### product-005: Vestido Passeio no Quintal

Slug: `vestido-passeio-no-quintal`; category: `dresses`; audience: `girls`; printed; R$ 129,00 (12900 centavos); curated rank 5.

**Description:** Folhas e brotinhos acompanham uma saia levemente franzida em um vestido de malha.

**Composition:** 100% algodão.

**Fit:** Corpo com folga e saia acima dos joelhos; mangas curtas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-leaf-butter` | Creme, verde-folha, amarelo-manteiga | `#F3EBDD` | `cream`, `green`, `yellow` | Creme: `#F3EBDD`; Verde-folha: `#78946A`; Amarelo-manteiga: `#F2D477` |

Default: `cream-leaf-butter`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Jersey dress; short sleeves; rounded neck; natural-waist seam and gently gathered skirt above knee; no pockets or fastening. Leaf-and-sprout repeat, 25–35 mm, leaf green and butter yellow on cream; same print scale on bodice and skirt. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-006: Conjunto Descobertas

Slug: `conjunto-descobertas`; category: `matching-sets`; audience: `boys`; printed; R$ 149,00 (14900 centavos); curated rank 6.

**Description:** Camiseta com folhas e short verde-petróleo vendidos juntos para um dia de pequenas descobertas.

**Composition:** 100% algodão.

**Fit:** Camiseta reta e short com cintura elástica e comprimento no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-teal-leaf` | Creme, verde-petróleo, verde-folha | `#F3EBDD` | `cream`, `green` | Creme: `#F3EBDD`; Verde-petróleo: `#246B63`; Verde-folha: `#78946A` |

Default: `cream-teal-leaf`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Two jersey pieces sold together: short-sleeve crew-neck T-shirt and solid deep-teal shorts with elastic waist, no drawstring, two side pockets. Leaves and beetles, 20–30 mm, leaf green and teal on cream T-shirt; shorts entirely plain teal. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Included pieces:** Camiseta de mangas curtas estampada; Short liso com cintura elástica. One product and one price for both pieces; show both pieces in each photograph.

### product-007: Short Passo Leve

Slug: `short-passo-leve`; category: `shorts`; audience: `girls`; plain; R$ 89,00 (8900 centavos); curated rank 7.

**Description:** Short de sarja com cintura elástica, dois bolsos e cores que se misturam às estampas do quintal.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Cintura elástica e pernas soltas, com barra no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `leaf` | Verde-folha | `#78946A` | `green` | Verde-folha: `#78946A` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `leaf`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill shorts; elastic waistband; two side pockets; straight hem; no drawstrings or decoration. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-008: Short Explorador

Slug: `short-explorador`; category: `shorts`; audience: `boys`; plain; R$ 89,00 (8900 centavos); curated rank 8.

**Description:** Dois bolsos e uma cintura elástica em um short de sarja para compor os passeios do dia.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Modelagem reta, com folga nas pernas e comprimento no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `teal` | Verde-petróleo | `#246B63` | `green` | Verde-petróleo: `#246B63` |
| `butter` | Amarelo-manteiga | `#F2D477` | `yellow` | Amarelo-manteiga: `#F2D477` |

Default: `teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill shorts; elastic waistband; two side pockets; no cargo flaps, drawstring or logos. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-009: Calça Caminho de Terra

Slug: `calca-caminho-de-terra`; category: `trousers`; audience: `boys`; plain; R$ 109,00 (10900 centavos); curated rank 9.

**Description:** Calça de sarja com pernas retas e bolsos para combinar com as camisetas de pequenas descobertas.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Cintura elástica e pernas retas até o tornozelo.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `leaf` | Verde-folha | `#78946A` | `green` | Verde-folha: `#78946A` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `leaf`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill trousers; elastic waist; two side pockets; straight ankle-length legs; no fly or drawstring. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-010: Casaco Brisa do Quintal

Slug: `casaco-brisa-do-quintal`; category: `light-layers`; audience: `both`; plain; R$ 129,00 (12900 centavos); curated rank 10.

**Description:** Uma camada leve de moletinho, aberta na frente, para vestir por cima das peças do quintal.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, mangas longas e comprimento até o quadril.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `teal` | Verde-petróleo | `#246B63` | `green` | Verde-petróleo: `#246B63` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Lightweight cotton loopback, 220 g/m². Lightweight cotton loopback cardigan; open front with no fasteners; long sleeves; cotton rib cuffs; no hood, pockets or print. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

## Brincadeira de Rua

ID: `collection-002`; slug: `brincadeira-de-rua`.

O giz desenha a amarelinha, a bicicleta faz a volta e a turma inventa outra brincadeira. Traços soltos e cores de céu e calçada acompanham esse vai e vem.

Palette: Creme (`#F3EBDD`), Azul-céu (`#A9CCE0`), Verde-petróleo (`#246B63`), Coral suave (`#E9A18F`).

Collection order is the following product sequence.

### product-011: Camiseta Volta de Bicicleta

Slug: `camiseta-volta-de-bicicleta`; category: `t-shirts`; audience: `boys`; printed; R$ 59,00 (5900 centavos); curated rank 11.

**Description:** Linhas que lembram trajetos de bicicleta atravessam uma camiseta azul de mangas curtas.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, com espaço no corpo.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `sky-teal-cream` | Azul-céu, verde-petróleo, creme | `#A9CCE0` | `blue`, `green`, `cream` | Azul-céu: `#A9CCE0`; Verde-petróleo: `#246B63`; Creme: `#F3EBDD` |

Default: `sky-teal-cream`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; rib crew neck; hip length. Looping chalk-texture bicycle paths, 2–3 mm strokes with occasional simple wheels, cream and teal on sky blue; no text. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-018 (Short Vai e Vem); product-020 (Calça Passos na Rua).

### product-012: Camiseta Riscos de Giz

Slug: `camiseta-riscos-de-giz`; category: `t-shirts`; audience: `both`; printed; R$ 59,00 (5900 centavos); curated rank 12.

**Description:** Riscos azuis e corais, como desenhos de giz, espalhados em uma camiseta de malha clara.

**Composition:** 100% algodão.

**Fit:** Modelagem reta e mangas curtas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-sky-coral` | Creme, azul-céu, coral suave | `#F3EBDD` | `cream`, `blue`, `pink` | Creme: `#F3EBDD`; Azul-céu: `#A9CCE0`; Coral suave: `#E9A18F` |

Default: `cream-sky-coral`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; rib crew neck; hip length. Irregular chalk-like stripes, 3–5 mm strokes, blue and coral on cream; loosely scattered diagonal groups, no lettering. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-018 (Short Vai e Vem); product-019 (Short Dia de Brincar); product-020 (Calça Passos na Rua).

### product-013: Camiseta Pula Amarelinha

Slug: `camiseta-pula-amarelinha`; category: `t-shirts`; audience: `girls`; printed; R$ 59,00 (5900 centavos); curated rank 13.

**Description:** Casas de amarelinha viram desenhos pequenos nesta camiseta para inventar brincadeiras.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, com comprimento até o quadril.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-coral-teal` | Creme, coral suave, verde-petróleo | `#F3EBDD` | `cream`, `pink`, `green` | Creme: `#F3EBDD`; Coral suave: `#E9A18F`; Verde-petróleo: `#246B63` |

Default: `cream-coral-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; crew neck; no gathers or ties. Small incomplete hopscotch grids, 30–40 mm, coral and teal on cream; no numbers or typography. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-019 (Short Dia de Brincar).

### product-014: Vestido Desenho na Calçada

Slug: `vestido-desenho-na-calcada`; category: `dresses`; audience: `girls`; printed; R$ 129,00 (12900 centavos); curated rank 14.

**Description:** Riscos de giz e uma saia com franzido leve dão forma a este vestido de malha azul.

**Composition:** 100% algodão.

**Fit:** Corpo com folga, mangas curtas e saia acima dos joelhos.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `sky-cream-coral` | Azul-céu, creme, coral suave | `#A9CCE0` | `blue`, `cream`, `pink` | Azul-céu: `#A9CCE0`; Creme: `#F3EBDD`; Coral suave: `#E9A18F` |

Default: `sky-cream-coral`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Jersey dress; short sleeves; round neck; natural-waist seam; gently gathered skirt; no closures or pockets. Chalk-like irregular stripes and small looping paths, cream and coral on sky blue; airy 25–40 mm motif groups. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-015: Conjunto Volta na Rua

Slug: `conjunto-volta-na-rua`; category: `matching-sets`; audience: `boys`; printed; R$ 149,00 (14900 centavos); curated rank 15.

**Description:** Uma camiseta com caminhos de bicicleta e um short verde-petróleo formam este conjunto de duas peças.

**Composition:** 100% algodão.

**Fit:** Camiseta reta e short com cintura elástica, no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-sky-teal` | Creme, azul-céu, verde-petróleo | `#F3EBDD` | `cream`, `blue`, `green` | Creme: `#F3EBDD`; Azul-céu: `#A9CCE0`; Verde-petróleo: `#246B63` |

Default: `cream-sky-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Two jersey pieces: short-sleeve crew-neck T-shirt and plain teal shorts with elastic waist, two side pockets, no drawstring. Looping bicycle paths, 25–40 mm, sky blue and teal on cream T-shirt; shorts plain teal. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Included pieces:** Camiseta de mangas curtas estampada; Short liso com cintura elástica. One product and one price for both pieces; show both pieces in each photograph.

### product-016: Conjunto Pulo de Giz

Slug: `conjunto-pulo-de-giz`; category: `matching-sets`; audience: `girls`; printed; R$ 149,00 (14900 centavos); curated rank 16.

**Description:** Blusa com desenhos de amarelinha e short coral vendidos juntos para brincar de um jeito novo.

**Composition:** 100% algodão.

**Fit:** Blusa sem mangas com alças largas e short solto com cintura elástica.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-coral-teal` | Creme, coral suave, verde-petróleo | `#F3EBDD` | `cream`, `pink`, `green` | Creme: `#F3EBDD`; Coral suave: `#E9A18F`; Verde-petróleo: `#246B63` |

Default: `cream-coral-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Two jersey pieces: broad-strap sleeveless round-neck top and plain coral elastic-waist shorts; straight hems, no ties or pockets. Small hopscotch-grid outlines, 30–40 mm, coral and teal on cream top, no numbers; shorts solid coral. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Included pieces:** Blusa sem mangas estampada; Short liso com cintura elástica. One product and one price for both pieces; show both pieces in each photograph.

### product-017: Blusa Céu da Rua

Slug: `blusa-ceu-da-rua`; category: `tops`; audience: `girls`; plain; R$ 59,00 (5900 centavos); curated rank 17.

**Description:** Blusa canelada sem mangas, de cor lisa, para misturar aos desenhos e às cores da rua.

**Composition:** 95% algodão, 5% elastano.

**Fit:** Modelagem próxima ao corpo, sem compressão; alças largas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `sky` | Azul-céu | `#A9CCE0` | `blue` | Azul-céu: `#A9CCE0` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `sky`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-elastane fine rib, 180 g/m². Cotton-elastane fine-rib top; broad shoulder straps; rounded neckline; straight hip-length hem; no trim or closure. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-018: Short Vai e Vem

Slug: `short-vai-e-vem`; category: `shorts`; audience: `boys`; plain; R$ 89,00 (8900 centavos); curated rank 18.

**Description:** Short de sarja com dois bolsos e cintura elástica, em cores para acompanhar as camisetas da coleção.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Pernas retas com folga, até o meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `sky` | Azul-céu | `#A9CCE0` | `blue` | Azul-céu: `#A9CCE0` |
| `teal` | Verde-petróleo | `#246B63` | `green` | Verde-petróleo: `#246B63` |

Default: `sky`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill shorts; elastic waist; two side pockets; no drawstring or cargo pockets. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-019: Short Dia de Brincar

Slug: `short-dia-de-brincar`; category: `shorts`; audience: `both`; plain; R$ 89,00 (8900 centavos); curated rank 19.

**Description:** Um short de sarja de linhas simples, com cintura elástica, para combinar com os riscos de giz.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Modelagem reta e solta, com comprimento no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `coral` | Coral suave | `#E9A18F` | `pink` | Coral suave: `#E9A18F` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `coral`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill shorts; elastic waist; two side pockets; straight hem; no drawstring, ruffles or logos. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-020: Calça Passos na Rua

Slug: `calca-passos-na-rua`; category: `trousers`; audience: `boys`; plain; R$ 109,00 (10900 centavos); curated rank 20.

**Description:** Calça de sarja com dois bolsos e cores lisas que acompanham os desenhos da coleção.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Cintura elástica e pernas retas até o tornozelo.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `teal` | Verde-petróleo | `#246B63` | `green` | Verde-petróleo: `#246B63` |
| `sky` | Azul-céu | `#A9CCE0` | `blue` | Azul-céu: `#A9CCE0` |

Default: `teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill trousers; elastic waist; two side pockets; straight ankle-length legs; no fly or drawstring. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

## Imaginação em Casa

ID: `collection-003`; slug: `imaginacao-em-casa`.

Uma manta vira cabana, os blocos viram cidade e o papel ganha estrelas. Traços de desenho e cores suaves entram nas histórias inventadas em casa.

Palette: Creme (`#F3EBDD`), Lilás suave (`#C8B8DC`), Verde-petróleo (`#246B63`), Pêssego (`#EDB69B`).

Collection order is the following product sequence.

### product-021: Camiseta Blocos de Ideias

Slug: `camiseta-blocos-de-ideias`; category: `t-shirts`; audience: `boys`; printed; R$ 59,00 (5900 centavos); curated rank 21.

**Description:** Blocos desenhados se espalham na camiseta de malha, como peças de uma construção inventada.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, mangas curtas e comprimento até o quadril.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-teal-peach` | Creme, verde-petróleo, pêssego | `#F3EBDD` | `cream`, `green`, `orange` | Creme: `#F3EBDD`; Verde-petróleo: `#246B63`; Pêssego: `#EDB69B` |

Default: `cream-teal-peach`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; rib crew neck; hip length. Simple building-block squares and arches, 20–30 mm, teal and peach on cream; airy crayon-edge texture, no text. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-029 (Calça Cantinho de Ideias); product-030 (Calça Faz de Conta).

### product-022: Camiseta Estrelas de Papel

Slug: `camiseta-estrelas-de-papel`; category: `t-shirts`; audience: `both`; printed; R$ 59,00 (5900 centavos); curated rank 22.

**Description:** Estrelas pequenas, com traços de desenho, em uma camiseta lilás para histórias de todos os dias.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, com espaço no corpo e mangas curtas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `lilac-cream-teal` | Lilás suave, creme, verde-petróleo | `#C8B8DC` | `purple`, `cream`, `green` | Lilás suave: `#C8B8DC`; Creme: `#F3EBDD`; Verde-petróleo: `#246B63` |

Default: `lilac-cream-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Straight short-sleeve jersey T-shirt; rib crew neck; hip length. Simple irregular five-point stars, 15–25 mm, cream and teal on soft lilac; scattered, no glitter or lettering. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-028 (Short Canto de Brincar); product-029 (Calça Cantinho de Ideias); product-030 (Calça Faz de Conta).

### product-023: Blusa Traços de Imaginação

Slug: `blusa-tracos-de-imaginacao`; category: `tops`; audience: `girls`; printed; R$ 69,00 (6900 centavos); curated rank 23.

**Description:** Traços de giz de cera em uma blusa sem mangas para combinar com as cores das brincadeiras em casa.

**Composition:** 100% algodão.

**Fit:** Modelagem levemente ampla, com alças largas e barra reta.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-lilac-peach` | Creme, lilás suave, pêssego | `#F3EBDD` | `cream`, `purple`, `orange` | Creme: `#F3EBDD`; Lilás suave: `#C8B8DC`; Pêssego: `#EDB69B` |

Default: `cream-lilac-peach`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Sleeveless jersey top; broad shoulder straps; rounded neckline; straight hip-length hem; no fasteners or ties. Short crayon-like marks, 20–30 mm, lilac and peach on cream; airy scattered clusters. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-028 (Short Canto de Brincar).

### product-024: Vestido Histórias de Estrelas

Slug: `vestido-historias-de-estrelas`; category: `dresses`; audience: `girls`; printed; R$ 129,00 (12900 centavos); curated rank 24.

**Description:** Uma saia levemente franzida e estrelas desenhadas para acompanhar as histórias da brincadeira.

**Composition:** 100% algodão.

**Fit:** Mangas curtas, corpo com folga e saia acima dos joelhos.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `peach-teal-cream` | Pêssego, verde-petróleo, creme | `#EDB69B` | `orange`, `green`, `cream` | Pêssego: `#EDB69B`; Verde-petróleo: `#246B63`; Creme: `#F3EBDD` |

Default: `peach-teal-cream`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Jersey dress; short sleeves; rounded neckline; natural-waist seam; gently gathered skirt; no pockets or closure. Simple five-point stars, 20–30 mm, cream and teal on peach; irregular crayon outlines, no glitter. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-025: Conjunto Mundo de Blocos

Slug: `conjunto-mundo-de-blocos`; category: `matching-sets`; audience: `boys`; printed; R$ 149,00 (14900 centavos); curated rank 25.

**Description:** Camiseta com blocos desenhados e short verde-petróleo vendidos juntos para construir novas histórias.

**Composition:** 100% algodão.

**Fit:** Camiseta reta e short com cintura elástica e comprimento no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-lilac-teal` | Creme, lilás suave, verde-petróleo | `#F3EBDD` | `cream`, `purple`, `green` | Creme: `#F3EBDD`; Lilás suave: `#C8B8DC`; Verde-petróleo: `#246B63` |

Default: `cream-lilac-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Two jersey pieces: short-sleeve round-neck T-shirt and plain teal elastic-waist shorts with two side pockets; no drawstring. Building-block squares and arches, 20–30 mm, lilac and teal on cream T-shirt; shorts plain teal. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Included pieces:** Camiseta de mangas curtas estampada; Short liso com cintura elástica. One product and one price for both pieces; show both pieces in each photograph.

### product-026: Casaco Rabiscos de Casa

Slug: `casaco-rabiscos-de-casa`; category: `light-layers`; audience: `both`; printed; R$ 129,00 (12900 centavos); curated rank 26.

**Description:** Uma camada leve de moletinho com pequenos rabiscos para vestir sobre as peças da coleção.

**Composition:** 100% algodão.

**Fit:** Modelagem reta, mangas longas e comprimento até o quadril.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `cream-lilac-teal` | Creme, lilás suave, verde-petróleo | `#F3EBDD` | `cream`, `purple`, `green` | Creme: `#F3EBDD`; Lilás suave: `#C8B8DC`; Verde-petróleo: `#246B63` |

Default: `cream-lilac-teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Lightweight cotton loopback, 220 g/m². Lightweight cotton loopback open-front cardigan; long sleeves and cotton rib cuffs; no fasteners, hood or pockets. Small crayon marks and stars, 15–25 mm, lilac and teal on cream; airy repeat, no text. Use the first garment color as the base; use remaining garment colors for the print, exactly as described. For sets, follow the explicitly specified plain-bottom color. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

**Coordinating plain separates:** product-028 (Short Canto de Brincar); product-029 (Calça Cantinho de Ideias); product-030 (Calça Faz de Conta).

### product-027: Blusa Cor de História

Slug: `blusa-cor-de-historia`; category: `tops`; audience: `girls`; plain; R$ 59,00 (5900 centavos); curated rank 27.

**Description:** Blusa canelada sem mangas, em duas cores lisas para criar combinações do seu jeito.

**Composition:** 95% algodão, 5% elastano.

**Fit:** Modelagem próxima ao corpo, sem compressão; alças largas.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `lilac` | Lilás suave | `#C8B8DC` | `purple` | Lilás suave: `#C8B8DC` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `lilac`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-elastane fine rib, 180 g/m². Cotton-elastane fine-rib sleeveless top; broad straps; rounded neck; straight hip-length hem; no trim or closures. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-028: Short Canto de Brincar

Slug: `short-canto-de-brincar`; category: `shorts`; audience: `girls`; plain; R$ 89,00 (8900 centavos); curated rank 28.

**Description:** Short de sarja com dois bolsos e cintura elástica para combinar com traços e estrelas.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Pernas soltas, com barra no meio da coxa.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `peach` | Pêssego | `#EDB69B` | `orange` | Pêssego: `#EDB69B` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `peach`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill shorts; elastic waist; two side pockets; straight hem; no drawstring or ruffles. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-029: Calça Cantinho de Ideias

Slug: `calca-cantinho-de-ideias`; category: `trousers`; audience: `boys`; plain; R$ 109,00 (10900 centavos); curated rank 29.

**Description:** Uma calça de sarja de linhas retas, para compor as cores das histórias em casa.

**Composition:** 98% algodão, 2% elastano.

**Fit:** Cintura elástica e pernas retas até o tornozelo.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `teal` | Verde-petróleo | `#246B63` | `green` | Verde-petróleo: `#246B63` |
| `cream` | Creme | `#F3EBDD` | `cream` | Creme: `#F3EBDD` |

Default: `teal`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton-stretch twill, 190 g/m². Cotton-stretch twill trousers; elastic waist; two side pockets; straight ankle-length legs; no fly or drawstring. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

### product-030: Calça Faz de Conta

Slug: `calca-faz-de-conta`; category: `trousers`; audience: `boys`; plain; R$ 109,00 (10900 centavos); curated rank 30.

**Description:** Calça de malha com cintura elástica e cores lisas para misturar às estampas de blocos e estrelas.

**Composition:** 100% algodão.

**Fit:** Modelagem solta, com pernas retas e comprimento até o tornozelo.

| Colorway ID | Shopper-facing name | Swatch | Families | Garment colors |
| --- | --- | --- | --- | --- |
| `lilac` | Lilás suave | `#C8B8DC` | `purple` | Lilás suave: `#C8B8DC` |
| `peach` | Pêssego | `#EDB69B` | `orange` | Pêssego: `#EDB69B` |

Default: `lilac`. Sizes: 2, 4, 6, 8; initially unselected.

**Garment brief:** Cotton single jersey, 160 g/m². Cotton jersey trousers; elastic waist; two side pockets; straight relaxed ankle-length legs; no cuffs, drawstring or fly. Solid color, no print. Apply each colorway as a single solid color over the entire garment, including binding and thread. Tonal stitching; no visible logos, slogans, embroidery or extra trim. Keep every silhouette and print consistent across all four sizes and both photograph roles.

## Merchandising

Global curated order: product-001 through product-030, explicitly listed in the catalog. Collection ordering is its listed ten IDs; future related-product selection takes the first four other products from the same list. No imaginary release dates or sales counts are used.

Eight new arrivals, in order: product-023, product-025, product-021, product-024, product-001, product-005, product-011, product-016.

Homepage new-arrival section: product-023, product-025, product-021, product-024; “Ver todos” opens `/novidades`. These four feature Imaginação em Casa. First editorial feature: Quintal de Descobertas, linking to its collection. Second collection feature: Brincadeira de Rua, with product-011, product-017, product-019, product-016; “Ver todos” opens its collection. The short brand introduction also offers “Conheça Imaginação em Casa”. All three collections appear in the collection index and footer.

| Category tile | Photograph selection for later production | Destination |
| --- | --- | --- |
| Camisetas | product-001 / cream-leaf-teal, model-first photograph | `/produtos?categoria=t-shirts` |
| Blusas | product-023 / cream-lilac-peach, model-first photograph | `/produtos?categoria=tops` |
| Shorts | product-019 / coral, model-first photograph | `/produtos?categoria=shorts` |
| Calças | product-029 / teal, model-first photograph | `/produtos?categoria=trousers` |
| Vestidos | product-005 / cream-leaf-butter, model-first photograph | `/produtos?categoria=dresses` |
| Conjuntos | product-016 / cream-coral-teal, model-first photograph | `/produtos?categoria=matching-sets` |
| Peças leves | product-010 / teal, model-first photograph | `/produtos?categoria=light-layers` |

No new editorial photographs are requested for these tiles. Use the later approved catalog model photograph at 3:4.

## Copy, size and checkout review

Hero: “Um dia inteiro para brincar”. Supporting sentence: “Roupas para descobrir o quintal, brincar na rua e inventar histórias em casa.”. Exact actions: “Comprar para meninas” and “Comprar para meninos”.

The complete brand opening/two sections, homepage features, route introductions, metadata, shared navigation/footer, browsing/filter/sort/search, product/gallery/size/cart/favorites, restoration/error feedback and checkout/confirmation copy are in [copy-proposal.json](copy-proposal.json). Values in braces are substitution tokens for actual catalog names, counts, query, option or UI state, not unfinished copy. Render text as text, never raw HTML. Select singular/plural count forms correctly; format currency as BRL with pt-BR conventions. Gallery indexes are one-based. Combine restoration details into one notice, including only changes that occurred; announce each store’s recovery once, each save warning once. Missing/invalid data and unsupported envelopes have separate messages; never claim unavailable saved data was erased.

Fictional editable delivery defaults: Marina Oliveira; marina.oliveira@example.com; CEP 01311-000; Rua das Pequenas Descobertas, 120, Apartamento 24, Bela Vista, São Paulo/SP. The email uses the reserved example.com domain; no message is sent. Street/person are fictional; the CEP is a syntactically valid eight-digit example, not a promised address match. Validation stays local. No CPF, phone, credentials, address lookup or purchase endpoint.

Shipping: “Entrega padrão”, R$15,90 (1590 centavos), “5 a 8 dias úteis”, fixed independent of address. This is the already-required illustration; add no shipping guarantee. Pix is initially selected; “Cartão” is the alternative. No payment instruction or credential prompt.

“Selecione um tamanho”, “Explorar produtos”, “Limpar filtros”, “Tentar novamente”, “Finalizar compra” and “Continuar comprando” preserve the required wording. Before successful Finalizar compra, expose no fictional-store/simulation notice. After completion, display exactly:

> Esta compra foi uma simulação. Nenhum pagamento foi realizado e nenhum pedido foi criado.

No order number, email promise, discount, installment, contact/newsletter/social action, sustainability/certification claim or external sizing-standard claim is included. Successful completion preserves favorites; a failed saved-cart update uses the explicit warning that previous choices can return on reload. Pre-commit failure uses retry copy and retains selections and input.

The size chart is an invented, internally consistent brand body-measurement reference for this offering. It is not an external standard or a garment-dimension chart.

| Tamanho | Altura (cm) | Tórax (cm) | Cintura (cm) | Quadril (cm) |
| --- | --- | --- | --- | --- |
| 2 | 86–95 | 50–54 | 48–52 | 52–56 |
| 4 | 96–107 | 55–59 | 53–56 | 57–62 |
| 6 | 108–119 | 60–64 | 57–60 | 63–68 |
| 8 | 120–131 | 65–69 | 61–64 | 69–74 |

Compare as medidas do corpo da criança com a tabela. As medidas estão em centímetros e servem como referência para escolher o tamanho.

- Altura: Sem sapatos, meça do chão até o topo da cabeça, com a criança em pé.
- Tórax: Passe a fita ao redor da parte mais larga do peito, sem apertar.
- Cintura: Meça ao redor da cintura natural, com a criança relaxada e sem prender a respiração.
- Quadril: Passe a fita ao redor da parte mais larga do quadril, com os pés juntos.

Se as medidas ficarem entre dois tamanhos ou indicarem tamanhos diferentes, escolha o maior. Veja também a indicação de como cada peça veste. Se alguma medida passar do intervalo do tamanho 8, a tabela não indica um tamanho adequado para essa medida.

## Verification

A one-off Bun content check passed against the proposed JSON: unique product/collection IDs and slugs; 30/42 totals; seven category totals and price ranges; each collection’s 10/6/4 and 4/4/2 allocations; four offered sizes and deliberate no-size default; colorway count/unique IDs/default membership/hex swatches/family references; required product/brief fields; two pieces for every matching set; coordinating plain bottoms in the same collection with shared colors and suitable audience coverage for every printed separate; unique/scoped curated/new-arrival/homepage/category selections; 27 state options; eight-digit default CEP; fixed shipping/Pix; exact disclosure; increasing non-overlapping body-measurement intervals. This validates proposal structure only, not human approval, photographs, website behavior or release readiness.

Review history: proposal v1 prepared and validated; complete package presented; user replied “approved”; approval recorded on 9 October 2026 against the exact reviewed hashes above. Only approval-status metadata changed afterward, with approved-file hashes in approval.json. Any later catalog, brief, copy, size or merchandising change requires renewed review of the affected content.
