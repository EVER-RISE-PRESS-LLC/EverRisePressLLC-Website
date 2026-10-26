"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Menu, X, ArrowRight } from "lucide-react";
import { useBlogAvailable } from "@/components/blog/BlogAvailability";
import ReactiveButton from "@/components/ui/ReactiveButton";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "The Book", href: "/books/how-to-have-a-financial-heart-attack" },
  { label: "Author", href: "/authors/lamont-mcleod" },
];
const DEFAULT_CTA = { label: "Read Chapter 1 Free", href: "/books/how-to-have-a-financial-heart-attack/preview" };
interface NavbarProps { cta?: { label: string; href: string }; refreshKey?: string | number; }
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ cta }: NavbarProps) {
  const blogAvailable = useBlogAvailable();
  const navLinks = blogAvailable ? [...NAV_LINKS, { label: "Blog", href: "/blog" }] : NAV_LINKS;
  const activeCta = cta ?? DEFAULT_CTA;
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <a className="press-skip-link" href="#page-content">Skip to content</a>
      <header className="press-header" data-blog-available={blogAvailable || undefined}>
        <nav className="press-nav" aria-label="Main navigation">
          <Link href="/" className="press-brand" aria-label="EverRise Press home">
            <Image src="/images/logo.png" alt="" width={32} height={32} />
            <span>EverRise Press</span>
          </Link>
          <div className="press-nav-links">
            {navLinks.map(link => <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined}>{link.label}</Link>)}
          </div>
          <div className="press-nav-cta"><ReactiveButton href={activeCta.href} size="sm">{activeCta.label}<ArrowRight size={15}/></ReactiveButton></div>
          <Dialog.Trigger asChild><button className="press-menu-trigger" aria-label="Open menu"><Menu size={22}/></button></Dialog.Trigger>
        </nav>
      </header>
      <Dialog.Portal>
        <Dialog.Overlay className="press-menu-overlay" />
        <Dialog.Content className="press-menu">
          <div className="press-menu-heading">
            <Dialog.Title>EverRise Press</Dialog.Title>
            <Dialog.Close asChild><button className="press-icon-button" aria-label="Close menu"><X size={22}/></button></Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Explore the book, meet the author, or start the free first chapter.</Dialog.Description>
          <nav aria-label="Mobile navigation">
            {navLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, link.href) ? "page" : undefined}>{link.label}<ArrowRight size={20}/></Link>)}
          </nav>
          <ReactiveButton href={activeCta.href} className="w-full" onClick={() => setMenuOpen(false)}>{activeCta.label}<ArrowRight size={18}/></ReactiveButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
