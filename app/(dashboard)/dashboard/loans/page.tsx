"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepositModal } from "@/components/dashboard/groups/deposit-modal";
import { UserLoansSummaryBar } from "@/components/dashboard/loan/user-loans-summary-bar";
import { UserMemberLoanCard } from "@/components/dashboard/loan/user-member-loan-card";
import { UserLoanApplicationsList } from "@/components/dashboard/loan/user-loan-applications-list";
import { useGroupQuery, useGroupsQuery } from "@/lib/query/groups-queries";
import { useUserLoansQuery } from "@/lib/query/loans-queries";
import type { UserLoansResponse } from "@/types/user-loans-schema";

export default function LoansPage() {
  const { data, isLoading, isError, error, isRefetching } = useUserLoansQuery();
  const groupsQuery = useGroupsQuery("mine");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [repay, setRepay] = useState<{
    groupId: string;
    memberLoanId: string;
  } | null>(null);

  const groupForRepay = useGroupQuery(repay?.groupId ?? "", Boolean(repay));
  const availableGroups = groupsQuery.data ?? [];
  const applications = data?.applications ?? [];
  const memberLoans = data?.memberLoans ?? [];

  useEffect(() => {
    if (availableGroups.length === 0) return;
    if (availableGroups.some((g) => g.id === selectedGroupId)) return;
    setSelectedGroupId(availableGroups[0]!.id);
  }, [availableGroups, selectedGroupId]);

  const filteredApplications = useMemo(
    () => applications.filter((a) => a.groupId === selectedGroupId),
    [applications, selectedGroupId],
  );
  const filteredMemberLoans = useMemo(
    () => memberLoans.filter((l) => l.groupId === selectedGroupId),
    [memberLoans, selectedGroupId],
  );
  const filteredData: UserLoansResponse = useMemo(
    () => ({
      applications: filteredApplications,
      memberLoans: filteredMemberLoans,
    }),
    [filteredApplications, filteredMemberLoans],
  );

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-bg-muted/30">
        <Loader2 className="size-8 animate-spin text-text-muted" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-bg-muted/30 py-6">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="text-destructive">{error?.message ?? "Could not load loans."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-muted/30 py-6">
      <div className="container mx-auto max-w-4xl space-y-6 px-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">My loans</h1>
            <p className="mt-1 text-sm text-text-muted">
              Applications, approvals, and repayments (including penalties) through the same
              payment methods as group deposits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-[220px] border-border bg-bg">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isRefetching && (
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            )}
          </div>
        </div>

        <UserLoansSummaryBar data={filteredData} />

        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList className="border border-border bg-bg">
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary/10">
              Applications ({filteredApplications.length})
            </TabsTrigger>
            <TabsTrigger value="loans" className="data-[state=active]:bg-primary/10">
              My loans ({filteredMemberLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <UserLoanApplicationsList applications={filteredApplications} />
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            {filteredMemberLoans.length === 0 ? (
              <div className="rounded-(--radius) border border-border bg-bg p-8 text-center text-text-muted">
                You have no disbursed member loans. Approved applications that are fully
                signed off by both a group admin and the treasurer will appear here.
              </div>
            ) : (
              Object.entries(
                filteredMemberLoans.reduce<Record<string, UserLoansResponse["memberLoans"]>>(
                  (acc, loan) => {
                    if (!acc[loan.groupName]) acc[loan.groupName] = [];
                    acc[loan.groupName]!.push(loan);
                    return acc;
                  },
                  {},
                ),
              ).map(([groupName, loans]) => (
                <div key={groupName} className="space-y-3">
                  <h2 className="border-l-3 border-primary pl-3 text-base font-semibold text-text">
                    {groupName}
                  </h2>
                  <div className="grid gap-4">
                    {loans.map((loan) => (
                      <UserMemberLoanCard
                        key={loan.id}
                        loan={loan}
                        onPay={(l) => setRepay({ groupId: l.groupId, memberLoanId: l.id })}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {repay && (
        <DepositModal
          open
          onOpenChange={(open) => {
            if (!open) setRepay(null);
          }}
          groupId={repay.groupId}
          groupDetailLoading={groupForRepay.isLoading}
          isVerified={groupForRepay.data?.isVerified === true}
          memberLoanId={repay.memberLoanId}
        />
      )}
    </main>
  );
}
