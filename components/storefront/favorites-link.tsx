"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import copy from "@/docs/content/copy-proposal.json";
import { useFavorites } from "./favorites-provider";

export function FavoritesLink({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  const { snapshot } = useFavorites();
  const pending = snapshot.restoration === "pending";
  const label = pending ? copy.favorites.pending : snapshot.count === 0 ? copy.favorites.count.zero
    : snapshot.count === 1 ? copy.favorites.count.one : copy.favorites.count.many.replace("{count}", String(snapshot.count));
  return <Link href="/favoritos" onClick={onClick} aria-label={label}
    className={cn("favorites-link", compact ? "compact-favorites" : [buttonVariants({ variant: "ghost", size: "icon" }), "desktop-action"])}>
    <Heart aria-hidden="true" />{compact ? copy.navigation.favorites : null}
    <Badge className="favorites-count" aria-hidden="true">{pending ? "…" : snapshot.count}</Badge>
  </Link>;
}
