"use client";

import {
  CalendarClock,
  AlertTriangle,
  CreditCard,
  ArrowDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  daysUntil,
  txTypeLabel,
} from "@/lib/transactions-utils";
import type { UpcomingPayment } from "@/types/transactions";
import { cn } from "@/utils/cn";

type UpcomingPaymentCardProps = {
  payment: UpcomingPayment;
};

function PaymentIcon({ type }: { type: UpcomingPayment["type"] }) {
  if (type === "CONTRIBUTION") {
    return <CreditCard className="size-4" />;
  }
  if (type === "LOAN_REPAYMENT") {
    return <ArrowDownLeft className="size-4" />;
  }
  return <AlertTriangle className="size-4" />;
}

export function UpcomingPaymentCard({ payment }: UpcomingPaymentCardProps) {
  const days = daysUntil(payment.dueDate);
  const isOverdue = payment.status === "OVERDUE";
  const isDueSoon = !isOverdue && days <= 3;

  return (
    <Card
      className={cn(
        "border bg-bg transition-colors",
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
                : payment.type === "CONTRIBUTION"
                  ? "bg-primary/10 text-primary"
                  : payment.type === "LOAN_REPAYMENT"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-warning/10 text-warning",
            )}
          >
            <PaymentIcon type={payment.type} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text">
                {payment.groupName}
              </p>
              <Badge variant="outline" className="text-xs">
                {txTypeLabel(payment.type)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {payment.description}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              <CalendarClock className="size-3 text-text-muted" />
              <span className="text-text-muted">
                Due {formatDate(payment.dueDate)}
              </span>
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
                ·{" "}
                {isOverdue
                  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                  : days === 0
                    ? "Due today"
                    : `${days} day${days !== 1 ? "s" : ""} left`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <p
            className={cn(
              "text-base font-bold",
              isOverdue ? "text-destructive" : "text-text",
            )}
          >
            {formatCurrency(payment.amount, payment.currency)}
          </p>
          <Badge
            variant={isOverdue ? "destructive" : "warning"}
            className="text-xs"
          >
            {isOverdue ? "Overdue" : "Upcoming"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
