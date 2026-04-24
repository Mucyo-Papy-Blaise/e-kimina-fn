// components/admin/overdue-alert-card.tsx
"use client";

import type { LoanWithUser } from "@/types/loan";
import { fmt, fmtDate, daysUntil, remaining } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  overdueLoans: LoanWithUser[];
  onContactUser?: (userId: string) => void;
};

export function OverdueAlertCard({ overdueLoans, onContactUser }: Props) {
  if (overdueLoans.length === 0) {
    return (
      <div className="rounded-(--radius) border border-green-500/30 bg-green-500/5 p-4 text-center">
        <p className="text-sm text-green-600">✓ No overdue loans. All loans are on track!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-t-(--radius) bg-destructive/10 px-4 py-2">
        <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="font-semibold text-destructive">
          {overdueLoans.length} Overdue Loan{overdueLoans.length !== 1 ? "s" : ""} Require Attention
        </h3>
      </div>

      {overdueLoans.map((loan) => {
        const daysOverdue = Math.abs(daysUntil(loan.dueDate));
        const remainingAmount = remaining(loan);
        
        return (
          <div key={loan.id} className="rounded-(--radius) border border-destructive/20 bg-bg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-text">{loan.userName}</p>
                <p className="text-xs text-text-muted">{loan.groupName} · {loan.userEmail}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="text-sm font-bold text-destructive tabular-nums">
                    {fmt(loan.principal, loan.currency)}
                  </span>
                  <span className="text-xs text-text-muted">
                    Due: {fmtDate(loan.dueDate)}
                  </span>
                  <span className="text-xs font-medium text-destructive">
                    {daysOverdue} days overdue
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-destructive tabular-nums">
                  {fmt(remainingAmount, loan.currency)} left
                </p>
                <p className="text-xs text-text-muted">
                  {loan.paidInstallments}/{loan.totalInstallments} instalments paid
                </p>
                {onContactUser && (
                  <button
                    onClick={() => onContactUser(loan.userId)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Contact borrower →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}