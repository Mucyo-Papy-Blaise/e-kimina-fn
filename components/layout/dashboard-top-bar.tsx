"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/providers/theme-provider";
import { cn } from "@/utils/cn";

export function DashboardTopBar() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-bg px-4">
      <span className="mr-auto text-xs font-medium uppercase tracking-wider text-text-muted">
        Workspace
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "border-border bg-secondary text-text hover:bg-primary-soft",
        )}
        onClick={() => toggleTheme()}
        aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {mounted && theme === "dark" ? (
          <>
            <Sun className="size-4" />
            Light
          </>
        ) : (
          <>
            <Moon className="size-4" />
            Dark
          </>
        )}
      </Button>
    </header>
  );
}
