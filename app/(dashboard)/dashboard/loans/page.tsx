"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepositModal } from "@/components/dashboard/groups/deposit-modal";
import { UserLoansSummaryBar } from "@/components/dashboard/loan/user-loans-summary-bar";
import { UserMemberLoanCard } from "@/components/dashboard/loan/user-member-loan-card";
import { UserLoanApplicationsList } from "@/components/dashboard/loan/user-loan-applications-list";
import { useGroupQuery } from "@/lib/query/groups-queries";
import { useUserLoansQuery } from "@/lib/query/loans-queries";
import type { UserLoansResponse } from "@/types/user-loans-schema";

export default function LoansPage() {
  const { data, isLoading, isError, error, isRefetching } = useUserLoansQuery();
  const [repay, setRepay] = useState<{
    groupId: string;
    memberLoanId: string;
  } | null>(null);

  const groupForRepay = useGroupQuery(repay?.groupId ?? "", Boolean(repay));

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

  const { applications, memberLoans } = data;

  return (
    <main className="min-h-screen bg-bg-muted/30 py-6">
      <div className="container mx-auto max-w-4xl space-y-6 px-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">My loans</h1>
            <p className="mt-1 text-sm text-text-muted">
              Applications, approvals, and repayments (including penalties) through the same
              payment methods as group deposits
            </p>
          </div>
          {isRefetching && (
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          )}
        </div>

        <UserLoansSummaryBar data={data} />

        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList className="border border-border bg-bg">
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary/10">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="loans" className="data-[state=active]:bg-primary/10">
              My loans ({memberLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <UserLoanApplicationsList applications={applications} />
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            {memberLoans.length === 0 ? (
              <div className="rounded-(--radius) border border-border bg-bg p-8 text-center text-text-muted">
                You have no disbursed member loans. Approved applications that are fully
                signed off by both a group admin and the treasurer will appear here.
              </div>
            ) : (
              Object.entries(
                memberLoans.reduce<Record<string, UserLoansResponse["memberLoans"]>>(
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
