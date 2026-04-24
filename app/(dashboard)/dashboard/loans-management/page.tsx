"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupPendingLoanApplicationsTable } from "@/components/dashboard/loan/group-pending-loan-applications-table";
import { GroupAdminMemberLoanCard } from "@/components/dashboard/loan/group-admin-member-loan-card";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { useGroupQuery, useGroupsQuery } from "@/lib/query/groups-queries";
import {
  useApproveLoanApplicationMutation,
  useGroupLoanApplicationsQuery,
  useGroupMemberLoansAdminQuery,
  useRejectLoanApplicationMutation,
} from "@/lib/query/loans-queries";
import { fmt, fmtDate } from "@/lib/loans-utils";
import { ApiError } from "@/lib/query/query-client";
import { ROLE, type Role } from "@/types/enum";
import { cn } from "@/utils/cn";

function canManageLoansInGroup(role: Role) {
  return role === ROLE.GROUP_ADMIN || role === ROLE.TREASURER;
}

export default function LoanManagementPage() {
  const groupsQ = useGroupsQuery("mine");
  const [groupId, setGroupId] = useState<string>("");
  const [actionAppId, setActionAppId] = useState<string | null>(null);

  const groupQ = useGroupQuery(groupId, Boolean(groupId));
  const applicationsQ = useGroupLoanApplicationsQuery(
    groupId,
    Boolean(groupId) && canManageLoansInGroup(groupQ.data?.myRole ?? ROLE.MEMBER),
  );
  const memberLoansQ = useGroupMemberLoansAdminQuery(
    groupId,
    Boolean(groupId) && canManageLoansInGroup(groupQ.data?.myRole ?? ROLE.MEMBER),
  );

  const approveM = useApproveLoanApplicationMutation();
  const rejectM = useRejectLoanApplicationMutation();

  useEffect(() => {
    const list = groupsQ.data;
    if (!list?.length || groupId) return;
    setGroupId(list[0]!.id);
  }, [groupsQ.data, groupId]);

  if (groupsQ.isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-bg-muted/30">
        <Loader2 className="size-8 animate-spin text-text-muted" />
      </main>
    );
  }

  if (groupsQ.isError || !groupsQ.data) {
    return (
      <main className="min-h-screen bg-bg-muted/30 py-6">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-destructive">
            {groupsQ.error?.message ?? "Could not load your groups."}
          </p>
        </div>
      </main>
    );
  }

  if (groupsQ.data.length === 0) {
    return (
      <main className="min-h-screen bg-bg-muted/30 py-6">
        <div className="container mx-auto max-w-6xl px-4 text-text-muted">
          Join a group first to use loan management.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-muted/30 py-6">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Loan management</h1>
            <p className="mt-1 text-sm text-text-muted">
              Approve or reject applications (group admin and treasurer must both approve
              before a loan is disbursed) and track member loans, penalties, and overdue
              status
            </p>
          </div>
          <div className="w-full max-w-xs space-y-1.5">
            <Label htmlFor="lm-group" className="text-xs text-text-muted">
              Group
            </Label>
            <Select
              value={groupId}
              onValueChange={(v) => {
                setGroupId(v);
                setActionAppId(null);
              }}
            >
              <SelectTrigger id="lm-group" className="border-border bg-bg">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groupsQ.data.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {groupQ.isLoading && (
          <div className="flex items-center gap-2 text-text-muted">
            <Loader2 className="size-4 animate-spin" />
            Loading group access…
          </div>
        )}

        {groupQ.isError && (
          <p className="text-destructive">{groupQ.error?.message}</p>
        )}

        {groupQ.isSuccess && !canManageLoansInGroup(groupQ.data.myRole) && (
          <div className="rounded-(--radius) border border-border bg-bg p-4 text-text-muted">
            In this group your role is <span className="font-medium text-text">{groupQ.data.myRole}</span>
            . Only a group admin or the treasurer can manage loans. Choose another
            group.
          </div>
        )}

        {groupQ.isSuccess && canManageLoansInGroup(groupQ.data.myRole) && (
          <LoanManagementContent
            groupId={groupId}
            groupName={groupQ.data.name}
            currencyCode={memberLoansQ.data?.[0]?.currency}
            actionAppId={actionAppId}
            applicationsQ={applicationsQ}
            memberLoansQ={memberLoansQ}
            onApprove={async ({ applicationId }) => {
              setActionAppId(applicationId);
              try {
                const r = await approveM.mutateAsync({ groupId, applicationId });
                toast.success(r.message);
              } catch (e) {
                toast.error(
                  e instanceof ApiError || e instanceof Error
                    ? getApiErrorMessage(e)
                    : "Approval failed",
                );
              } finally {
                setActionAppId(null);
              }
            }}
            onReject={async ({ applicationId, reason }) => {
              setActionAppId(applicationId);
              try {
                const r = await rejectM.mutateAsync({ groupId, applicationId, reason });
                toast.success(r.message);
              } catch (e) {
                toast.error(
                  e instanceof ApiError || e instanceof Error
                    ? getApiErrorMessage(e)
                    : "Rejection failed",
                );
              } finally {
                setActionAppId(null);
              }
            }}
          />
        )}
      </div>
    </main>
  );
}

