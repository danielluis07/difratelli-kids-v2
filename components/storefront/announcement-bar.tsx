"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import copy from "@/docs/content/homepage-copy-proposal.json";

function subscribeMotion(callback: () => void) {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function AnnouncementBar() {
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const move = (direction: number) => setIndex(current => (current + direction + copy.announcement.length) % copy.announcement.length);
  useEffect(() => {
    if (reduced || paused || focused) return;
    const timer = setInterval(() => { if (!document.hidden) setIndex(current => (current + 1) % copy.announcement.length); }, 6000);
    return () => clearInterval(timer);
  }, [reduced, paused, focused]);
  const message = copy.announcement[index];
  return <aside className="announcement-bar" aria-label="Novidades da Difratelli" onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <button aria-label={copy.announcementControls.previous} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" /></button>
    <p aria-live={paused || reduced || focused ? "polite" : "off"}>{message.text} <Link href={message.details.href}>{message.details.label}</Link></p>
    <button aria-label={copy.announcementControls.next} onClick={() => move(1)}><ChevronRight aria-hidden="true" /></button>
    <button aria-label={paused || reduced ? copy.announcementControls.resume : copy.announcementControls.pause} aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(current => !current)}>{paused || reduced ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
  </aside>;
}
