import { copy } from "../catalog";
import type { CheckoutDraft, CheckoutTotals, Delivery, DeliveryErrors } from "../shopping/contracts";
import { freezeRecords } from "../catalog/records";
export type { Checkout, CheckoutOutcome, Confirmation, CheckoutDraft, Delivery, DeliveryErrors } from "../shopping/contracts";

export function initialCheckoutDraft(): CheckoutDraft {
  return freezeRecords({ delivery: { ...copy.checkout.defaults }, payment: "pix" as const });
}
export function validateDelivery(delivery: Delivery): DeliveryErrors {
  const errors: DeliveryErrors = {};
  for (const key of ["name", "email", "postalCode", "street", "number", "neighborhood", "city", "state"] as const) {
    if (typeof delivery[key] !== "string" || !delivery[key].trim()) errors[key] = "required";
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email.trim())) errors.email = "invalid";
  if (!errors.postalCode && !/^\d{8}$/.test(delivery.postalCode.replace(/[\s-]/g, ""))) errors.postalCode = "invalid";
  if (!errors.number && !/^(?:\d+[a-zA-Z]?|s\/n)$/i.test(delivery.number.trim())) errors.number = "invalid";
  if (!errors.state && !copy.checkout.states.some((state) => state.id === delivery.state)) errors.state = "invalid";
  return Object.freeze(errors);
}
export function checkoutTotals(subtotalCents: number): CheckoutTotals {
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 0 || !Number.isSafeInteger(subtotalCents + copy.checkout.shipping.priceCents)) throw new RangeError("Invalid integer-centavo subtotal");
  return Object.freeze({ subtotalCents, shippingCents: copy.checkout.shipping.priceCents, totalCents: subtotalCents + copy.checkout.shipping.priceCents });
}
