"use client";

import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ShopTheLook({ looks }: { looks: { id: string; label: string; content: ReactNode }[] }) {
  return <Tabs defaultValue={looks[0].id}>
    <TabsList activateOnFocus variant="line" className="look-tabs" aria-label="Combinações por coleção">{looks.map(look => <TabsTrigger key={look.id} value={look.id}>{look.label}</TabsTrigger>)}</TabsList>
    {looks.map(look => <TabsContent key={look.id} value={look.id}>{look.content}</TabsContent>)}
  </Tabs>;
}
