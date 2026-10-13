import { copy, identity } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
import { EditorialPicture } from "@/components/storefront/editorial-picture";
import { editorialPhoto } from "@/lib/presentation/editorial";
import { AssetImage } from "@/components/storefront/asset-image";
export const metadata = pageMetadata(copy.editorial.brand.pageTitle, "/sobre");
export default function Page() {
  const motifs = identity.assets.filter(a => a.id.startsWith("motif-"));
  return <main id="main-content" className="editorial-page brand-page"><div className="editorial-opening"><EditorialPicture photo={editorialPhoto("brand-opening-v2", "desktop")} variants={[{ media: "(max-width:767px)", photo: editorialPhoto("brand-opening-v2", "compact") }]} eager /></div><div className="brand-intro editorial-padding"><h1>{copy.editorial.brand.openingHeading}</h1><p>{copy.editorial.brand.openingBody}</p></div>{copy.editorial.brand.sections.map((section, index) => <section className="brand-section" key={section.heading}><div className="brand-section-photo"><EditorialPicture photo={editorialPhoto(index === 0 ? "brand-play-v2" : "brand-combinations-v2", "desktop")} sizes="(min-width:1024px) 50vw, 100vw" /></div><div className="brand-section-copy">{motifs[index] ? <AssetImage src={motifs[index].path.replace(/^public/, "")} width={72} height={72} alt="" aria-hidden="true" className="brand-motif" /> : null}<h2>{section.heading}</h2><p>{section.body}</p></div></section>)}</main>;
}
