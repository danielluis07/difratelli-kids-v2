import homepageCopy from "@/docs/content/homepage-copy-proposal.json";
import heroIntegration from "@/docs/content/hero-color-refresh-integration.json";

// Keep the original content review intact; current storefront wording lives here.
export const homeCopy = {
  ...homepageCopy,
  announcement: [
    { text: "Moda infantil de 2 a 8 anos.", details: { label: "Ver roupas", href: "/produtos" } },
    { text: "Novidades para renovar as combinações do dia a dia.", details: { label: "Ver novidades", href: "/novidades" } },
    { text: "Conheça as cores e estampas das nossas coleções.", details: { label: "Ver coleções", href: "/colecoes" } },
  ],
  hero: {
    ...homepageCopy.hero,
    heading: "Estilo para todos os dias",
    actions: heroIntegration.heroActions,
  },
  newArrivals: {
    ...homepageCopy.newArrivals,
    heading: "Novidades da temporada",
    viewAll: { ...homepageCopy.newArrivals.viewAll, label: "Ver novidades" },
  },
  promoStrip: {
    eyebrow: "Cores, estampas e combinações",
    heading: "Peças que combinam entre si",
    action: { ...homepageCopy.promoStrip.action, label: "Conhecer as coleções" },
  },
  categories: { ...homepageCopy.categories, heading: "Compre por categoria" },
  quote: {
    heading: "Leveza em cada detalhe",
    body: "Vestidos com estampas botânicas e tons suaves para compor o guarda-roupa do dia a dia.",
    action: { ...homepageCopy.quote.action, label: "Ver vestidos" },
  },
  editorial: {
    ...homepageCopy.editorial,
    heading: "Tons naturais, novas combinações",
    body: "Verdes e tons de creme encontram estampas inspiradas na natureza. Escolha suas peças favoritas e combine com os básicos do dia a dia.",
    action: { ...homepageCopy.editorial.action, label: "Ver coleção" },
  },
  shopTheLook: {
    ...homepageCopy.shopTheLook,
    heading: "Inspirações para vestir",
    tabs: homepageCopy.shopTheLook.tabs.map((tab, index) => ({
      ...tab,
      label: ["Tons naturais", "Cores em contraste", "Tons suaves"][index],
    })),
  },
  secondCarousel: {
    ...homepageCopy.secondCarousel,
    heading: "Cor e movimento",
    viewAll: { ...homepageCopy.secondCarousel.viewAll, label: "Ver coleção" },
  },
  social: {
    ...homepageCopy.social,
    heading: "O dia a dia em Difratelli",
    captions: [
      "Estampas inspiradas na natureza",
      "Detalhes em verde e creme",
      "Combinações para dias ao ar livre",
      "Cores que acompanham o movimento",
      "Conforto para ficar à vontade",
      "Tons suaves em boa companhia",
      "Inspiração para todos os dias",
    ],
  },
};
