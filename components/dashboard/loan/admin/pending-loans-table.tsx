// components/admin/pending-loans-table.tsx
"use client";

import type { LoanApplication } from "@/types/loan";
import { fmt, fmtDate } from "@/lib/loans-utils";
import { cn } from "@/utils/cn";
import { useState } from "react";

type Props = {
  applications: LoanApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
};

export function PendingLoansTable({
  applications,
  onApprove,
  onReject,
}: Props) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No pending loan applications.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Applicant
            </th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Group
            </th>
            <th className="px-4 py-3 text-right font-medium text-text-muted">
              Amount
            </th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Terms
            </th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">
              Applied
            </th>
            <th className="px-4 py-3 text-center font-medium text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-text">{app.userName}</p>
                  <p className="text-xs text-text-muted">
                    ID: {app.userId.slice(0, 8)}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-text">{app.groupName}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-text">
                {fmt(app.principal, app.currency)}
              </td>
              <td className="px-4 py-3 text-text-muted">
                {app.interestRate}% · {app.repaymentPeriodDays}d
              </td>
              <td className="px-4 py-3 text-text-muted">
                {fmtDate(app.appliedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onApprove(app.id)}
                    className="rounded-md bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-500/20"
                  >
                    Approve
                  </button>
                  {rejectingId === app.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-32 rounded-md border border-border bg-bg px-2 py-1 text-xs"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          onReject(app.id, rejectReason);
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="rounded-md bg-bg-muted px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(app.id)}
                      className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
