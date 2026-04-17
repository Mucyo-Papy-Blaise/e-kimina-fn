"use client";

import Link from "next/link";
import { ChevronUp, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-context";
import { toastSignedOut } from "@/lib/auth-toast";
import { cn } from "@/utils/cn";

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type UserMenuProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

export function UserMenu({ collapsed, onNavigate }: UserMenuProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const label = initials(user.fullName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-left text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? `${user.fullName} — ${user.email}` : undefined}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-text)] text-sm font-semibold text-[var(--color-bg)]">
            {label}
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">{user.fullName}</span>
                <span className="block truncate text-xs text-[var(--color-text-muted)]">{user.email}</span>
              </span>
              <ChevronUp className="size-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
            </>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
        align="end"
        side="top"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer focus:bg-[var(--color-primary-soft)]"
        >
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2"
            onClick={() => onNavigate?.()}
          >
            <User className="size-4" />
            My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-[var(--color-error)] focus:bg-[var(--color-primary-soft)] focus:text-[var(--color-error)]"
          onSelect={() => {
            toastSignedOut();
            logout();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
