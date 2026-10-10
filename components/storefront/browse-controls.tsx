"use client";

import { useOptimistic, useSyncExternalStore, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { resetBrowseFilters, serializeBrowseUrl, type BrowseScope, type BrowseState, type Sort } from "@/lib/browsing";
import { copy } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterKey = "categories" | "sizes" | "families" | "collections" | "audiences";
export type FilterGroup = { key: FilterKey; label: string; options: { value: string | number; label: string }[] };
const sortOptions = [
  { value: "curated", label: copy.browsing.sortOptions.curated },
  { value: "preco-asc", label: copy.browsing.sortOptions.priceAscending },
  { value: "preco-desc", label: copy.browsing.sortOptions.priceDescending },
];
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function BrowseControls({ scope, state, groups }: { scope: BrowseScope; state: BrowseState; groups: FilterGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [current, setCurrent] = useOptimistic(state);
  const [pending, startTransition] = useTransition();
  function commit(next: BrowseState) {
    const query = serializeBrowseUrl(scope, next);
    startTransition(() => {
      setCurrent(next);
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    });
  }
  const reset = () => commit(resetBrowseFilters(scope, current));
  function options(group: FilterGroup) {
    return <fieldset className="filter-group">
      <legend>{group.label}</legend>
      {group.options.map(({ value, label }) => <label className="filter-option" key={value}>
        <Checkbox disabled={!ready} checked={(current[group.key] as readonly (string | number)[]).includes(value)} onCheckedChange={(checked) => {
          const selected = current[group.key] as readonly (string | number)[];
          commit({ ...current, [group.key]: checked ? [...selected, value] : selected.filter((entry) => entry !== value) });
        }} />
        <span>{label}</span>
      </label>)}
    </fieldset>;
  }
  return <div className="browse-toolbar" aria-busy={pending}>
    <div className="desktop-filters">
      {groups.map((group) => <Popover key={group.key}>
        <PopoverTrigger disabled={!ready} render={<Button variant="outline" />}>{group.label}{current[group.key].length ? ` (${current[group.key].length})` : ""}</PopoverTrigger>
        <PopoverContent align="start" className="filter-popover">
          <PopoverTitle className="sr-only">{group.label}</PopoverTitle>
          {options(group)}
        </PopoverContent>
      </Popover>)}
    </div>
    <div className="mobile-filters">
      <Sheet>
        <SheetTrigger disabled={!ready} render={<Button variant="outline" />} aria-label={copy.browsing.openFilters}>{copy.browsing.filters}</SheetTrigger>
        <SheetContent className="filter-sheet" showCloseButton={false}>
          <div className="filter-sheet-heading"><SheetTitle>{copy.browsing.filters}</SheetTitle><SheetClose render={<Button variant="ghost" />}>{copy.browsing.closeFilters}</SheetClose></div>
          <div className="filter-sheet-options">{groups.map((group) => <div key={group.key}>{options(group)}</div>)}</div>
          <Button disabled={!ready} variant="outline" onClick={reset}>{copy.browsing.clearFilters}</Button>
        </SheetContent>
      </Sheet>
    </div>
    <div className="browse-sort">
      <span id="browse-sort-label">{copy.browsing.sort}</span>
      <Select disabled={!ready} items={sortOptions} value={current.sort} onValueChange={(value) => { if (value) commit({ ...current, sort: value as Sort }); }}>
        <SelectTrigger aria-labelledby="browse-sort-label"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>{sortOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
    </div>
    <Button disabled={!ready} variant="ghost" onClick={reset}>{copy.browsing.clearFilters}</Button>
  </div>;
}

export function ResetBrowseFilters({ scope, state }: { scope: BrowseScope; state: BrowseState }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  return <Button disabled={!ready} onClick={() => {
    const query = serializeBrowseUrl(scope, resetBrowseFilters(scope, state));
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }}>{copy.browsing.clearFilters}</Button>;
}
