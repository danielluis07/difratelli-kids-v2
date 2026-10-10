"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import copy from "@/docs/content/copy-proposal.json";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export type NavigationGroup = { label: string; href: string; links: { label: string; href: string }[] };

export function StorefrontHeader({ groups, wordmark }: { groups: NavigationGroup[]; wordmark: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  return <header className="store-header">
    <a href="#main-content" className="skip-link">{copy.navigation.skipLink}</a>
    <div className="header-inner content-container">
      <div className="compact-menu">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} aria-label={copy.navigation.openMenu}><Menu /></SheetTrigger>
          <SheetContent className="navigation-sheet" side="left" showCloseButton={false}>
            <SheetHeader><SheetTitle>{copy.navigation.mobileMenuTitle}</SheetTitle></SheetHeader>
            <SheetClose className="sheet-close" render={<Button variant="ghost" size="icon" />} aria-label={copy.navigation.closeMenu}><X /></SheetClose>
            <nav className="compact-links" aria-label={copy.navigation.mobileMenuTitle}>
              <Link href="/produtos" onClick={() => setMenuOpen(false)}>{copy.navigation.catalog}</Link>
              {groups.map((group) => <CompactGroup key={group.href} group={group} close={() => setMenuOpen(false)} />)}
              <Link href="/colecoes" onClick={() => setMenuOpen(false)}>{copy.navigation.collections}</Link>
              <Link href="/sobre" onClick={() => setMenuOpen(false)}>{copy.navigation.brand}</Link>
              <Link href="/busca" onClick={() => setMenuOpen(false)}><Search aria-hidden="true" />{copy.navigation.search}</Link>
              <Link href="/favoritos" onClick={() => setMenuOpen(false)}><Heart aria-hidden="true" />{copy.navigation.favorites}</Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <Link href="/" className="wordmark" aria-label={`${copy.editorial.metadata.siteName} — ${copy.navigation.home}`}><Image src={wordmark} alt={copy.editorial.metadata.siteName} width={190} height={70} loading="eager" /></Link>
      <nav className="desktop-navigation" aria-label={copy.navigation.mobileMenuTitle}>
        {groups.map((group) => <DropdownMenu key={group.href}>
          <DropdownMenuTrigger className="navigation-trigger" render={<Button variant="ghost" />}>
            {group.label}<ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="category-menu">
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={group.href} />}>{copy.common.viewAll}</DropdownMenuItem>
              {group.links.map((link) => <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>{link.label}</DropdownMenuItem>)}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>)}
        <Link href="/colecoes">{copy.navigation.collections}</Link>
        <Link href="/sobre">{copy.navigation.brand}</Link>
      </nav>
      <div className="header-actions">
        <Button className="desktop-action" variant="ghost" size="icon" render={<Link href="/busca" />} nativeButton={false} role="link" aria-label={copy.navigation.search}><Search /></Button>
        <Button className="desktop-action" variant="ghost" size="icon" render={<Link href="/favoritos" />} nativeButton={false} role="link" aria-label={copy.navigation.favorites}><Heart /></Button>
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} aria-label={copy.cart.open}><ShoppingBag /></SheetTrigger>
          <SheetContent className="cart-sheet" side="right" showCloseButton={false}>
            <SheetHeader><SheetTitle>{copy.cart.title}</SheetTitle></SheetHeader>
            <SheetClose className="sheet-close" render={<Button variant="ghost" size="icon" />} aria-label={copy.cart.close}><X /></SheetClose>
            <div className="sheet-body"><Button nativeButton={false} role="link" render={<Link href="/produtos" />} onClick={() => setCartOpen(false)}>{copy.common.continueShopping}</Button></div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}

function CompactGroup({ group, close }: { group: NavigationGroup; close: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return <Collapsible open={expanded} onOpenChange={setExpanded}>
    <div className="compact-group-heading">
      <Link href={group.href} onClick={close}>{group.label}</Link>
      <CollapsibleTrigger render={<Button variant="ghost" size="icon" />} aria-label={(expanded ? copy.navigation.collapseGroup : copy.navigation.expandGroup).replace("{group}", group.label)}><ChevronDown /></CollapsibleTrigger>
    </div>
    <CollapsibleContent className="compact-categories">{group.links.map((link) => <Link key={link.href} href={link.href} onClick={close}>{link.label}</Link>)}</CollapsibleContent>
  </Collapsible>;
}
