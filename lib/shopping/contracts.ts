import type { Product, Colorway, DeepReadonly } from "../catalog";

export type CommandOutcome<T extends string, R extends string> =
  | { readonly status: "success"; readonly effect: T }
  | { readonly status: "rejected"; readonly reason: R };
export type Selection = { readonly productId: string; readonly colorwayId: string; readonly size: number };
export type CartLine = Selection & { readonly quantity: number };
export type ResolvedLine = CartLine & { readonly product: Product; readonly colorway: Colorway; readonly totalCents: number };
export type RestorationStatus = "pending" | "ready" | "temporary";
export type PersistenceStatus = "idle" | "saved" | "unavailable";
export type StorageStatus = { readonly restoration: RestorationStatus; readonly persistence: PersistenceStatus };
export type CartOutcome = CommandOutcome<"added" | "merged" | "quantity-limited" | "updated" | "removed" | "cleared", "not-ready" | "invalid-selection" | "invalid-quantity" | "missing-line">;
export interface CartSnapshot extends StorageStatus {
  readonly lines: readonly ResolvedLine[]; readonly units: number; readonly subtotalCents: number;
}
export interface Cart {
  getSnapshot(): CartSnapshot;
  subscribe(listener: () => void): () => void;
  add(selection: Selection, quantity?: number): CartOutcome;
  setQuantity(selection: Selection, quantity: number): CartOutcome;
  remove(selection: Selection): CartOutcome;
  clear(): CartOutcome;
}
export type FavoritesOutcome = CommandOutcome<"saved" | "removed", "not-ready" | "invalid-product">;
export interface FavoritesSnapshot extends StorageStatus { readonly products: readonly Product[]; readonly count: number }
export interface Favorites {
  getSnapshot(): FavoritesSnapshot;
  subscribe(listener: () => void): () => void;
  has(productId: string): boolean;
  toggle(productId: string): FavoritesOutcome;
}
export type Delivery = { name: string; email: string; postalCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string };
export type Payment = "pix" | "card";
export type CheckoutDraft = DeepReadonly<{ delivery: Delivery; payment: Payment }>;
export type DeliveryErrors = Partial<Record<keyof Delivery, "required" | "invalid">>;
export type CheckoutTotals = { readonly subtotalCents: number; readonly shippingCents: number; readonly totalCents: number };
export type Confirmation = DeepReadonly<{ lines: readonly ResolvedLine[]; draft: CheckoutDraft; totals: CheckoutTotals }>;
export type CheckoutOutcome = CommandOutcome<"updated" | "completed" | "discarded", "not-ready" | "invalid-draft" | "empty-cart" | "busy" | "pre-commit-failure">;
export interface Checkout {
  getDraft(): CheckoutDraft;
  updateDraft(draft: CheckoutDraft): CheckoutOutcome;
  validateDelivery(delivery: Delivery): DeliveryErrors;
  totals(): CheckoutTotals;
  complete(): Promise<CheckoutOutcome>;
  getConfirmation(): Confirmation | null;
  discardConfirmation(): CheckoutOutcome;
}
