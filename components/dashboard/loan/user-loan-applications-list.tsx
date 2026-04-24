"use client";

import type { UserLoansResponse } from "@/types/user-loans-schema";
import { fmt, fmtDate, fmtDateTime } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";

type AppRow = UserLoansResponse["applications"][number];

type Props = {
  applications: AppRow[];
};

function appStatusPill(status: string) {
  if (status === "PENDING") {
    return { label: "Pending", className: "bg-warning/10 text-warning" };
  }
  if (status === "APPROVED") {
    return { label: "Approved", className: "bg-green-500/10 text-green-600" };
  }
  if (status === "REJECTED") {
    return { label: "Rejected", className: "bg-destructive/10 text-destructive" };
  }
  if (status === "CANCELLED") {
    return { label: "Cancelled", className: "bg-bg-muted text-text-muted" };
  }
  return { label: status, className: "bg-bg-muted text-text" };
}

export function UserLoanApplicationsList({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-(--radius) border border-border bg-bg p-8 text-center text-text-muted">
        You have not requested any group loans yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {applications.map((a) => {
        const pill = appStatusPill(a.status);
        return (
          <li
            key={a.id}
            className="rounded-(--radius) border border-border bg-bg p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-text">{a.groupName}</p>
                <p className="text-lg font-bold tabular-nums text-text">
                  {fmt(a.requestedAmount, a.currency)}
                </p>
                <p className="text-xs text-text-muted">
                  {a.interestRate}% &middot; {a.repaymentPeriodDays} days &middot; applied{" "}
                  {fmtDate(a.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  pill.className,
                )}
              >
                {pill.label}
              </span>
            </div>

            {a.status === "PENDING" && (
              <div className="mt-3 space-y-1 text-xs text-text-muted">
                <p>
                  <span className="font-medium text-text">Group admin:</span>{" "}
                  {a.groupAdminApproved
                    ? "Approved"
                    : "Not approved yet"}
                </p>
                <p>
                  <span className="font-medium text-text">Treasurer:</span>{" "}
                  {a.treasurerApproved
                    ? "Approved"
                    : "Not approved yet"}
                </p>
                {a.waitingOn && (
                  <p className="text-[11px] text-warning">
                    Waiting on: {a.waitingOn.replace(/_/g, " ")}
                  </p>
                )}
                <p className="text-[11px]">
                  The loan is only disbursed after both a group admin and the treasurer
                  have approved.
                </p>
              </div>
            )}

            {a.status === "REJECTED" && (
              <div className="mt-3 rounded-(--radius) border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm">
                <p className="text-xs font-medium text-destructive">Reason</p>
                <p className="text-sm text-text">
                  {a.rejectionReason?.trim() || "No reason was provided."}
                </p>
                {a.rejectedAt && (
                  <p className="mt-1 text-xs text-text-muted">
                    {fmtDateTime(a.rejectedAt)}
                  </p>
                )}
              </div>
            )}

            {a.status === "APPROVED" && a.disbursedLoanId && (
              <p className="mt-2 text-xs text-text-muted">
                Disbursed loan ID: {a.disbursedLoanId}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
