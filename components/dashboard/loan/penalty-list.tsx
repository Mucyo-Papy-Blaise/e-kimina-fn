"use client";

import type { LoanPenalty } from "@/types/loan";
import { fmt, fmtDate } from "@/lib/loans-utils";

type Props = {
  penalties: LoanPenalty[];
};

function PenaltyIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
      <svg className="h-4 w-4 text-destructive" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 4.5V8L10.5 10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
    </div>
  );
}

export function PenaltyList({ penalties }: Props) {
  if (penalties.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        No unpaid penalties. Great job keeping up with your payments!
      </p>
    );
  }

  const sorted = [...penalties].sort(
    (a, b) => new Date(b.accruedAt).getTime() - new Date(a.accruedAt).getTime(),
  );

  return (
    <div className="space-y-2">
      {sorted.map((penalty) => (
        <div
          key={penalty.id}
          className="flex items-center gap-3 rounded-(--radius) border border-destructive/20 bg-destructive/5 p-3.5"
        >
          <PenaltyIcon />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-text">
                {penalty.reason}
              </p>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                Unpaid
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {penalty.groupName} · Accrued {fmtDate(penalty.accruedAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="tabular-nums text-sm font-bold text-destructive">
              +{fmt(penalty.amount, penalty.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}