"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createCart } from "@/lib/cart";
import type { Cart, CartSnapshot } from "@/lib/shopping/contracts";

const CartContext = createContext<{ cart: Cart; initial: CartSnapshot } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => {
    const cart = createCart(() => window.localStorage);
    return { cart, initial: cart.getSnapshot() };
  });
  const { cart } = session;
  useEffect(() => { cart.restore(); }, [cart]);
  return <CartContext value={session}>{children}</CartContext>;
}

export function useCart() {
  const session = useContext(CartContext);
  if (!session) throw new Error("CartProvider is required");
  // Every subscriber must hydrate against the same pending server snapshot,
  // even when a streamed product mounts after the provider has restored.
  const { cart, initial } = session;
  const snapshot = useSyncExternalStore(cart.subscribe, cart.getSnapshot, () => initial);
  return { cart, snapshot };
}
