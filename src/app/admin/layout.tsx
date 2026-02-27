"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  FolderOpen,
  FileText,
  ImageIcon,
  Download,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Kategorien", icon: FolderOpen },
  { href: "/admin/posts", label: "Beiträge", icon: FileText },
  { href: "/admin/media", label: "Medien", icon: ImageIcon },
  { href: "/admin/export", label: "Export", icon: Download },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r border-border/60 p-4 flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold text-foreground leading-tight text-sm">PMT Admin</p>
                <p className="text-xs text-muted-foreground">Verwaltung</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                } ${collapsed ? "justify-center px-2" : ""}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 pt-4 space-y-2">
          {!collapsed && (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Zur Webseite
              </Link>
              <LogoutButton />
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full ${
              collapsed ? "justify-center px-2" : ""
            }`}
            title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                Einklappen
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
