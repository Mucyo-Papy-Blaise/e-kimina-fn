"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, fmtDate } from "@/lib/loans-utils";
import type { GroupLoanApplicationRow } from "@/lib/api/loans-api";
type Props = {
  groupId: string;
  applications: GroupLoanApplicationRow[];
  onApprove: (args: { groupId: string; applicationId: string }) => Promise<unknown>;
  onReject: (args: { groupId: string; applicationId: string; reason: string }) => Promise<unknown>;
  busyApplicationId: string | null;
};

export function GroupPendingLoanApplicationsTable({
  groupId,
  applications,
  onApprove,
  onReject,
  busyApplicationId,
}: Props) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = applications.filter((a) => a.status === "PENDING");

  if (pending.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        No applications waiting for a decision in this group.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Applicant</th>
            <th className="px-4 py-3 text-right font-medium text-text-muted">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Terms</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Applied</th>
            <th className="px-4 py-3 text-left font-medium text-text-muted">Approvals</th>
            <th className="px-4 py-3 text-center font-medium text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((app) => (
            <tr key={app.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 align-top">
                <p className="font-medium text-text">{app.userName}</p>
                <p className="text-xs text-text-muted">{app.userEmail}</p>
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-text">
                {fmt(app.requestedAmount, app.currency)}
              </td>
              <td className="px-4 py-3 text-text-muted">
                {app.interestRate}% &middot; {app.repaymentPeriodDays}d
              </td>
              <td className="px-4 py-3 text-text-muted">{fmtDate(app.createdAt)}</td>
              <td className="px-4 py-3 text-xs text-text">
                <ul className="space-y-0.5 text-text-muted">
                  <li>
                    Admin:{" "}
                    {app.groupAdminApproved
                      ? "✓"
                      : "—"}{" "}
                    {app.groupAdminApprovedByName
                      ? `(${app.groupAdminApprovedByName})`
                      : ""}
                  </li>
                  <li>
                    Treasurer:{" "}
                    {app.treasurerApproved
                      ? "✓"
                      : "—"}{" "}
                    {app.treasurerApprovedByName
                      ? `(${app.treasurerApprovedByName})`
                      : ""}
                  </li>
                  {app.waitingOn && (
                    <li className="text-warning">
                      Awaiting: {app.waitingOn.replace(/_/g, " ")}
                    </li>
                  )}
                </ul>
              </td>
              <td className="px-4 py-3">
                {rejectingId === app.id ? (
                  <div className="flex min-w-[200px] flex-col gap-2">
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (required)"
                      className="h-9 text-xs"
                    />
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={busyApplicationId === app.id}
                        onClick={async () => {
                          if (!rejectReason.trim()) {
                            toast.error("Enter a rejection reason.");
                            return;
                          }
                          try {
                            await onReject({
                              groupId,
                              applicationId: app.id,
                              reason: rejectReason.trim(),
                            });
                            setRejectingId(null);
                            setRejectReason("");
                          } catch {
                            /* error toast from parent */
                          }
                        }}
                      >
                        {busyApplicationId === app.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : null}
                        Confirm reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-stretch justify-center gap-1.5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      disabled={busyApplicationId != null}
                      onClick={async () => {
                        try {
                          await onApprove({ groupId, applicationId: app.id });
                        } catch {
                          /* error toast from parent */
                        }
                      }}
                    >
                      {busyApplicationId === app.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        setRejectingId(app.id);
                        setRejectReason("");
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
