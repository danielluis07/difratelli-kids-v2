"use client";

import { Suspense, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import copy from "@/docs/content/copy-proposal.json";
import { normalizeQuery } from "@/lib/browsing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

export function HeaderSearch({ compact = false, onSubmit }: { compact?: boolean; onSubmit?: () => void }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger className={compact ? "compact-search" : "desktop-action"} render={<Button variant="ghost" size={compact ? "default" : "icon"} />} aria-label={copy.navigation.search}>
      <Search aria-hidden="true" />{compact ? copy.navigation.search : null}
    </SheetTrigger>
    <SheetContent side="top" showCloseButton={false} initialFocus={inputRef}>
      <div className="content-container search-panel">
        <SheetHeader><SheetTitle>{copy.search.dialogTitle}</SheetTitle></SheetHeader>
        {open ? <Suspense fallback={<p>{copy.search.blankBody}</p>}>
          <SearchForm inputRef={inputRef} submit={() => { setOpen(false); onSubmit?.(); }} />
        </Suspense> : null}
        <SheetClose className="sheet-close" render={<Button variant="ghost" size="icon" />} aria-label={copy.search.close}><X /></SheetClose>
      </div>
    </SheetContent>
  </Sheet>;
}

function SearchForm({ inputRef, submit }: { inputRef: React.RefObject<HTMLInputElement | null>; submit: () => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const committedQuery = pathname === "/busca" ? normalizeQuery(params.get("q") ?? "") : "";
  return <form role="search" onSubmit={(event) => {
    event.preventDefault();
    const query = normalizeQuery(String(new FormData(event.currentTarget).get("q") ?? ""));
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    router.push(`/busca${next.size ? `?${next}` : ""}`);
    submit();
  }}>
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="catalog-search">{copy.search.fieldLabel}</FieldLabel>
        <Input className="min-h-12" key={`${pathname}:${committedQuery}`} ref={inputRef} id="catalog-search" name="q" type="search" autoComplete="off" placeholder={copy.search.placeholder} defaultValue={committedQuery} />
      </Field>
      <Field><Button type="submit"><Search data-icon="inline-start" />{copy.search.submit}</Button></Field>
    </FieldGroup>
  </form>;
}
