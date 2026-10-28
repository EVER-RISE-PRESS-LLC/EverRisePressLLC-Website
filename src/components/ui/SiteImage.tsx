import type { ImgHTMLAttributes } from "react";
import { imageVariants } from "@/lib/image-variants";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; priority?: boolean; fill?: boolean };

/** Responsive files prepared at build time; custom admin image URLs stay supported. */
export default function SiteImage({ src, alt, priority, fill, sizes, loading, style, ...props }: Props) {
  const prepared = imageVariants[src];
  const responsiveSizes = prepared ? sizes || (typeof props.width === "number" && props.width <= 96 ? `${props.width}px` : "(max-width: 767px) calc(100vw - 48px), 480px") : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  const image = <img {...props} src={prepared?.src || src} srcSet={prepared?.srcSet} sizes={responsiveSizes} alt={alt} loading={priority ? "eager" : loading || "lazy"} fetchPriority={priority ? "high" : props.fetchPriority} decoding="async" style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style } : style} />;
  return prepared?.avifSrcSet ? <picture className="contents"><source type="image/avif" srcSet={prepared.avifSrcSet} sizes={responsiveSizes} />{image}</picture> : image;
}
