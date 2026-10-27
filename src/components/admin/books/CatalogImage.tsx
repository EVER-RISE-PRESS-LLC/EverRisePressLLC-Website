"use client";

import { useState } from "react";
import { BookImage, UserRound } from "lucide-react";

export function CatalogImage({
  src,
  name,
  kind = "book",
  className = "",
}: {
  src: string | null;
  name: string;
  kind?: "book" | "author";
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const missing = !src || failedSrc === src;
  const Icon = kind === "author" ? UserRound : BookImage;
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground ${kind === "author" ? "rounded-full" : "rounded-md"} ${className}`}
    >
      {missing ? (
        <Icon
          className="size-5"
          aria-label={`${name}: ${src ? "image unavailable" : "no image"}`}
        />
      ) : (
        // Native images allow the existing local paths and uploaded media without a paid image service.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
