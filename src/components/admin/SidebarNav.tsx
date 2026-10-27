"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Mail, Share2, UserPen, Newspaper, Images } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  { label: "Workspace", items: [{ href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard }] },
  { label: "Publishing", items: [
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/media", label: "Images", icon: Images },
    { href: "/admin/books", label: "Books", icon: BookOpen },
    { href: "/admin/authors", label: "Authors", icon: UserPen },
  ] },
  { label: "Audience", items: [
    { href: "/admin/leads", label: "Readers", icon: Mail },
    { href: "/admin/referrals", label: "Links & partners", icon: Share2 },
  ] },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Publisher workspace" className="admin-sidebar-nav">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="admin-nav-group">
          <p className="admin-nav-group-label">{group.label}</p>
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={cn("admin-nav-link", active && "admin-nav-link-active")}>
                <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
