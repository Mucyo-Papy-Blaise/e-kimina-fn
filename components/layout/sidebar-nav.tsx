"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarNavProps = {
  items: readonly NavItem[];
  collapsed: boolean;
  depth?: number;
  /** e.g. close mobile drawer after navigation */
  onNavigate?: () => void;
};

export function SidebarNav({
  items,
  collapsed,
  depth = 0,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        "flex flex-col gap-1",
        depth > 0 && "border-border ml-2 border-l pl-3",
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(pathname, item.href);
        const hasChildren = item.children !== undefined && item.children.length > 0;

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex touch-manipulation items-center gap-3 rounded-radius-sm px-3 py-2.5 text-sm font-medium transition-[background,color] duration-transition",
                active
                  ? "bg-primary-soft text-text"
                  : "text-text-muted hover:bg-secondary-2 hover:text-text",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="size-5 shrink-0 text-primary" aria-hidden />
              {!collapsed ? (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                    <span className="bg-text shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-bg">
                      {item.badgeCount > 99 ? "99+" : String(item.badgeCount).padStart(2, "0")}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </Link>
            {hasChildren && !collapsed ? (
              <SidebarNav
                items={item.children ?? []}
                collapsed={collapsed}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
