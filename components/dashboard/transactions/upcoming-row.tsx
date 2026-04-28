"use client";

import {
  CalendarClock,
  CreditCard,
  ArrowDownLeft,
  AlertTriangle,
  Landmark,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UpcomingPayment } from "@/types/transactions";
import {
  formatDate,
  daysUntil,
  txTypeLabel,
  formatCurrency,
} from "@/lib/transactions-utils";
import { cn } from "@/utils/cn";

type Props = {
  payment: UpcomingPayment;
  onPay?: (payment: UpcomingPayment) => void;
};

export function UpcomingRow({ payment: p, onPay }: Props) {
  const isPendingConfirmation = p.status === "PENDING_CONFIRMATION";
  const isOverdue = p.status === "OVERDUE";
  const canPayNow = !isPendingConfirmation;
  const days = daysUntil(p.dueDate);

  const iconEl =
    p.type === "DEPOSIT" ? (
      <Landmark className="size-4" />
    ) : p.type === "CONTRIBUTION" ? (
      <CreditCard className="size-4" />
    ) : p.type === "LOAN_REPAYMENT" ? (
      <ArrowDownLeft className="size-4" />
    ) : (
      <AlertTriangle className="size-4" />
    );

  const iconBg = isPendingConfirmation
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
    : isOverdue
      ? "bg-destructive/10 text-destructive"
      : p.type === "CONTRIBUTION"
        ? "bg-primary/10 text-primary"
        : p.type === "DEPOSIT"
          ? "bg-primary/10 text-primary"
          : p.type === "LOAN_REPAYMENT"
            ? "bg-blue-500/10 text-blue-500"
            : "bg-warning/10 text-warning";

  const countdown = isPendingConfirmation
    ? "Awaiting admin confirmation"
    : isOverdue
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Due today"
        : `${days}d left`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-(--radius) border px-4 py-3.5 transition-colors sm:flex-row sm:items-center",
        isPendingConfirmation
          ? "border-amber-500/30 bg-amber-500/5"
          : isOverdue
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-bg hover:bg-secondary/50",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          iconBg,
        )}
      >
        {isPendingConfirmation ? <Clock className="size-4" /> : iconEl}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">
          {p.description}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
          <CalendarClock className="size-3" />
          <span>
            {isPendingConfirmation
              ? `Submitted ${formatDate(p.dueDate)}`
              : formatDate(p.dueDate)}
          </span>
          <span>·</span>
          <span
            className={cn(
              "font-medium",
              isPendingConfirmation
                ? "text-amber-600 dark:text-amber-500"
                : isOverdue
                  ? "text-destructive"
                  : days <= 3
                    ? "text-warning"
                    : "text-text-muted",
            )}
          >
            {countdown}
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted sm:hidden">{p.groupName}</p>
      </div>

      <div className="hidden shrink-0 text-xs text-text-muted sm:block">
        {p.groupName}
      </div>
      <div className="hidden shrink-0 sm:block">
        <Badge variant="outline" className="text-xs">
          {isPendingConfirmation ? "Pending review" : txTypeLabel(p.type)}
        </Badge>
      </div>

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <p
          className={cn(
            "shrink-0 text-sm font-bold tabular-nums",
            isOverdue ? "text-destructive" : "text-text",
          )}
        >
          {formatCurrency(p.amount, p.currency)}
        </p>
        {canPayNow && onPay ? (
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => onPay(p)}
          >
            Pay now
          </Button>
        ) : null}
      </div>
    </div>
  );
}
