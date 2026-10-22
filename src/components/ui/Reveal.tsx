import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** Layout wrapper: reading content stays visible and steady while scrolling. */
export default function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}
