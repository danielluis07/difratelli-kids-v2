"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import copy from "@/docs/content/copy-proposal.json";
import { cn } from "@/lib/utils";

export function AssetImage({ className, width, height, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  return failedSource === props.src
    ? <span className={cn("image-fallback", className)} role="img" aria-hidden={props["aria-hidden"]} aria-label={props.alt ? `${props.alt}. ${copy.common.imageFallback}` : copy.common.imageFallback}>{copy.common.imageFallback}</span>
    : <Image {...props} alt={props.alt} width={props.fill ? undefined : width} height={props.fill ? undefined : height} className={className} onError={() => setFailedSource(props.src)} />;
}