type MgmtContentProps = {
  groupId: string;
  groupName: string;
  currencyCode?: string;
  actionAppId: string | null;
  applicationsQ: ReturnType<typeof useGroupLoanApplicationsQuery>;
  memberLoansQ: ReturnType<typeof useGroupMemberLoansAdminQuery>;
  onApprove: (p: { groupId: string; applicationId: string }) => Promise<void>;
  onReject: (p: { groupId: string; applicationId: string; reason: string }) => Promise<void>;
};

function LoanManagementContent({
  groupId,
  groupName,
  currencyCode,
  actionAppId,
  applicationsQ,
  memberLoansQ,
  onApprove,
  onReject,
}: MgmtContentProps) {
  const apps = applicationsQ.data ?? [];
  const loans = memberLoansQ.data ?? [];
  const currency = currencyCode ?? loans[0]?.currency ?? "RWF";
  const pending = apps.filter((a) => a.status === "PENDING");
  const history = apps.filter((a) => a.status !== "PENDING");
  const overdue = loans.filter((l) => l.isOverdue);
  const onTrack = loans.filter((l) => !l.isOverdue);
  const displayLoans = [...loans].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });
  const disbursedPrincipal = loans.reduce((s, l) => s + l.principal, 0);
  const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);
  const totalPenalties = loans.reduce((s, l) => s + l.penaltyAccrued, 0);

  if (applicationsQ.isError) {
    return <p className="text-destructive">{applicationsQ.error?.message}</p>;
  }
  if (memberLoansQ.isError) {
    return <p className="text-destructive">{memberLoansQ.error?.message}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-(--radius) border border-border bg-bg p-4">
          <p className="text-xs text-text-muted">Pending applications</p>
          <p className="text-xl font-bold text-warning">{pending.length}</p>
        </div>
        <div className="rounded-(--radius) border border-border bg-bg p-4">
          <p className="text-xs text-text-muted">Disbursed (principal, group)</p>
          <p className="text-xl font-bold tabular-nums text-text">
            {fmt(disbursedPrincipal, currency)}
          </p>
        </div>
        <div className="rounded-(--radius) border border-border bg-bg p-4">
          <p className="text-xs text-text-muted">Outstanding (all loans)</p>
          <p className="text-xl font-bold tabular-nums text-text">
            {fmt(totalOutstanding, currency)}
          </p>
        </div>
        <div className="rounded-(--radius) border border-destructive/30 bg-bg p-4">
          <p className="text-xs text-text-muted">Penalties accrued</p>
          <p className="text-xl font-bold tabular-nums text-destructive">
            {fmt(totalPenalties, currency)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-bg border border-border">
          <TabsTrigger value="pending" className="data-[state=active]:bg-warning/10">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-primary/10">
            Member loans ({loans.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="data-[state=active]:bg-destructive/10">
            Overdue ({overdue.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/10">
            Application history ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {applicationsQ.isLoading || memberLoansQ.isLoading ? (
            <div className="flex items-center justify-center py-12 text-text-muted">
              <Loader2 className="me-2 size-5 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="rounded-(--radius) border border-border bg-bg">
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-semibold text-text">{groupName}</h2>
                <p className="text-xs text-text-muted">
                  Your action records one of two required approvals. When both a group
                  admin and the treasurer have approved, the loan is disbursed.
                </p>
              </div>
              <div className="p-4">
                <GroupPendingLoanApplicationsTable
                  groupId={groupId}
                  applications={apps}
                  busyApplicationId={actionAppId}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="space-y-4">
          {memberLoansQ.isLoading ? (
            <div className="flex justify-center py-12 text-text-muted">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : loans.length === 0 ? (
            <p className="text-center text-text-muted">No member loans in this group.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">
                {onTrack.length} on track, {overdue.length} with overdue date
              </p>
              <div className="grid gap-3">
                {displayLoans.map((loan) => (
                  <GroupAdminMemberLoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdue.length === 0 ? (
            <div className="rounded-(--radius) border border-green-500/30 bg-green-500/5 p-4 text-center text-sm text-green-600">
              No overdue loans in {groupName}.
            </div>
          ) : (
            <div className="space-y-3">
              {overdue.map((loan) => (
                <GroupAdminMemberLoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <p className="text-text-muted">No past decisions yet in this group.</p>
          ) : (
            <div className="overflow-x-auto rounded-(--radius) border border-border bg-bg p-2">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-3 py-2 text-left text-text-muted">Applicant</th>
                    <th className="px-3 py-2 text-right text-text-muted">Amount</th>
                    <th className="px-3 py-2 text-left text-text-muted">Status</th>
                    <th className="px-3 py-2 text-left text-text-muted">Decided</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{a.userName}</p>
                        <p className="text-xs text-text-muted">{a.userEmail}</p>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmt(a.requestedAmount, a.currency)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            a.status === "APPROVED"
                              ? "bg-green-500/10 text-green-600"
                              : a.status === "REJECTED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-bg-muted text-text-muted",
                          )}
                        >
                          {a.status}
                        </span>
                        {a.rejectionReason && a.status === "REJECTED" && (
                          <p className="mt-1 text-xs text-destructive">{a.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-text-muted text-xs">
                        {a.rejectedAt
                          ? fmtDate(a.rejectedAt)
                          : a.treasurerApprovedAt
                            ? fmtDate(a.treasurerApprovedAt)
                            : a.groupAdminApprovedAt
                              ? fmtDate(a.groupAdminApprovedAt)
                              : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
