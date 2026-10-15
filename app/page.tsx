import Link from "next/link";
import { catalog, newArrivals, productsForIds, findProduct } from "@/lib/catalog";
import { homeCopy, homepagePhoto } from "@/lib/presentation/editorial";
import { productCard } from "@/lib/presentation/catalog";
import { ProductCard } from "@/components/storefront/product-card";
import { EditorialPicture } from "@/components/storefront/editorial-picture";
import { Carousel } from "@/components/storefront/carousel";
import { ShopTheLook } from "@/components/storefront/shop-the-look";

const carouselSizes = "(min-width: 1024px) calc((100vw - 168px) / 4), (min-width: 768px) 30vw, 70vw";
function ProductCarousel({ heading, products, href, id }: { heading: string; products: ReturnType<typeof newArrivals>; href: string; id: string }) {
  return <section className="home-section" aria-labelledby={id} data-home-section={id}>
    <h2 id={id} className="editorial-heading">{heading}</h2>
    <Carousel label={heading}>{products.map(product => <ProductCard key={product.id} product={productCard(product)} sizes={carouselSizes} headingLevel={3} />)}</Carousel>
    <Link className="editorial-text-link carousel-view-all" href={href}>{id === "new-arrivals" ? homeCopy.newArrivals.viewAll.label : homeCopy.secondCarousel.viewAll.label}</Link>
  </section>;
}

export default function Home() {
  return (
    <main id="main-content" className="homepage">
      <section className="editorial-hero" aria-labelledby="hero-heading" data-home-section="hero">
        <div className="hero-panel hero-left">
          <EditorialPicture photo={homepagePhoto("hero-left-wide")} eager sizes="(min-width:1024px) 50vw, 100vw" variants={[
            { media: "(max-width:479px)", photo: homepagePhoto("hero-left", "portrait") },
            { media: "(max-width:767px)", photo: homepagePhoto("hero-left", "narrow") },
            { media: "(max-width:1023px)", photo: homepagePhoto("hero-left-tablet") },
            { media: "(max-width:1279px)", photo: homepagePhoto("hero-left", "narrow") },
          ]} />
          <div className="hero-copy"><p className="editorial-eyebrow">{homeCopy.hero.eyebrow}</p><h1 id="hero-heading">{homeCopy.hero.heading}</h1>
            <div className="hero-actions">{homeCopy.hero.actions.map(action => <Link key={action.href} href={action.href}>{action.label}</Link>)}</div>
          </div>
        </div>
        <div className="hero-panel hero-right"><EditorialPicture photo={homepagePhoto("hero-right-wide")} sizes="50vw" variants={[{ media: "(max-width:1279px)", photo: homepagePhoto("hero-right", "narrow") }]} /></div>
      </section>
      <ProductCarousel id="new-arrivals" heading={homeCopy.newArrivals.heading} products={newArrivals()} href={homeCopy.newArrivals.viewAll.href} />
      <section className="promo-heading-strip" data-home-section="promo" aria-labelledby="promo-heading"><p className="editorial-eyebrow">{homeCopy.promoStrip.eyebrow}</p><h2 id="promo-heading">{homeCopy.promoStrip.heading}</h2><Link className="editorial-text-link" href={homeCopy.promoStrip.action.href}>{homeCopy.promoStrip.action.label}</Link></section>
      <section className="category-section" aria-label={homeCopy.categories.heading} data-home-section="categories">
        <Carousel kind="categories" label={homeCopy.categories.heading}>{catalog.categories.map(category => <li key={category.id} className="category-tile"><Link href={`/produtos?categoria=${category.id}`}><div className="category-photo"><EditorialPicture photo={homepagePhoto(`category-${category.id}`)} sizes="(min-width:1024px) 30vw, (min-width:768px) 42vw, 75vw" /></div><span>{category.name}</span></Link></li>)}</Carousel>
      </section>
      <section className="home-editorial quote-editorial" data-home-section="quote" aria-labelledby="dresses-heading">
        <div className="editorial-background"><EditorialPicture photo={homepagePhoto("quote-garments", "desktop")} variants={[{ media: "(max-width:767px)", photo: homepagePhoto("quote-garments", "compact") }]} /></div>
        <div className="editorial-overlay"><h2 id="dresses-heading">{homeCopy.quote.heading}</h2><p>{homeCopy.quote.body}</p><Link className="editorial-text-link" href={homeCopy.quote.action.href}>{homeCopy.quote.action.label}</Link></div>
      </section>
      <section className="home-editorial collection-editorial" data-home-section="collection-feature" aria-labelledby="collection-feature-heading">
        <div className="editorial-background"><EditorialPicture photo={homepagePhoto("editorial-quintal", "desktop")} variants={[{ media: "(max-width:767px)", photo: homepagePhoto("editorial-quintal", "compact") }]} /></div>
        <div className="editorial-overlay"><p className="editorial-eyebrow">{homeCopy.editorial.eyebrow}</p><h2 id="collection-feature-heading">{homeCopy.editorial.heading}</h2><p>{homeCopy.editorial.body}</p><Link className="editorial-action" href={homeCopy.editorial.action.href}>{homeCopy.editorial.action.label}</Link></div>
      </section>
      <section className="home-section shop-the-look" data-home-section="looks" aria-labelledby="looks-heading"><h2 id="looks-heading" className="editorial-heading">{homeCopy.shopTheLook.heading}</h2>
        <ShopTheLook looks={homeCopy.shopTheLook.tabs.map(tab => ({ id: tab.id, label: tab.label, content: <div className="look-content"><div className="look-photo"><EditorialPicture photo={homepagePhoto(tab.imageId)} sizes="(min-width:1024px) 50vw, 100vw" /></div><ul className="look-products">{tab.products.map(entry => {
          const result = findProduct(entry.productId);
          if (result.status === "missing") throw new Error(`Missing look product: ${entry.productId}`);
          return <ProductCard key={entry.productId} headingLevel={3} product={{ ...productCard(result.value), defaultColorwayId: entry.colorwayId }} sizes="(min-width:1024px) 24vw, 45vw" />;
        })}</ul></div> }))} />
      </section>
      <ProductCarousel id="street-play" heading={homeCopy.secondCarousel.heading} products={productsForIds(catalog.merchandising.homepage.secondCollectionFeature.productIds)} href={homeCopy.secondCarousel.viewAll.href} />
      <section className="home-section social-section" data-home-section="social" aria-labelledby="social-heading"><h2 id="social-heading" className="editorial-heading">{homeCopy.social.heading}</h2><Carousel kind="social" label={homeCopy.social.heading}>{homeCopy.social.captions.map((caption, index) => <li key={caption}><figure><div className="social-photo"><EditorialPicture photo={homepagePhoto(`social-${index + 1}`)} sizes="(min-width:1024px) 20vw, (min-width:768px) 30vw, 65vw" /></div><figcaption>{caption}</figcaption></figure></li>)}</Carousel></section>
    </main>
  );
}
