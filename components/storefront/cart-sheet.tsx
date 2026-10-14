"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { copy, formatMoney, photographs } from "@/lib/catalog";
import type { ResolvedLine } from "@/lib/shopping/contracts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { AssetImage } from "./asset-image";
import { useCart } from "./cart-provider";

export function CartSheet() {
  const { cart, snapshot } = useCart();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; sequence: number } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pending = snapshot.restoration === "pending";
  const count = snapshot.units === 0 ? copy.cart.unitCount.zero : snapshot.units === 1 ? copy.cart.unitCount.one : copy.cart.unitCount.many.replace("{count}", String(snapshot.units));
  function announce(text: string) { setMessage(previous => ({ text, sequence: (previous?.sequence ?? 0) + 1 })); }
  function change(line: ResolvedLine, delta: number) {
    const quantity = line.quantity + delta;
    if (quantity < 1 || quantity > 10) {
      announce(quantity < 1 ? copy.cart.minimumQuantity : copy.cart.maximumQuantity);
      return;
    }
    const outcome = cart.setQuantity(line, quantity);
    announce(outcome.status === "success" ? copy.cart.quantityUpdated.replace("{product}", line.product.name).replace("{quantity}", String(quantity)) : copy.cart.invalidLine);
  }
  return <Sheet open={open} onOpenChange={(next) => { setOpen(next); setMessage(null); }}>
    <SheetTrigger className="cart-trigger" render={<Button variant="ghost" size="icon" />} aria-label={`${copy.cart.open} — ${pending ? copy.cart.pending : count}`}>
      <ShoppingBag aria-hidden="true" /><Badge className="cart-count" aria-hidden="true">{pending ? "…" : snapshot.units}</Badge>
    </SheetTrigger>
    <SheetContent className="cart-sheet" side="right" showCloseButton={false} initialFocus={closeButton}>
      <SheetHeader><SheetTitle>{copy.cart.title}</SheetTitle></SheetHeader>
      <SheetClose ref={closeButton} className="sheet-close" render={<Button variant="ghost" size="icon" />} aria-label={copy.cart.close}><X /></SheetClose>
      <div className="cart-body" aria-busy={pending}>
        {pending ? <p role="status">{copy.cart.pending}</p> : snapshot.lines.length === 0 ? <Empty>
          <EmptyHeader><EmptyTitle>{copy.cart.emptyHeading}</EmptyTitle><EmptyDescription>{copy.cart.emptyBody}</EmptyDescription></EmptyHeader>
          <EmptyContent><Button nativeButton={false} role="link" render={<Link href="/produtos" />} onClick={() => setOpen(false)}>{copy.cart.emptyAction}</Button></EmptyContent>
        </Empty> : <ul className="cart-lines">{snapshot.lines.map((line) => {
          const photo = photographs(line.productId, line.colorwayId)[0];
          const options = copy.cart.lineOptions.replace("{color}", line.colorway.name).replace("{size}", String(line.size));
          return <li className="cart-line" key={`${line.productId}:${line.colorwayId}:${line.size}`}>
            <Link className="cart-photo" href={`/produto/${line.product.slug}?cor=${encodeURIComponent(line.colorwayId)}`} onClick={() => setOpen(false)} aria-label={`${line.product.name} — ${options}`}>
              <AssetImage src={photo.webPath.replace(/^public/, "")} alt={photo.alt} width={photo.webWidth} height={photo.webHeight} sizes="96px" />
            </Link>
            <div className="cart-line-details">
              <h3>{line.product.name}</h3><p>{options}</p>
              <p>{copy.cart.unitPrice}: {formatMoney(line.product.priceCents)}</p>
              <div className="cart-quantity" role="group" aria-label={`${copy.cart.quantityFor.replace("{product}", line.product.name)} — ${options}`}>
                <Button variant="outline" size="icon" aria-label={copy.cart.decrease.replace("{product}", line.product.name)} onClick={() => change(line, -1)}><Minus /></Button>
                <span aria-label={copy.cart.quantity}>{line.quantity}</span>
                <Button variant="outline" size="icon" aria-label={copy.cart.increase.replace("{product}", line.product.name)} onClick={() => change(line, 1)}><Plus /></Button>
              </div>
              <p>{copy.cart.lineTotal}: <strong>{formatMoney(line.totalCents)}</strong></p>
              <Button variant="link" aria-label={copy.cart.remove.replace("{product}", line.product.name)} onClick={() => {
                if (cart.remove(line).status === "success") {
                  closeButton.current?.focus();
                  announce(copy.cart.removed.replace("{product}", line.product.name));
                }
              }}>{copy.cart.remove.replace("{product}", line.product.name)}</Button>
            </div>
          </li>;
        })}</ul>}
      </div>
      <p className="cart-feedback" role="status" aria-atomic="true"><span key={message?.sequence}>{message?.text ?? ""}</span></p>
      {!pending && snapshot.lines.length > 0 ? <SheetFooter className="cart-footer">
        <p className="cart-subtotal"><span>{copy.cart.subtotal}</span><strong>{formatMoney(snapshot.subtotalCents)}</strong></p>
        <p>{copy.cart.shippingLater}</p>
        <Button nativeButton={false} role="link" render={<Link href="/checkout" />} onClick={() => setOpen(false)}>{copy.cart.checkout}</Button>
      </SheetFooter> : null}
    </SheetContent>
  </Sheet>;
}
