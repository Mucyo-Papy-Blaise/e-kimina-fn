"use client";

import type { UserLoansResponse } from "@/types/user-loans-schema";
import { fmt } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  data: UserLoansResponse;
};

export function UserLoansSummaryBar({ data }: Props) {
  const { memberLoans } = data;
  const currency = memberLoans[0]?.currency ?? "RWF";
  const activeLoans = memberLoans.filter((l) => l.status === "ACTIVE");
  const totalOutstanding = activeLoans.reduce((s, l) => s + l.outstanding, 0);
  const totalRepaid = memberLoans.reduce((s, l) => s + l.amountRepaid, 0);
  const totalPenalties = memberLoans.reduce((s, l) => s + l.penaltyAccrued, 0);
  const overdueCount = memberLoans.filter((l) => l.isOverdue).length;

  const stats = [
    {
      label: "Total outstanding",
      value: fmt(totalOutstanding, currency),
      sub: `${activeLoans.length} active loan${activeLoans.length !== 1 ? "s" : ""}`,
      accent: totalOutstanding > 0 ? "text-text" : "text-green-600",
      border: "border-border",
    },
    {
      label: "Total repaid",
      value: fmt(totalRepaid, currency),
      sub: `Across ${memberLoans.length} loan${memberLoans.length !== 1 ? "s" : ""}`,
      accent: "text-green-600",
      border: "border-border",
    },
    {
      label: "Penalties (accrued)",
      value: fmt(totalPenalties, currency),
      sub: "Included in balance due when you pay",
      accent: totalPenalties > 0 ? "text-destructive" : "text-text",
      border: totalPenalties > 0 ? "border-destructive/30" : "border-border",
    },
    {
      label: "Overdue",
      value: String(overdueCount),
      sub:
        overdueCount > 0 ? "Settle via Pay on each loan" : "All loans on track",
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
          <p className={cn("mt-1 text-xl font-bold tabular-nums", s.accent)}>{s.value}</p>
          <p className="mt-0.5 text-xs text-text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
