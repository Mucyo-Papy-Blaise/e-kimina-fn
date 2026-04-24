"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryTab } from "@/components/dashboard/transactions/history-tab";
import { UpcomingTab } from "@/components/dashboard/transactions/upcoming-tab";
import { useUserFinanceUpcomingQuery } from "@/lib/query/user-finance-queries";

export default function TransactionsPageContent() {
  const { data: upcomingRes } = useUserFinanceUpcomingQuery();
  const payments = upcomingRes?.items ?? [];

  const overdueCount = useMemo(
    () => payments.filter((p) => p.status === "OVERDUE").length,
    [payments],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your contribution history, group balances, and upcoming payment
          schedule.
        </p>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="border border-border bg-secondary">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="upcoming" className="relative gap-2">
            Upcoming
            {overdueCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {overdueCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="pt-6">
          <HistoryTab />
        </TabsContent>

        <TabsContent value="upcoming" className="pt-6">
          <UpcomingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
