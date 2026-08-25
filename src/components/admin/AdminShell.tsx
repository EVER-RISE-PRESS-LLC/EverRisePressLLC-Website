"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminUser } from "@/lib/auth";
import { AdminThemeProvider } from "./AdminThemeProvider";
import { AdminAppearanceControls } from "./AdminAppearanceControls";
import { SidebarNav } from "./SidebarNav";
import { AdminUserMenu } from "./AdminUserMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminThemeProvider>
      <div className="flex min-h-svh">
        <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
            <span className="inline-block size-2.5 rounded-full bg-primary" />
            <span className="font-heading text-sm font-semibold tracking-wide text-sidebar-foreground">
              EVERRISE PRESS
            </span>
            <span className="ml-auto rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Admin
            </span>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/50">{user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b border-sidebar-border px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 font-heading text-sm tracking-wide">
                    <span className="inline-block size-2.5 rounded-full bg-primary" />
                    EVERRISE PRESS
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4" onClick={() => setMobileOpen(false)}>
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-heading text-sm font-semibold tracking-wide md:hidden">
              EVERRISE PRESS
            </span>
            <span className="hidden text-xs uppercase tracking-wider text-muted-foreground md:inline">
              Publisher Control Room
            </span>
            <div className="ml-auto flex items-center gap-2">
              <AdminAppearanceControls />
              <AdminUserMenu user={user} />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
