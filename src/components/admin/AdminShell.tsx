"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChevronRight, ExternalLink, Menu, PenLine } from "lucide-react";
import type { AdminUser } from "@/lib/auth";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminAppearanceControls } from "./AdminAppearanceControls";
import { SidebarNav } from "./SidebarNav";
import { AdminUserMenu } from "./AdminUserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Overview", articles: "Articles", media: "Images", books: "Books", authors: "Authors", leads: "Readers", referrals: "Links & partners",
};

function Brand() {
  return <Link href="/admin/dashboard" className="admin-brand" aria-label="EverRise Press workspace home">
    <span className="admin-brand-mark"><BookMarked className="size-5" aria-hidden="true" /></span>
    <span><strong>EverRise Press</strong><small>Publisher workspace</small></span>
  </Link>;
}

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1] ?? "dashboard";
  const sectionLabel = SECTION_LABELS[section] ?? "Workspace";
  const detailLabel = segments[3] === "preview" ? "Preview draft" : segments[2] === "new" ? `New ${section === "articles" ? "article" : section === "books" ? "book" : "author"}`
    : segments[2] ? (section === "referrals" ? "Partner details" : `Edit ${section === "articles" ? "article" : section === "books" ? "book" : "author"}`) : null;

  return (
    <AdminThemeProvider>
      <a href="#admin-main" className="admin-skip-link">Skip to workspace content</a>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand"><Brand /></div>
          <div className="admin-sidebar-scroll"><SidebarNav /></div>
          <div className="admin-sidebar-bottom">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-site-link">
              <ExternalLink className="size-4" aria-hidden="true" /> View public website <span className="sr-only">(opens in a new tab)</span>
            </Link>
            <div className="admin-workspace-person">
              <span className="admin-person-avatar" aria-hidden="true">{user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "EP"}</span>
              <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="text-muted-foreground">{user.role === "ADMIN" ? "Administrator" : "Editor"}</p></div>
            </div>
          </div>
        </aside>
        <div className="admin-workspace">
          <header className="admin-topbar">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="admin-mobile-trigger" aria-label="Open workspace navigation"><Menu className="size-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="admin-mobile-sheet">
                <SheetHeader className="admin-mobile-sheet-header">
                  <SheetTitle className="text-base font-bold">EverRise Press</SheetTitle>
                  <SheetDescription>Publisher workspace navigation</SheetDescription>
                </SheetHeader>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
                <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-site-link mx-4 mt-auto mb-6"><ExternalLink className="size-4" aria-hidden="true" /> View public website<span className="sr-only"> (opens in a new tab)</span></Link>
              </SheetContent>
            </Sheet>
            <nav aria-label="Breadcrumb" className="admin-breadcrumb">
              <Link href="/admin/dashboard" className="admin-breadcrumb-root">Workspace</Link>
              <ChevronRight className="admin-breadcrumb-root size-3.5" aria-hidden="true" />
              {detailLabel ? <><Link href={`/admin/${section}`}>{sectionLabel}</Link><ChevronRight className="size-3.5" aria-hidden="true" /><span aria-current="page">{detailLabel}</span></> : <span aria-current="page">{sectionLabel}</span>}
            </nav>
            <div className="admin-topbar-actions">
              <Button asChild className="admin-write-button"><Link href="/admin/articles/new" aria-label="Write article"><PenLine className="size-4" aria-hidden="true" /><span>Write article</span></Link></Button>
              <AdminAppearanceControls />
              <AdminUserMenu user={user} />
            </div>
          </header>
          <main id="admin-main" tabIndex={-1} className="admin-main"><div className="admin-main-inner">{children}</div></main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
