"use client";

import Link from "next/link";
import { useState } from "react";
import { HelpCircle, PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useClientMounted } from "@/lib/auth/use-client-mounted";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { navigationConfig } from "@/lib/navigation-config";
import { filterNavigationByAccess } from "@/lib/navigation/filter-navigation";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/utils/cn";

const SIDEBAR_COLLAPSED_KEY = "ekimina-sidebar-collapsed";

type AppSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const { user } = useAuth();
  const clientMounted = useClientMounted();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });

  /** Collapse only applies on large screens; drawer is always expanded on mobile. */
  const effectiveCollapsed =
    clientMounted && collapsed && isDesktop;

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

  const mobileDrawerInactive =
    clientMounted && !isDesktop && !mobileOpen;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-border bg-secondary isolate motion-safe:transition-[transform,width] motion-safe:duration-[var(--transition)] motion-safe:ease-out motion-reduce:transition-none",
        "fixed inset-y-0 left-0 z-40 max-h-dvh w-64 max-w-[min(16rem,calc(100vw-1.5rem))] max-lg:shadow-[var(--shadow-md)]",
        "border-r pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[max(0px,env(safe-area-inset-left,0px))]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:z-auto lg:max-h-none lg:translate-x-0 lg:pt-0 lg:pb-0 lg:pl-0 lg:shadow-none",
        effectiveCollapsed ? "lg:w-18" : "lg:w-64",
      )}
      aria-hidden={mobileDrawerInactive ? true : undefined}
      inert={mobileDrawerInactive ? true : undefined}
    >
      <div
        className={cn(
          "flex shrink-0 border-b border-border px-3 py-2",
          effectiveCollapsed
            ? "flex-col items-center gap-2"
            : "h-14 min-h-14 flex-row items-center gap-2",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-2 font-semibold tracking-tight text-text",
            effectiveCollapsed ? "justify-center" : "flex-1",
          )}
          title="E-Kimina"
          onClick={() => onMobileClose()}
        >
          <span className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-radius-sm text-lg font-bold text-bg">
            E
          </span>
          {!effectiveCollapsed ? (
            <span className="truncate lowercase">e-kimina</span>
          ) : null}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden shrink-0 text-text-muted hover:bg-primary-soft hover:text-text lg:inline-flex"
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

      <nav className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden p-3">
        {sections.map((section) => (
          <div key={section.id}>
            {!effectiveCollapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {section.label}
              </p>
            ) : null}
            <SidebarNav
              items={section.items}
              collapsed={effectiveCollapsed}
              onNavigate={onMobileClose}
            />
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border p-3">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full min-h-11 justify-start gap-3 text-text-muted hover:bg-primary-soft hover:text-text sm:min-h-0",
            effectiveCollapsed && "justify-center px-0",
          )}
          title={effectiveCollapsed ? "Help" : undefined}
          asChild
        >
          <Link href="/dashboard/help" onClick={() => onMobileClose()}>
            <HelpCircle className="size-5 shrink-0" />
            {!effectiveCollapsed ? <span>Help</span> : null}
          </Link>
        </Button>

        <UserMenu collapsed={effectiveCollapsed} onNavigate={onMobileClose} />
      </div>
    </aside>
  );
}
