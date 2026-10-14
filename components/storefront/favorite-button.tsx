"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/docs/content/copy-proposal.json";
import { useFavorites } from "./favorites-provider";

export function FavoriteButton({ productId, name, card = false, disabled = false, onRemoved }: {
  productId: string; name: string; card?: boolean; disabled?: boolean; onRemoved?: () => void;
}) {
  const { favorites, snapshot, announce } = useFavorites();
  const pending = snapshot.restoration === "pending";
  const saved = !pending && favorites.has(productId);
  const label = pending ? copy.favorites.pending : (saved ? copy.favorites.remove : copy.favorites.save).replace("{product}", name);
  return <Button className={card ? "card-favorite" : "detail-favorite"} variant="outline" size={card ? "icon" : "default"}
    disabled={pending || disabled} aria-label={label} aria-pressed={pending ? undefined : saved} aria-busy={pending}
    onClick={() => {
      const outcome = favorites.toggle(productId);
      announce((outcome.status === "rejected" ? copy.favorites.invalidProduct
        : outcome.effect === "saved" ? copy.favorites.added : copy.favorites.removed).replace("{product}", name));
      if (outcome.status === "success" && outcome.effect === "removed") onRemoved?.();
    }}>
    <Heart aria-hidden="true" fill={saved ? "currentColor" : "none"} />{card ? null : copy.navigation.favorites}
  </Button>;
}
