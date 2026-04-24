"use client";

import { fmt, fmtDate, daysUntil } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";
import type { GroupMemberLoanAdminRow } from "@/lib/api/loans-api";

type Props = {
  loan: GroupMemberLoanAdminRow;
};

function statusClass(loan: GroupMemberLoanAdminRow) {
  if (loan.isOverdue) {
    return "bg-destructive/10 text-destructive";
  }
  if (loan.status === "REPAID") {
    return "bg-green-500/10 text-green-600";
  }
  if (loan.status === "DEFAULTED") {
    return "bg-destructive/10 text-destructive";
  }
  return "bg-primary/10 text-primary";
}

export function GroupAdminMemberLoanCard({ loan }: Props) {
  const pct = loan.totalRepayable > 0
    ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
    : 0;
  const days = daysUntil(loan.dueDate);

  return (
    <div
      className={cn(
        "rounded-(--radius) border border-border bg-bg p-4",
        loan.isOverdue && "border-destructive/30",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-text-muted">{loan.groupName}</p>
          <p className="text-lg font-bold tabular-nums text-text">
            {fmt(loan.outstanding, loan.currency)} <span className="text-sm font-normal text-text-muted">outstanding</span>
          </p>
          <p className="text-xs text-text-muted">
            {loan.userName} &middot; {loan.userEmail}
          </p>
        </div>
        <span
          className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass(loan))}
        >
          {loan.isOverdue
            ? "Overdue"
            : loan.status === "REPAID"
              ? "Repaid"
              : loan.status}
        </span>
      </div>

      <div className="mb-1 flex justify-between text-xs text-text-muted">
        <span>Repaid vs total</span>
        <span>
          {fmt(loan.amountRepaid, loan.currency)} / {fmt(loan.totalRepayable, loan.currency)} ({pct}%)
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            loan.isOverdue ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-text-muted">Principal</p>
          <p className="font-medium tabular-nums">{fmt(loan.principal, loan.currency)}</p>
        </div>
        <div>
          <p className="text-text-muted">Penalties</p>
          <p className="font-medium tabular-nums text-destructive">
            {loan.penaltyAccrued > 0
              ? fmt(loan.penaltyAccrued, loan.currency)
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-text-muted">Disbursed</p>
          <p className="font-medium">{fmtDate(loan.disbursedAt)}</p>
        </div>
        <div>
          <p className="text-text-muted">Due</p>
          <p className={cn("font-medium", loan.isOverdue && "text-destructive")}>
            {fmtDate(loan.dueDate)} ({days < 0 ? `${Math.abs(days)}d over` : `${days}d left`})
          </p>
        </div>
      </div>
    </div>
  );
}
