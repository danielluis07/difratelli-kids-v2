"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState, type ComponentProps } from "react";
import copy from "@/docs/content/copy-proposal.json";
import { cn } from "@/lib/utils";

export function AssetImage({ className, width, height, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  return failedSource === props.src
    ? <span className={cn("image-fallback", className)} role="img" aria-hidden={props["aria-hidden"]} aria-label={props.alt ? `${props.alt}. ${copy.common.imageFallback}` : copy.common.imageFallback}>{copy.common.imageFallback}</span>
    : <Image {...props} alt={props.alt} width={props.fill ? undefined : width} height={props.fill ? undefined : height} className={className} onError={() => setFailedSource(props.src)} />;
}

// getImageProps runs on the server; only error handling crosses this boundary.
export function AssetPicture({ sources, image }: {
  sources: { media: string; srcSet: string; width: number; height: number }[];
  image: ComponentProps<"img"> & { alt: string; src: string };
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const inspectImage = useCallback((node: HTMLImageElement | null) => {
    // A prerendered image may fail before React attaches its error listener.
    if (node?.complete && node.currentSrc && node.naturalWidth === 0) setFailedSource(image.src);
  }, [image.src]);
  if (failedSource === image.src) return <span className="image-fallback" role="img" aria-label={`${image.alt}. ${copy.common.imageFallback}`}>{copy.common.imageFallback}</span>;
  return <picture>{sources.map(source => <source key={source.media} {...source} />)}{/* Sources and fallback are optimized together by getImageProps. */}
    <img {...image} ref={inspectImage} alt={image.alt} onError={() => setFailedSource(image.src)} />
  </picture>;
}
