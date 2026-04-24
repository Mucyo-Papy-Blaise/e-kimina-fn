// components/admin/admin-loan-card.tsx
"use client";

import type { LoanWithUser } from "@/types/loan";
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
  loan: LoanWithUser;
  onViewDetails?: (loanId: string) => void;
};

function StatusBadge({ status }: { status: LoanWithUser["status"] }) {
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

export function AdminLoanCard({ loan, onViewDetails }: Props) {
  const owed = totalOwed(loan);
  const rem = remaining(loan);
  const pct = progressPercent(loan);
  const days = daysUntil(loan.dueDate);

  const dueLabel =
    loan.status === "PAID"
      ? "Fully paid off"
      : days < 0
        ? `${Math.abs(days)} days overdue`
        : `Due in ${days} days`;

  return (
    <div
      className={cn(
        "rounded-(--radius) border bg-bg p-4 transition-all hover:shadow-sm",
        loan.status === "OVERDUE" ? "border-destructive/30" : "border-border",
      )}
    >
      {/* Header with user info */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold tabular-nums text-text">
              {fmt(loan.principal, loan.currency)}
            </p>
            <span className="rounded-full bg-bg-muted px-2 py-0.5 text-xs text-text-muted">
              {loan.groupName}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {loan.userName} · {loan.userEmail}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      {/* Progress */}
      <div className="mb-1 flex justify-between text-xs text-text-muted">
        <span>Repayment progress</span>
        <span className="tabular-nums">
          {fmt(loan.amountPaid, loan.currency)} / {fmt(owed, loan.currency)} (
          {pct}%)
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            loan.status === "OVERDUE" ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Details grid */}
      <div className="mb-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[11px] text-text-muted">Disbursed</p>
          <p className="text-xs">{fmtDate(loan.disbursedAt)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Due date</p>
          <p
            className={cn(
              "text-xs",
              loan.status === "OVERDUE" ? "text-destructive" : "text-text",
            )}
          >
            {fmtDate(loan.dueDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Remaining</p>
          <p className="text-xs font-medium tabular-nums">
            {loan.status === "PAID" ? "—" : fmt(rem, loan.currency)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Instalments</p>
          <p className="text-xs">
            {loan.paidInstallments}/{loan.totalInstallments}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[11px] font-medium",
            loan.status === "OVERDUE" ? "text-destructive" : "text-text-muted",
          )}
        >
          {dueLabel}
        </p>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(loan.id)}
            className="text-xs text-primary hover:underline"
          >
            View details →
          </button>
        )}
      </div>

      {loan.penaltyAccrued > 0 && (
        <p className="mt-2 rounded-(--radius) bg-destructive/5 px-2.5 py-1.5 text-[11px] font-medium text-destructive">
          +{fmt(loan.penaltyAccrued, loan.currency)} penalty accrued
        </p>
      )}
    </div>
  );
}
