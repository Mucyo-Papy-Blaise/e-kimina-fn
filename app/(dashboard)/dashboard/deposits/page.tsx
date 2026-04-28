"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2, TriangleAlert, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DepositModal } from "@/components/dashboard/groups/deposit-modal";
import { HistoryTab } from "@/components/dashboard/transactions/history-tab";
import { UpcomingTab } from "@/components/dashboard/transactions/upcoming-tab";
import { useGroupQuery, useGroupsQuery } from "@/lib/query/groups-queries";
import { useUserFinanceUpcomingQuery } from "@/lib/query/user-finance-queries";
import { formatCurrency } from "@/lib/transactions-utils";

export default function TransactionsPageContent() {
  const groupsQuery = useGroupsQuery("mine");
  const upcomingQuery = useUserFinanceUpcomingQuery();
  const [chosenGroupId, setChosenGroupId] = useState("");
  const [payGroupId, setPayGroupId] = useState<string | null>(null);

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const groupForPay = useGroupQuery(payGroupId ?? "", Boolean(payGroupId));
  const selectedGroupId = useMemo(() => {
    if (chosenGroupId && groups.some((g) => g.id === chosenGroupId)) {
      return chosenGroupId;
    }
    return groups[0]?.id ?? "";
  }, [chosenGroupId, groups]);
  const payments = useMemo(() => upcomingQuery.data?.items ?? [], [upcomingQuery.data]);
  const filteredPayments = useMemo(
    () =>
      selectedGroupId
        ? payments.filter((p) => p.groupId === selectedGroupId)
        : [],
    [payments, selectedGroupId],
  );

  const overdueCount = useMemo(
    () => filteredPayments.filter((p) => p.status === "OVERDUE").length,
    [filteredPayments],
  );
  const pendingConfirmationCount = useMemo(
    () => filteredPayments.filter((p) => p.status === "PENDING_CONFIRMATION").length,
    [filteredPayments],
  );
  const totalDue = useMemo(
    () =>
      filteredPayments
        .filter((p) => p.status !== "PENDING_CONFIRMATION")
        .reduce((sum, p) => sum + p.amount, 0),
    [filteredPayments],
  );
  const currency = filteredPayments[0]?.currency ?? "RWF";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Deposits
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Check what is due, filter by group, and pay contributions or overdue amounts
            without leaving this page.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
            Group
          </p>
          <Select value={selectedGroupId} onValueChange={setChosenGroupId}>
            <SelectTrigger className="border-border bg-bg">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="mt-2 w-full"
            disabled={!selectedGroupId}
            onClick={() => setPayGroupId(selectedGroupId)}
          >
            Deposit now
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<Wallet className="size-4" />}
          label="Total due"
          value={formatCurrency(totalDue, currency)}
          tone={overdueCount > 0 ? "danger" : "default"}
          helper={`${filteredPayments.length} payment item${filteredPayments.length === 1 ? "" : "s"}`}
        />
        <SummaryCard
          icon={<TriangleAlert className="size-4" />}
          label="Overdue"
          value={String(overdueCount)}
          tone={overdueCount > 0 ? "danger" : "default"}
          helper={overdueCount > 0 ? "Pay these first" : "Nothing overdue"}
        />
        <SummaryCard
          icon={<CreditCard className="size-4" />}
          label="Pending review"
          value={String(pendingConfirmationCount)}
          helper="Manual transfers waiting for confirmation"
        />
      </div>

      <Tabs defaultValue="due">
        <TabsList className="border border-border bg-secondary">
          <TabsTrigger value="due" className="relative gap-2">
            Due payments
            {overdueCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {overdueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="due" className="pt-6">
          <UpcomingTab
            items={filteredPayments}
            isLoadingOverride={upcomingQuery.isLoading || groupsQuery.isLoading}
            isErrorOverride={upcomingQuery.isError || groupsQuery.isError}
            onPay={(payment) => setPayGroupId(payment.groupId)}
          />
        </TabsContent>

        <TabsContent value="history" className="pt-6">
          <HistoryTab selectedGroupId={selectedGroupId} />
        </TabsContent>
      </Tabs>

      {payGroupId && (
        <DepositModal
          open
          onOpenChange={(open) => {
            if (!open) setPayGroupId(null);
          }}
          groupId={payGroupId}
          groupDetailLoading={groupForPay.isLoading}
          isVerified={groupForPay.data?.isVerified === true}
          title="Pay group deposit"
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card
      className={
        tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-bg"
      }
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span
            className={
              tone === "danger"
                ? "rounded-full bg-destructive/10 p-1 text-destructive"
                : "rounded-full bg-primary/10 p-1 text-primary"
            }
          >
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <p className="mt-3 text-xl font-bold text-text">{value}</p>
        <p className="mt-1 text-xs text-text-muted">{helper}</p>
      </CardContent>
    </Card>
  );
}
