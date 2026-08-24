"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface CoverParallaxProps {
  src: string;
  alt: string;
  className?: string;
  /** Scales image from this value up to 1 as it enters the viewport. */
  fromScale?: number;
  /** Fades image to this opacity as it leaves the viewport. */
  exitOpacity?: number;
}

export default function CoverParallax({
  src,
  alt,
  className,
  fromScale = 0.82,
  exitOpacity = 0.2,
}: CoverParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    prefersReducedMotion ? [1, 1, 1] : [fromScale, 1, 1.06]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.85, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.35, 1, 1, exitOpacity]
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale, opacity }} className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 80vw, 24rem"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
