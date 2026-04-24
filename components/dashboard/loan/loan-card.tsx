"use client";

import type { Loan } from "@/types/loan";
import {
  fmt,
  fmtDate,
  daysUntil,
  progressPercent,
  totalOwed,
  remaining,
  statusLabel,
  statusColors,
} from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  loan: Loan;
};

function StatusBadge({ status }: { status: Loan["status"] }) {
  const { badge, dot } = statusColors(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {statusLabel(status)}
    </span>
  );
}

function InstallmentPips({ total, paid }: { total: number; paid: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full transition-colors",
            i < paid ? "bg-primary" : "bg-bg-muted",
          )}
        />
      ))}
      <span className="ml-1.5 text-[11px] text-text-muted">
        {paid}/{total} instalments
      </span>
    </div>
  );
}

export function LoanCard({ loan }: Props) {
  const owed = totalOwed(loan);
  const rem = remaining(loan);
  const pct = progressPercent(loan);
  const days = daysUntil(loan.dueDate);

  const dueLabel =
    loan.status === "PAID"
      ? "Fully paid off"
      : days < 0
        ? `${Math.abs(days)} days overdue`
        : days === 0
          ? "Due today"
          : `Due in ${days} days`;

  const dueLabelColor =
    loan.status === "PAID"
      ? "text-green-600"
      : loan.status === "OVERDUE"
        ? "text-destructive"
        : "text-text";

  const progressColor =
    loan.status === "OVERDUE"
      ? "bg-destructive"
      : loan.status === "PAID"
        ? "bg-green-500"
        : "bg-primary";

  const cardBorder =
    loan.status === "OVERDUE" ? "border-destructive/30" : "border-border";

  return (
    <div
      className={cn(
        "rounded-(--radius) border bg-bg p-4 transition-shadow hover:shadow-sm",
        cardBorder,
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold tabular-nums text-text">
            {fmt(loan.principal, loan.currency)}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {loan.interestRate}% interest &middot; {loan.repaymentPeriodDays}
            -day term
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      {/* Progress */}
      <div className="mb-1 flex justify-between text-xs text-text-muted">
        <span>Repayment progress</span>
        <span className="tabular-nums">
          {fmt(loan.amountPaid, loan.currency)} / {fmt(owed, loan.currency)}
          &nbsp;
          <span className="font-medium text-text">({pct}%)</span>
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", progressColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Meta grid */}
      <div className="mb-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[11px] text-text-muted">Disbursed</p>
          <p className="mt-0.5 text-xs font-medium">
            {fmtDate(loan.disbursedAt)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Due date</p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              loan.status === "OVERDUE" ? "text-destructive" : "text-text",
            )}
          >
            {fmtDate(loan.dueDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Remaining</p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium tabular-nums",
              dueLabelColor,
            )}
          >
            {loan.status === "PAID" ? "—" : fmt(rem, loan.currency)}
          </p>
        </div>
      </div>

      {/* Instalment pips */}
      <InstallmentPips
        total={loan.totalInstallments}
        paid={loan.paidInstallments}
      />

      {/* Due label */}
      <p className={cn("mt-2 text-[11px] font-medium", dueLabelColor)}>
        {dueLabel}
      </p>

      {/* Penalty warning */}
      {loan.penaltyAccrued > 0 && (
        <p className="mt-2 rounded-(--radius) bg-destructive/5 px-2.5 py-1.5 text-[11px] font-medium text-destructive">
          +{fmt(loan.penaltyAccrued, loan.currency)} penalty accrued
        </p>
      )}
    </div>
  );
}
