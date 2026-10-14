"use client";

import { useContext } from "react";
import copy from "@/docs/content/copy-proposal.json";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ProductSizeContext } from "./product-selection";

export function ProductSize({ sizes, disabled = false }: { sizes: readonly number[]; disabled?: boolean }) {
  const selection = useContext(ProductSizeContext);
  const guidance = copy.sizeGuidance;
  return <section className="product-size" aria-label={copy.product.size}>
    <div className="size-heading">
      <h2>{copy.product.size}</h2>
      <Dialog>
        <DialogTrigger disabled={disabled} render={<Button variant="link" />}>{copy.product.sizeGuide}</DialogTrigger>
        <DialogContent className="size-guide-dialog" showCloseButton={false}>
          <DialogHeader><DialogTitle>{guidance.title}</DialogTitle><DialogDescription>{guidance.intro}</DialogDescription></DialogHeader>
          <DialogClose render={<Button variant="outline" />}>{guidance.close}</DialogClose>
          <div className="size-table-scroll" tabIndex={0} role="region" aria-label={guidance.title}>
            <table className="size-table">
              <caption className="sr-only">{guidance.intro}</caption>
              <thead><tr>{Object.values(guidance.columns).map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{guidance.rows.map((row) => <tr key={row.size}><th scope="row">{row.size}</th>{[row.heightCm, row.chestCm, row.waistCm, row.hipsCm].map((range, index) => <td key={index}>{range.join("–")}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <h3>{guidance.instructionsHeading}</h3>
          <dl className="measuring-instructions">{guidance.instructions.map((instruction) => <div key={instruction.label}><dt>{instruction.label}</dt><dd>{instruction.body}</dd></div>)}</dl>
          <p>{guidance.betweenSizes}</p><p>{guidance.outsideChart}</p>
        </DialogContent>
      </Dialog>
    </div>
    <ToggleGroup variant="outline" className="size-options" aria-label={copy.product.size} value={selection?.size ? [selection.size] : []} onValueChange={(values) => { if (values[0] !== undefined) selection?.selectSize(String(values[0])); }}>
      {sizes.map((size) => <ToggleGroupItem key={size} value={String(size)} disabled={disabled} aria-label={copy.product.sizeOption.replace("{size}", String(size))}>{size}</ToggleGroupItem>)}
    </ToggleGroup>
    <p className="size-feedback" aria-live="polite" aria-atomic="true">{selection?.size ? copy.product.sizeChanged.replace("{size}", selection.size) : copy.product.missingSize}</p>
  </section>;
}
