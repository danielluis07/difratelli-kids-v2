"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { createCheckout } from "@/lib/checkout";
import type { Checkout, CheckoutSnapshot } from "@/lib/shopping/contracts";
import { useCart } from "./cart-provider";

const CheckoutContext = createContext<{ checkout: Checkout; initial: CheckoutSnapshot } | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { cart } = useCart();
  const [session] = useState(() => {
    const checkout = createCheckout(cart);
    return { checkout, initial: checkout.getSnapshot() };
  });
  return <CheckoutContext value={session}>{children}</CheckoutContext>;
}

export function useCheckout() {
  const session = useContext(CheckoutContext);
  if (!session) throw new Error("CheckoutProvider is required");
  const { checkout, initial } = session;
  const snapshot = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot, () => initial);
  return { checkout, snapshot };
}
