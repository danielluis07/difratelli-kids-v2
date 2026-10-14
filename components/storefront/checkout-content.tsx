"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { copy } from "@/lib/catalog";
import { checkoutTotals, validateDelivery } from "@/lib/checkout";
import type { Delivery, DeliveryErrors, Payment } from "@/lib/shopping/contracts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCart } from "./cart-provider";
import { useCheckout } from "./checkout-provider";
import { CheckoutSummary } from "./checkout-summary";

const fields = Object.keys(copy.checkout.fields) as (keyof Delivery)[];
const autocomplete: Record<keyof Delivery, string> = {
  name: "name", email: "email", postalCode: "postal-code", street: "address-line1", number: "off",
  complement: "address-line2", neighborhood: "address-level3", city: "address-level2", state: "address-level1",
};
function errorText(field: keyof Delivery, error: DeliveryErrors[keyof Delivery]) {
  if (field === "email") return error === "required" ? copy.checkout.validation.emailRequired : copy.checkout.validation.emailInvalid;
  if (field === "postalCode") return error === "required" ? copy.checkout.validation.postalCodeRequired : copy.checkout.validation.postalCodeInvalid;
  return field === "complement" ? "" : copy.checkout.validation[field];
}

export function CheckoutContent() {
  const { checkout, snapshot } = useCheckout();
  const { snapshot: cart } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  // Cache Components hides visited pages with Activity. Its effect cleanup runs
  // on exit as well as unmount, invalidating confirmation and form-local state.
  useLayoutEffect(() => () => { checkout.discardConfirmation(); }, [checkout]);
  useEffect(() => { if (snapshot.confirmation) heading.current?.focus(); }, [snapshot.confirmation]);
  const confirmation = snapshot.confirmation;
  const pending = cart.restoration === "pending";
  return <>
    <div className="page-intro"><h1 ref={heading} tabIndex={-1}>{confirmation ? copy.checkout.completion.heading : copy.editorial.pages.checkout.heading}</h1></div>
    {confirmation ? <div className="checkout-completion">
      <p role="status" className="checkout-disclosure">{copy.checkout.completion.disclosure}</p>
      {cart.warning === "writeFailure" ? <p role="status">{copy.checkout.completion.failedCartSave}</p> : null}
      <div className="checkout-columns">
        <section className="checkout-delivery-summary" aria-labelledby="delivery-summary-heading">
          <h2 id="delivery-summary-heading">{copy.checkout.completion.deliveryHeading}</h2>
          <p>{confirmation.draft.delivery.name}<br />{confirmation.draft.delivery.email}</p>
          <p>{confirmation.draft.delivery.street}, {confirmation.draft.delivery.number}<br />{confirmation.draft.delivery.complement}<br />{confirmation.draft.delivery.neighborhood}<br />{confirmation.draft.delivery.city} · {confirmation.draft.delivery.state}<br />{copy.checkout.fields.postalCode}: {confirmation.draft.delivery.postalCode}</p>
          <h2>{copy.checkout.completion.paymentHeading}</h2>
          <p>{copy.checkout.paymentOptions.find(option => option.id === confirmation.draft.payment)?.label}</p>
        </section>
        <CheckoutSummary lines={confirmation.lines} totals={confirmation.totals} completed />
      </div>
      <Link className={buttonVariants()} href={copy.checkout.completion.continueAction.href}>{copy.checkout.completion.continueAction.label}</Link>
    </div> : pending ? <p role="status" aria-busy="true">{copy.checkout.pending}</p> : cart.lines.length === 0 ? <Empty>
      <EmptyHeader><EmptyTitle>{copy.checkout.emptyHeading}</EmptyTitle><EmptyDescription>{copy.checkout.emptyBody}</EmptyDescription></EmptyHeader>
      <EmptyContent><Link className={buttonVariants()} href="/produtos">{copy.checkout.emptyAction}</Link></EmptyContent>
    </Empty> : <CheckoutForm key={snapshot.visit} />}
  </>;
}

