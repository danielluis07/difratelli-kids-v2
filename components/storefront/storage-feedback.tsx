"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/catalog";
import type { StorageStatus } from "@/lib/shopping/contracts";
import { useCart } from "./cart-provider";
import { useFavorites } from "./favorites-provider";

function Notice({ text, name }: { text: string; name: string }) {
  const [dismissed, setDismissed] = useState(false);
  return <div className="storage-notice" data-visible={Boolean(text) && !dismissed}>
    <p role="status" aria-atomic="true">{dismissed ? "" : text}</p>
    {text && !dismissed ? <Button variant="ghost" size="icon" aria-label={`${copy.recovery.noticeDismiss} — ${name}`} onClick={() => setDismissed(true)}><X aria-hidden="true" /></Button> : null}
  </div>;
}

// Mounted once in the shared layout, so navigating/opening a Sheet or executing
// another command never repeats a dismissed recovery or failure notice.
function StorageFeedback({ snapshot, kind }: { snapshot: StorageStatus; kind: "cart" | "favorites" }) {
  const messages = copy.recovery[kind];
  const recovery = snapshot.recovery;
  const details = kind === "cart" ? [
    recovery?.removed ? copy.recovery.cart.removed : "",
    recovery?.duplicates ? copy.recovery.cart.duplicates : "",
    recovery?.quantities ? copy.recovery.cart.quantities : "",
    recovery?.prices ? copy.recovery.cart.prices : "",
  ] : [
    recovery?.removed ? copy.recovery.favorites.removed : "",
    recovery?.duplicates ? copy.recovery.favorites.deduplicated : "",
  ];
  const name = kind === "cart" ? copy.cart.title : copy.navigation.favorites;
  return <div className="storage-feedback" data-store={kind}>
    <Notice name={name} text={details.filter(Boolean).join(" ")} />
    <Notice name={name} text={snapshot.warning ? messages[snapshot.warning] : ""} />
  </div>;
}

export function ShoppingFeedback() {
  const { snapshot: cart } = useCart();
  const { snapshot: favorites } = useFavorites();
  return <aside className="shopping-feedback" aria-label={`${copy.cart.title} · ${copy.navigation.favorites}`}>
    <StorageFeedback snapshot={cart} kind="cart" />
    <StorageFeedback snapshot={favorites} kind="favorites" />
  </aside>;
}
