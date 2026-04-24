// components/admin/admin-loan-summary.tsx
"use client";

import type { Loan, LoanPenalty, LoanApplication } from "@/types/loan";
import { fmt } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type Props = {
  loans: Loan[];
  penalties: LoanPenalty[];
  pendingApplications: LoanApplication[];
  overdueLoans: Loan[];
};

export function AdminLoanSummary({
  loans,
  penalties,
  pendingApplications,
  overdueLoans,
}: Props) {
  const currency = "RWF";
  const totalDisbursed = loans.reduce((s, l) => s + l.principal, 0);
  const totalInterestEarned = loans.reduce(
    (s, l) => s + (l.principal * l.interestRate) / 100,
    0,
  );
  const totalPenalties = penalties.reduce((s, p) => s + p.amount, 0);
  const activeLoans = loans.filter((l) => l.status === "ACTIVE").length;
  const completionRate =
    loans.length > 0
      ? Math.round(
          (loans.filter((l) => l.status === "PAID").length / loans.length) *
            100,
        )
      : 0;

  const stats = [
    {
      label: "Total Disbursed",
      value: fmt(totalDisbursed, currency),
      sub: `Across ${loans.length} loans`,
      accent: "text-primary",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: "Interest Earned",
      value: fmt(totalInterestEarned, currency),
      sub: `${completionRate}% completion rate`,
      accent: "text-green-600",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: "Active Loans",
      value: String(activeLoans),
      sub: `${overdueLoans.length} overdue`,
      accent: overdueLoans.length > 0 ? "text-destructive" : "text-text",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2h-4l-1-2H5V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: "Pending Approvals",
      value: String(pendingApplications.length),
      sub: "Awaiting review",
      accent: pendingApplications.length > 0 ? "text-warning" : "text-text",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-(--radius) border border-border bg-bg p-4 transition-all hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">{s.label}</p>
            <div
              className={cn(
                "rounded-full p-1.5",
                s.accent.replace("text", "bg") + "/10",
              )}
            >
              {s.icon}
            </div>
          </div>
          <p className={cn("mt-2 text-xl font-bold tabular-nums", s.accent)}>
            {s.value}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
