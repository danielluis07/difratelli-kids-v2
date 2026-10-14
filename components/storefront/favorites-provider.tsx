"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createFavorites } from "@/lib/favorites";
import type { Favorites, FavoritesSnapshot } from "@/lib/shopping/contracts";

const FavoritesContext = createContext<{
  favorites: Favorites; initial: FavoritesSnapshot; announce(text: string): void;
} | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => {
    const favorites = createFavorites(() => window.localStorage);
    return { favorites, initial: favorites.getSnapshot() };
  });
  const [message, setMessage] = useState<{ text: string; sequence: number } | null>(null);
  useEffect(() => { session.favorites.restore(); }, [session]);
  function announce(text: string) { setMessage(previous => ({ text, sequence: (previous?.sequence ?? 0) + 1 })); }
  return <FavoritesContext value={{ ...session, announce }}>
    {children}
    <p role="status" aria-atomic="true" className="sr-only favorites-announcement"><span key={message?.sequence}>{message?.text ?? ""}</span></p>
  </FavoritesContext>;
}

export function useFavorites() {
  const session = useContext(FavoritesContext);
  if (!session) throw new Error("FavoritesProvider is required");
  const { favorites, initial, announce } = session;
  const snapshot = useSyncExternalStore(favorites.subscribe, favorites.getSnapshot, () => initial);
  return { favorites, snapshot, announce };
}
