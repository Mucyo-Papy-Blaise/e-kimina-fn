"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HelpCircle,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { navigationConfig } from "@/lib/navigation-config";
import { filterNavigationByAccess } from "@/lib/navigation/filter-navigation";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { useTheme } from "@/lib/providers/theme-provider";
import { cn } from "@/utils/cn";

const SIDEBAR_COLLAPSED_KEY = "ekimina-sidebar-collapsed";

export function AppSidebar() {
  const { user } = useAuth();
  const { toggleTheme, theme, mounted } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  const sections = user
    ? filterNavigationByAccess(navigationConfig, user)
    : [];

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-secondary transition-[width] duration-transition",
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex border-b border-border px-3 py-2",
          collapsed ? "flex-col items-center gap-2" : "h-14 flex-row items-center gap-2",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-2 font-semibold tracking-tight text-text",
            collapsed ? "justify-center" : "flex-1",
          )}
          title="E-Kimina"
        >
          <span className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-radius-sm text-lg font-bold text-bg">
            E
          </span>
          {!collapsed ? <span className="truncate lowercase">e-kimina</span> : null}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-text-muted hover:bg-primary-soft hover:text-text"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.id}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {section.label}
              </p>
            ) : null}
            <SidebarNav items={section.items} collapsed={collapsed} />
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border p-3">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-text-muted hover:bg-primary-soft hover:text-text",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Help" : undefined}
          asChild
        >
          <Link href="/dashboard/help">
            <HelpCircle className="size-5 shrink-0" />
            {!collapsed ? <span>Help</span> : null}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-text-muted hover:bg-primary-soft hover:text-text",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Settings" : undefined}
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="size-5 shrink-0" />
            {!collapsed ? <span>Settings</span> : null}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-text-muted hover:bg-primary-soft hover:text-text",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Toggle theme" : undefined}
          onClick={() => toggleTheme()}
        >
          {mounted && theme === "dark" ? (
            <>
              <Sun className="size-5 shrink-0" />
              {!collapsed ? <span>Light mode</span> : null}
            </>
          ) : (
            <>
              <Moon className="size-5 shrink-0" />
              {!collapsed ? <span>Dark mode</span> : null}
            </>
          )}
        </Button>
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
