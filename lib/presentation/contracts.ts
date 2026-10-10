import type { BrowseScope, BrowseState } from "../browsing";
import type { Cart, Favorites, Checkout } from "../shopping/contracts";

// Presentation translates typed outcomes into approved copy and focus feedback.
// Browser navigation and personalized lifetimes belong to subsequent UI slices.
export interface PresentationServices {
  readonly cart: Cart;
  readonly favorites: Favorites;
  readonly checkout: Checkout;
  pushBrowseState(scope: BrowseScope, state: BrowseState): void;
  replaceProductColor(colorwayId: string): void;
  announce(message: string): void;
}
