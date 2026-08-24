"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

interface ScrubStatementProps {
  text: string;
  /** Word index at which the gold accent styling begins. */
  accentFrom: number;
  className?: string;
}

interface ScrubWordProps {
  progress: MotionValue<number>;
  range: [number, number];
  word: string;
  accent: boolean;
}

function ScrubWord({ progress, range, word, accent }: ScrubWordProps) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={`inline-block ${accent ? "text-gold" : ""}`}
    >
      {word}
      {"\u00A0"}
    </motion.span>
  );
}

export default function ScrubStatement({
  text,
  accentFrom,
  className,
}: ScrubStatementProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const accent = i >= accentFrom;
        if (prefersReducedMotion) {
          return (
            <span key={i} className={accent ? "text-gold" : undefined}>
              {word}{" "}
            </span>
          );
        }
        return (
          <ScrubWord
            key={i}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
            word={word}
            accent={accent}
          />
        );
      })}
    </p>
  );
}
