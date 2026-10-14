import { copy, formatMoney, photographs } from "@/lib/catalog";
import type { CheckoutTotals, ResolvedLine } from "@/lib/shopping/contracts";
import { Separator } from "@/components/ui/separator";
import { AssetImage } from "./asset-image";

export function CheckoutSummary({ lines, totals, completed = false }: {
  lines: readonly ResolvedLine[]; totals: CheckoutTotals; completed?: boolean;
}) {
  return <section className="checkout-summary" aria-labelledby="checkout-summary-heading">
    <h2 id="checkout-summary-heading">{completed ? copy.checkout.completion.itemsHeading : copy.checkout.summaryHeading}</h2>
    <ul className="cart-lines">{lines.map(line => {
      const photo = photographs(line.productId, line.colorwayId)[0];
      return <li className="cart-line" key={`${line.productId}:${line.colorwayId}:${line.size}`}>
        <div className="cart-photo"><AssetImage src={photo.webPath.replace(/^public/, "")} alt={photo.alt} width={photo.webWidth} height={photo.webHeight} sizes="96px" /></div>
        <div className="cart-line-details"><h3>{line.product.name}</h3>
          <p>{copy.cart.lineOptions.replace("{color}", line.colorway.name).replace("{size}", String(line.size))}</p>
          <p>{copy.cart.quantity}: {line.quantity}</p>
          <p>{copy.cart.unitPrice}: {formatMoney(line.product.priceCents)}</p>
          <strong>{formatMoney(line.totalCents)}</strong>
        </div>
      </li>;
    })}</ul>
    <Separator />
    <dl className="checkout-totals">
      <div><dt>{completed ? copy.checkout.completion.subtotal : copy.checkout.items}</dt><dd>{formatMoney(totals.subtotalCents)}</dd></div>
      <div><dt>{copy.checkout.shippingLabel}</dt><dd>{formatMoney(totals.shippingCents)}</dd></div>
      <div className="checkout-total"><dt>{copy.checkout.total}</dt><dd>{formatMoney(totals.totalCents)}</dd></div>
    </dl>
    <p>{copy.checkout.shipping.summary}</p>
  </section>;
}
