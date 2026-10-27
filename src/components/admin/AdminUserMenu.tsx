"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, LogOut } from "lucide-react";
import type { AdminUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function AdminUserMenu({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Check your connection and try again.");
      setLoggingOut(false);
    }
  }
  const initials = user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "EP";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" className="admin-user-trigger" disabled={loggingOut} aria-label={`Account menu for ${user.name}`}>
        <span className="admin-person-avatar" aria-hidden="true">{initials}</span><ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="space-y-1 p-3"><p className="break-words text-sm font-semibold text-foreground">{user.name}</p><p className="break-all text-sm font-normal">{user.email}</p><p className="text-xs font-normal">{user.role === "ADMIN" ? "Administrator" : "Editor"}</p></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />View public website<span className="sr-only"> (opens in a new tab)</span></Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} disabled={loggingOut}><LogOut className="size-4" />{loggingOut ? "Signing out…" : "Sign out"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
