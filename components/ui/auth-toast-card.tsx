"use client";

import {
  AlertTriangle,
  Check,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

export type AuthToastVariant = "info" | "success" | "warning" | "error";

type VariantStyle = {
  Icon: LucideIcon;
  iconCircle: string;
  actionTextClass: string;
};

const variants: Record<AuthToastVariant, VariantStyle> = {
  info: {
    Icon: Info,
    iconCircle:
      "bg-[var(--color-info)] text-white ring-2 ring-[var(--color-info-soft)]",
    actionTextClass: "text-text",
  },
  success: {
    Icon: Check,
    iconCircle:
      "bg-[var(--color-success)] text-white ring-2 ring-[var(--color-primary-soft)]",
    actionTextClass: "text-text",
  },
  warning: {
    Icon: AlertTriangle,
    iconCircle:
      "bg-[var(--color-warning)] text-white ring-2 ring-[var(--color-warning-soft)]",
    actionTextClass: "text-text",
  },
  error: {
    Icon: X,
    iconCircle:
      "bg-[var(--color-error)] text-white ring-2 ring-[var(--color-error)]/25",
    actionTextClass: "text-[var(--color-error)]",
  },
};

export type AuthToastCardProps = {
  toastId: number | string;
  variant: AuthToastVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AuthToastCard({
  toastId,
  variant,
  title,
  description,
  actionLabel,
  onAction,
}: AuthToastCardProps) {
  const { Icon, iconCircle, actionTextClass } = variants[variant];
  const showAction = Boolean(actionLabel && onAction);

  return (
    <div
      className={cn(
        "flex max-w-[min(100vw-2rem,24rem)] overflow-hidden rounded-[var(--radius)] border border-border bg-secondary text-text shadow-[var(--shadow-md)]",
      )}
      role="alert"
    >
      <div className="flex min-w-0 flex-1 gap-3 p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            iconCircle,
          )}
        >
          <Icon className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold leading-tight text-text">{title}</p>
          <p className="mt-1 text-sm leading-snug text-text-muted">{description}</p>
        </div>
      </div>

      <div className="flex w-[5.5rem] shrink-0 flex-col border-l border-border">
        {showAction ? (
          <button
            type="button"
            className={cn(
              "flex flex-1 items-center justify-center border-b border-border px-2 py-2.5 text-center text-xs font-medium transition-colors duration-[var(--transition)] hover:bg-primary-soft",
              actionTextClass,
            )}
            onClick={() => {
              onAction?.();
              toast.dismiss(toastId);
            }}
          >
            {actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center px-2 py-2.5 text-center text-xs font-medium text-text-muted transition-colors duration-[var(--transition)] hover:bg-secondary-2 hover:text-text",
            !showAction && "flex-[2]",
          )}
          onClick={() => toast.dismiss(toastId)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
