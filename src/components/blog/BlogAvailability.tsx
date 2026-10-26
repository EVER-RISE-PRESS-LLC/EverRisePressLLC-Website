"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";

const BlogAvailable = createContext(false);
export function BlogAvailabilityProvider({ available, children }: { available: boolean; children: ReactNode }) {
  return <BlogAvailable.Provider value={available}>{children}</BlogAvailable.Provider>;
}
export function useBlogAvailable() { return useContext(BlogAvailable); }
export function BlogFooterLink() {
  return useBlogAvailable() ? <Link href="/blog" className="inline-flex min-h-11 items-center text-sm text-cream/70 transition-colors hover:text-gold">Blog</Link> : null;
}
