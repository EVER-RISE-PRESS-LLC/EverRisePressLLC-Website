import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  children: ReactNode;
  surface?: "dark" | "light";
  glow?: boolean;
  interactive?: boolean;
  radius?: "xl" | "2xl" | "3xl";
}

/** A quiet reading surface. Only actual controls receive interaction feedback. */
export default function GlassCard({ children, surface = "dark", glow, interactive, radius, className, ...rest }: GlassCardProps) {
  void glow;
  void interactive;
  void radius;
  return <div {...rest} className={cn("press-panel", surface === "dark" ? "press-panel-dark" : "press-panel-light", className)}>{children}</div>;
}
