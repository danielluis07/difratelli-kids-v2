"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import copy from "@/docs/content/copy-proposal.json";
import { ProductSizeContext } from "./product-selection";
import { useCart } from "./cart-provider";

export function ProductAdd({ productId, colorwayId, name, color, disabled = false }: {
  productId: string; colorwayId: string; name: string; color: string; disabled?: boolean;
}) {
  const selection = useContext(ProductSizeContext);
  const { cart, snapshot } = useCart();
  const [message, setMessage] = useState<{ text: string; sequence: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  function add() {
    if (!selection?.size) {
      setMessage(previous => ({ text: copy.product.missingSize, sequence: (previous?.sequence ?? 0) + 1 }));
      button.current?.closest(".product-information")?.querySelector<HTMLButtonElement>(".size-options button")?.focus();
      return;
    }
    const outcome = cart.add({ productId, colorwayId, size: Number(selection.size) });
    const text = outcome.status === "rejected" ? copy.product.invalidSelection
      : outcome.effect === "quantity-limited" ? copy.product.quantityLimited
      : outcome.effect === "merged" ? copy.product.merged.replace("{product}", name)
      : copy.product.added.replace("{product}", name).replace("{color}", color).replace("{size}", selection.size);
    setMessage(previous => ({ text, sequence: (previous?.sequence ?? 0) + 1 }));
  }
  return <div className="product-purchase">
    <Button ref={button} disabled={disabled || snapshot.restoration === "pending"} onClick={add}>{copy.product.addToCart}</Button>
    <p role="status" aria-atomic="true" className="purchase-feedback"><span key={message?.sequence}>{message?.text ?? ""}</span></p>
  </div>;
}
