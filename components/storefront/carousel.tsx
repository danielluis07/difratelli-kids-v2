"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Carousel({ children, label, kind = "products" }: { children: ReactNode; label: string; kind?: "products" | "categories" | "social" }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const list = track.current!;
    const update = () => {
      const bounds = list.getBoundingClientRect();
      for (const item of Array.from(list.children) as HTMLElement[]) {
        const rect = item.getBoundingClientRect();
        // Fully off-screen links/swatches cannot receive keyboard focus.
        item.inert = rect.right <= bounds.left + 1 || rect.left >= bounds.right - 1;
      }
      const start = list.scrollLeft <= 1;
      const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
      setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => { list.removeEventListener("scroll", update); observer.disconnect(); };
  }, [children]);
  const scroll = (direction: number) => {
    const list = track.current!;
    const first = list.firstElementChild as HTMLElement | null;
    const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(list).columnGap) : list.clientWidth;
    list.scrollBy({ left: direction * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className={cn("carousel", `carousel-${kind}`)} data-carousel={kind}>
    <div className="carousel-controls">
      <Button variant="outline" size="icon" aria-label={`Anterior: ${label}`} disabled={edges.start} onClick={() => scroll(-1)}><ChevronLeft aria-hidden="true" /></Button>
      <Button variant="outline" size="icon" aria-label={`Próximo: ${label}`} disabled={edges.end} onClick={() => scroll(1)}><ChevronRight aria-hidden="true" /></Button>
    </div>
    <ul ref={track} className="carousel-track" tabIndex={0} aria-label={label} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); scroll(event.key === "ArrowLeft" ? -1 : 1); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth, behavior: "instant" }); }
    }}>{children}</ul>
  </div>;
}
