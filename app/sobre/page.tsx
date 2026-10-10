import { copy } from "@/lib/catalog";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.brand.pageTitle, "/sobre");
export default function Page() {
  return <main id="main-content" className="content-container editorial-entry"><div className="page-intro"><h1>{copy.editorial.brand.openingHeading}</h1><p>{copy.editorial.brand.openingBody}</p></div></main>;
}
