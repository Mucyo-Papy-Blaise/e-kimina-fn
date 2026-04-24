"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { daysUntil, formatCurrency, formatDate } from "@/lib/transactions-utils";
import type { PenaltyBalance } from "@/types/transactions";
import { cn } from "@/utils/cn";

type PenaltyBalanceCardProps = {
  penalty: PenaltyBalance;
};

export function PenaltyBalanceCard({ penalty }: PenaltyBalanceCardProps) {
  const days = daysUntil(penalty.dueDate);
  const isOverdue = days < 0;
  const isDueSoon = days >= 0 && days <= 3;

  return (
    <Card
      className={cn(
        "border bg-bg",
        isOverdue
          ? "border-destructive/40"
          : isDueSoon
            ? "border-warning/40"
            : "border-border",
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              isOverdue
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-warning",
            )}
          >
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">
              {penalty.groupName}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{penalty.reason}</p>
            <p className="mt-1 text-xs text-text-muted">
              Due {formatDate(penalty.dueDate)} ·{" "}
              <span
                className={cn(
                  "font-medium",
                  isOverdue
                    ? "text-destructive"
                    : isDueSoon
                      ? "text-warning"
                      : "text-text-muted",
                )}
              >
                {isOverdue
                  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                  : days === 0
                    ? "Due today"
                    : `${days} day${days !== 1 ? "s" : ""} left`}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-base font-bold text-destructive">
            {formatCurrency(penalty.amount, penalty.currency)}
          </p>
          <Badge
            variant={penalty.status === "UNPAID" ? "destructive" : "success"}
            className="text-xs"
          >
            {penalty.status === "UNPAID" ? "Unpaid" : "Paid"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
