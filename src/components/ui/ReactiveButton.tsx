"use client";

import { useRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonSurface = "dark" | "light";

interface ReactiveButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  magnetic?: boolean;
  pointerEffects?: boolean;
  className?: string;
  children: ReactNode;
}

type ReactiveButtonAsLink = ReactiveButtonBaseProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children" | "href">;

type ReactiveButtonAsButton = ReactiveButtonBaseProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ReactiveButtonProps = ReactiveButtonAsLink | ReactiveButtonAsButton;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-8 py-4 text-sm",
  lg: "px-10 py-5 text-sm md:text-base",
};

const VARIANT_CLASSES: Record<ButtonVariant, Record<ButtonSurface, string>> = {
  solid: {
    dark: "bg-gold text-charcoal shadow-[0_12px_32px_-12px_rgba(212,175,55,0.55)] hover:shadow-[0_16px_44px_-12px_rgba(212,175,55,0.65)]",
    light:
      "bg-charcoal text-cream shadow-[0_12px_32px_-12px_rgba(26,26,26,0.45)] hover:shadow-[0_16px_44px_-12px_rgba(26,26,26,0.55)]",
  },
  outline: {
    dark: "border-2 border-gold text-gold hover:border-gold-hover hover:text-gold-hover",
    light:
      "border-2 border-charcoal/70 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-cream",
  },
  ghost: {
    dark: "text-cream/85 hover:text-cream hover:bg-white/10",
    light: "text-charcoal/80 hover:text-charcoal hover:bg-charcoal/8",
  },
};

const MAGNET_STRENGTH = 0.32;

export default function ReactiveButton(props: ReactiveButtonProps) {
  const {
    variant = "solid",
    size = "md",
    surface = "dark",
    magnetic = true,
    pointerEffects = true,
    className,
    children,
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !magnetic || !pointerEffects || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * MAGNET_STRENGTH);
    y.set(offsetY * MAGNET_STRENGTH);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClasses = cn(
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl",
    "font-sans font-bold uppercase tracking-wider",
    "select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    "cursor-pointer",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant][surface],
    className
  );

  const sheen = pointerEffects && !prefersReducedMotion ? (
    <motion.span
      aria-hidden
      initial={{ x: "-170%", skewX: -18 }}
      whileHover={{ x: "230%" }}
      transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/45 to-transparent"
    />
  ) : null;

  const inner = (
    <>
      {sheen}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  const motionProps = {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: { x: springX, y: springY },
    whileHover: pointerEffects && !prefersReducedMotion ? { scale: 1.035 } : undefined,
    whileTap: pointerEffects && !prefersReducedMotion ? { scale: 0.965 } : undefined,
    transition: { type: "spring" as const, stiffness: 420, damping: 22 },
  };

  if (props.href !== undefined) {
    const {
      href,
      external,
      magnetic: _magnetic,
      pointerEffects: _pointerEffects,
      surface: _surface,
      size: _size,
      variant: _variant,
      ...rest
    } = props;
    const linkProps = {
      ...rest,
      href,
      className: baseClasses,
    };
    if (external) {
      return (
        <motion.div {...motionProps} className="inline-flex">
          <a {...linkProps} target="_blank" rel="noopener noreferrer">
            {inner}
          </a>
        </motion.div>
      );
    }
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link {...linkProps}>{inner}</Link>
      </motion.div>
    );
  }

  const {
    magnetic: _magnetic,
    pointerEffects: _pointerEffects,
    surface: _surface,
    size: _size,
    variant: _variant,
    ...rest
  } = props as ReactiveButtonAsButton;
  return (
    <motion.div {...motionProps} className="inline-flex">
      <button {...rest} className={baseClasses}>
        {inner}
      </button>
    </motion.div>
  );
}
