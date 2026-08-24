"use client";

import { useRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  children: ReactNode;
  /** Surface the card sits on: "dark" for charcoal sections, "light" for cream sections. */
  surface?: "dark" | "light";
  /** Adds an ambient gold glow behind the card. */
  glow?: boolean;
  /** Adds lift-on-hover motion for clickable cards. */
  interactive?: boolean;
  /** Rounded corner radius size. */
  radius?: "xl" | "2xl" | "3xl";
}

const RADIUS_CLASSES: Record<NonNullable<GlassCardProps["radius"]>, string> = {
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

const HOVER_BORDER: Record<"dark" | "light", string> = {
  dark: "group-hover:border-cream/30",
  light: "group-hover:border-charcoal/20",
};

export default function GlassCard({
  children,
  surface = "dark",
  glow = false,
  interactive = false,
  radius = "2xl",
  className,
  ...rest
}: GlassCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const content = (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden transition-colors duration-500",
        surface === "dark" ? "glass-dark" : "glass-light",
        interactive && HOVER_BORDER[surface],
        RADIUS_CLASSES[radius],
        className
      )}
      {...rest}
    >
      <span aria-hidden className="glass-sheen" />
      {children}
    </div>
  );

  if (interactive && !prefersReducedMotion) {
    return (
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className={cn("h-full", RADIUS_CLASSES[radius], glow && "relative")}
      >
        {glow && (
          <span
            aria-hidden
            className={cn(
              "absolute -inset-1 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              RADIUS_CLASSES[radius],
              surface === "dark" ? "bg-gold/20" : "bg-gold/25"
            )}
          />
        )}
        <div className="relative h-full">{content}</div>
      </motion.div>
    );
  }

  return (
    <div className={cn("h-full", glow && "relative")}>
      {glow && (
        <span
          aria-hidden
          className={cn(
            "absolute -inset-1 blur-2xl",
            RADIUS_CLASSES[radius],
            surface === "dark" ? "bg-gold/15" : "bg-gold/20"
          )}
        />
      )}
      <div className="relative h-full">{content}</div>
    </div>
  );
}
