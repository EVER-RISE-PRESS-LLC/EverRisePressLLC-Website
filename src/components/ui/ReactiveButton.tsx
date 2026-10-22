"use client";

import type { ReactNode, ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonSurface = "dark" | "light";
interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  /** Retained for existing callers; controls now stay under the pointer. */
  magnetic?: boolean;
  pointerEffects?: boolean;
  className?: string;
  children: ReactNode;
}
type LinkProps = BaseProps & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children" | "href">;
type ButtonProps = BaseProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;
export type ReactiveButtonProps = LinkProps | ButtonProps;

export default function ReactiveButton({
  variant = "solid", size = "md", surface = "dark", magnetic, pointerEffects,
  className, children, ...props
}: ReactiveButtonProps) {
  void magnetic;
  void pointerEffects;
  const shared = {
    className: cn("press-button", className),
    "data-variant": variant,
    "data-size": size,
    "data-surface": surface,
  };
  if (props.href !== undefined) {
    const { href, external, ...rest } = props;
    return external
      ? <a {...rest} {...shared} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <Link {...rest} {...shared} href={href}>{children}</Link>;
  }
  return <button type="button" {...props} {...shared}>{children}</button>;
}
