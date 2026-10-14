import { copy } from "@/lib/catalog";
import { FavoritesContent } from "@/components/storefront/favorites-content";
import { pageMetadata } from "@/lib/presentation/metadata";
export const metadata = pageMetadata(copy.editorial.pages.favorites.heading, "/favoritos");
export default function Page() {
  return <main id="main-content" className="content-container editorial-entry"><div className="page-intro"><h1>{copy.editorial.pages.favorites.heading}</h1><p>{copy.editorial.pages.favorites.intro}</p></div><FavoritesContent /></main>;
}
