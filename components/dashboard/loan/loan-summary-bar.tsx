"use client";

import type { Loan, LoanPenalty } from "@/types/loan";
import { fmt, remaining } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  loans: Loan[];
  penalties: LoanPenalty[];
};

export function LoanSummaryBar({ loans, penalties }: Props) {
  const currency = loans[0]?.currency ?? "RWF";
  const activeLoans = loans.filter(
    (l) => l.status === "ACTIVE" || l.status === "OVERDUE",
  );
  const totalRemaining = activeLoans.reduce((s, l) => s + remaining(l), 0);
  const totalPaid = loans.reduce((s, l) => s + l.amountPaid, 0);
  const totalPenalties = penalties
    .filter((p) => !p.isPaid)
    .reduce((s, p) => s + p.amount, 0);
  const overdueCount = loans.filter((l) => l.status === "OVERDUE").length;

  const stats = [
    {
      label: "Total Outstanding",
      value: fmt(totalRemaining, currency),
      sub: `${activeLoans.length} active loan${activeLoans.length !== 1 ? "s" : ""}`,
      accent: totalRemaining > 0 ? "text-text" : "text-green-600",
      border: "border-border",
    },
    {
      label: "Total Repaid",
      value: fmt(totalPaid, currency),
      sub: `Across ${loans.length} loan${loans.length !== 1 ? "s" : ""}`,
      accent: "text-green-600",
      border: "border-border",
    },
    {
      label: "Unpaid Penalties",
      value: fmt(totalPenalties, currency),
      sub: `${penalties.filter((p) => !p.isPaid).length} fine${penalties.filter((p) => !p.isPaid).length !== 1 ? "s" : ""}`,
      accent: totalPenalties > 0 ? "text-destructive" : "text-text",
      border: totalPenalties > 0 ? "border-destructive/30" : "border-border",
    },
    {
      label: "Overdue Loans",
      value: String(overdueCount),
      sub:
        overdueCount > 0 ? "Immediate action required" : "All loans on track",
      accent: overdueCount > 0 ? "text-destructive" : "text-green-600",
      border: overdueCount > 0 ? "border-destructive/30" : "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={cn("rounded-(--radius) border bg-bg p-4", s.border)}
        >
          <p className="text-xs text-text-muted">{s.label}</p>
          <p className={cn("mt-1 text-xl font-bold tabular-nums", s.accent)}>
            {s.value}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
