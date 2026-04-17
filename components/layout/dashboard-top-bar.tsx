"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/providers/theme-provider";
import { cn } from "@/utils/cn";

type DashboardTopBarProps = {
  onOpenMobileNav: () => void;
};

export function DashboardTopBar({ onOpenMobileNav }: DashboardTopBarProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header
      className={cn(
        "relative z-20 flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-bg",
        "px-3 pt-[max(0px,env(safe-area-inset-top,0px))] pb-0 sm:px-4",
        "lg:pt-0",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-text-muted hover:bg-primary-soft hover:text-text lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>
      <span className="mr-auto min-w-0 truncate text-xs font-medium uppercase tracking-wider text-text-muted sm:text-sm">
        Workspace
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "shrink-0 border-border bg-secondary text-text hover:bg-primary-soft",
          "gap-2 px-2.5 sm:px-3",
        )}
        onClick={() => toggleTheme()}
        aria-label={
          mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {mounted && theme === "dark" ? (
          <>
            <Sun className="size-4 shrink-0" />
            <span className="hidden sm:inline">Light</span>
          </>
        ) : (
          <>
            <Moon className="size-4 shrink-0" />
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
      </Button>
    </header>
  );
}
