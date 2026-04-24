"use client";

import { Button } from "@/components/ui/button";
import type { UserLoansResponse } from "@/types/user-loans-schema";
import { fmt, fmtDate, daysUntil } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type MemberRow = UserLoansResponse["memberLoans"][number];

type Props = {
  loan: MemberRow;
  onPay: (loan: MemberRow) => void;
};

function statusLabel(loan: MemberRow) {
  if (loan.isOverdue) return "Overdue";
  if (loan.status === "REPAID") return "Repaid";
  if (loan.status === "DEFAULTED") return "Defaulted";
  if (loan.status === "ACTIVE") return "Active";
  return loan.status;
}

function statusBadgeClass(loan: MemberRow) {
  if (loan.isOverdue || loan.status === "DEFAULTED") {
    return "bg-destructive/10 text-destructive";
  }
  if (loan.status === "REPAID") {
    return "bg-green-500/10 text-green-600";
  }
  return "bg-primary/10 text-primary";
}

export function UserMemberLoanCard({ loan, onPay }: Props) {
  const canPay = loan.status === "ACTIVE" && loan.outstanding > 0.009;
  const days = daysUntil(loan.dueDate);
  const dueText =
    loan.status === "REPAID"
      ? "Fully repaid"
      : days < 0
        ? `${Math.abs(days)} days past due`
        : days === 0
          ? "Due today"
          : `Due in ${days} day${days === 1 ? "" : "s"}`;

  const pct = loan.totalRepayable > 0
    ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
    : 0;

  return (
    <div
      className={cn(
        "rounded-(--radius) border bg-bg p-4",
        loan.isOverdue ? "border-destructive/30" : "border-border",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text">{loan.groupName}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-text">
            {fmt(loan.outstanding, loan.currency)} <span className="text-sm font-normal text-text-muted">outstanding</span>
          </p>
          <p className="text-xs text-text-muted">
            {loan.interestRate}% interest &middot; {loan.repaymentPeriodDays} days &middot; principal{" "}
            {fmt(loan.principal, loan.currency)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusBadgeClass(loan),
          )}
        >
          {statusLabel(loan)}
        </span>
      </div>

      <div className="mb-1 flex justify-between text-xs text-text-muted">
        <span>Progress</span>
        <span className="tabular-nums text-text">
          {fmt(loan.amountRepaid, loan.currency)} / {fmt(loan.totalRepayable, loan.currency)} (
          {pct}%)
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            loan.isOverdue ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[11px] text-text-muted">Disbursed</p>
          <p className="text-xs font-medium">{fmtDate(loan.disbursedAt)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Due</p>
          <p className={cn("text-xs font-medium", loan.isOverdue && "text-destructive")}>
            {fmtDate(loan.dueDate)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[11px] text-text-muted">Penalties</p>
          <p className="text-xs font-medium tabular-nums text-destructive">
            {loan.penaltyAccrued > 0 ? fmt(loan.penaltyAccrued, loan.currency) : "—"}
          </p>
        </div>
      </div>

      <p
        className={cn(
          "text-xs font-medium",
          loan.isOverdue ? "text-destructive" : "text-text-muted",
        )}
      >
        {dueText}
      </p>

      {canPay && (
        <Button
          type="button"
          className="mt-3 w-full"
          onClick={() => onPay(loan)}
        >
          Pay
        </Button>
      )}
    </div>
  );
}