function CheckoutForm() {
  const { checkout, snapshot: { draft } } = useCheckout();
  const { snapshot: cart } = useCart();
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState("");
  const edited = useRef(new Set<keyof Delivery>());
  function update(field: keyof Delivery, value: string) {
    const current = checkout.getDraft();
    if (checkout.updateDraft({ ...current, delivery: { ...current.delivery, [field]: value } }).status === "success") {
      edited.current.add(field);
      setFailure("");
    }
  }
  function blur(field: keyof Delivery) {
    if (!edited.current.has(field)) return;
    edited.current.delete(field);
    const error = validateDelivery(checkout.getDraft().delivery)[field];
    setErrors(previous => ({ ...previous, [field]: error }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateDelivery(checkout.getDraft().delivery);
    setErrors(invalid);
    const first = fields.find(field => invalid[field]);
    if (first) {
      event.currentTarget.querySelector<HTMLInputElement | HTMLButtonElement>(`#delivery-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    setFailure("");
    const outcome = await checkout.complete();
    if (outcome.status === "rejected") {
      setFailure(outcome.reason === "busy" ? copy.checkout.duplicateSubmission : copy.checkout.preCommitFailure);
    }
    setSubmitting(false);
  }
  return <form noValidate onSubmit={submit} className="checkout-columns" aria-busy={submitting}>
    <div className="checkout-form-sections">
      <FieldSet disabled={submitting}>
        <FieldLegend>{copy.checkout.deliveryHeading}</FieldLegend>
        <FieldDescription>{copy.checkout.deliveryIntro}</FieldDescription>
        <FieldGroup className="checkout-fields">{fields.map(field => {
          const id = `delivery-${field}`;
          const hint = field === "postalCode" || field === "number" ? copy.checkout.fieldHints[field] : "";
          const description = [hint ? `${id}-hint` : "", errors[field] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
          return <Field key={field} data-invalid={Boolean(errors[field])} data-disabled={submitting}>
            <FieldLabel htmlFor={id}>{copy.checkout.fields[field]}</FieldLabel>
            {field === "state" ? <Select value={draft.delivery.state} onValueChange={value => update(field, value ?? "")} items={copy.checkout.states.map(state => ({ value: state.id, label: state.name }))} disabled={submitting}>
              <SelectTrigger id={id} aria-invalid={Boolean(errors[field])} aria-describedby={description} onBlur={() => blur(field)}>
                <SelectValue placeholder={copy.checkout.statePlaceholder} />
              </SelectTrigger>
              <SelectContent><SelectGroup>{copy.checkout.states.map(state => <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>)}</SelectGroup></SelectContent>
            </Select> : <Input id={id} name={field} type={field === "email" ? "email" : "text"} inputMode={field === "postalCode" ? "numeric" : undefined} autoComplete={autocomplete[field]} value={draft.delivery[field]} onChange={event => update(field, event.target.value)} onBlur={() => blur(field)} aria-invalid={Boolean(errors[field])} aria-describedby={description} required={field !== "complement"} disabled={submitting} />}
            {hint ? <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription> : null}
            <div className="checkout-field-feedback">{errors[field] ? <FieldError id={`${id}-error`}>{errorText(field, errors[field])}</FieldError> : null}</div>
          </Field>;
        })}</FieldGroup>
      </FieldSet>
      <FieldSet disabled={submitting}><FieldLegend>{copy.checkout.paymentHeading}</FieldLegend>
        <ToggleGroup aria-label={copy.checkout.paymentHeading} variant="outline" value={[draft.payment]} onValueChange={values => {
          const payment = values[0] as Payment | undefined;
          if (payment) checkout.updateDraft({ ...checkout.getDraft(), payment });
        }} disabled={submitting}>
          {copy.checkout.paymentOptions.map(option => <ToggleGroupItem key={option.id} value={option.id}>{option.label}</ToggleGroupItem>)}
        </ToggleGroup>
      </FieldSet>
    </div>
    <div className="checkout-review">
      <CheckoutSummary lines={cart.lines} totals={checkoutTotals(cart.subtotalCents)} />
      <div className="checkout-validation-feedback">{Object.values(errors).some(Boolean) ? <p role="alert">{copy.checkout.validation.summary}</p> : null}</div>
      {failure ? <p role="alert">{failure}</p> : null}
      <Button type="submit" disabled={submitting}>{submitting ? copy.checkout.submitting : copy.checkout.submit}</Button>
    </div>
  </form>;
}
