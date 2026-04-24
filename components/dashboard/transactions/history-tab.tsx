"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "./transaction-row";
import { TransactionDetailPanel } from "./transaction-detail-panel";
import type { TransactionRecord } from "@/types/transactions";
import { formatCurrency, groupByDate } from "@/lib/transactions-utils";
import { cn } from "@/utils/cn";
import {
  useUserFinanceHistoryQuery,
  useUserFinanceSummaryQuery,
  userFinanceHistoryPageSize,
} from "@/lib/query/user-finance-queries";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export function HistoryTab() {
  const [page, setPage] = useState(1);
  const pageSize = userFinanceHistoryPageSize;

  const { data: summary, isLoading: summaryLoading, isError: summaryError } =
    useUserFinanceSummaryQuery();
  const { data: history, isLoading: historyLoading, isError: historyError } =
    useUserFinanceHistoryQuery(page, pageSize);

  const groupBalances = summary?.groupBalances ?? [];
  const penaltyBalances = summary?.penaltyBalances ?? [];
  const transactions = history?.items ?? [];
  const totalPages = history?.totalPages ?? 0;

  const [selected, setSelected] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    if (transactions.length === 0) {
      setSelected(null);
      return;
    }
    setSelected((prev) => {
      if (prev && transactions.some((t) => t.id === prev.id)) {
        return prev;
      }
      return transactions[0] ?? null;
    });
  }, [transactions]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const currency = groupBalances[0]?.currency ?? "RWF";
  const totalContributed = groupBalances.reduce(
    (s, b) => s + b.totalContributed,
    0,
  );
  const totalFines = penaltyBalances.reduce((s, p) => s + p.amount, 0);

  const grouped = groupByDate(transactions);
  const loading = summaryLoading || historyLoading;
  const error = summaryError || historyError;

  return (
    <div className="flex gap-4 lg:gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-border bg-bg">
                  <CardContent className="p-4">
                    <p className="h-3 w-20 animate-pulse rounded bg-border" />
                    <p className="mt-2 h-6 w-24 animate-pulse rounded bg-border" />
                  </CardContent>
                </Card>
              ))
            : groupBalances.map((b) => (
                <Card key={b.groupId} className="border-border bg-bg">
                  <CardContent className="p-4">
                    <p className="truncate text-xs text-text-muted">
                      {b.groupName}
                    </p>
                    <p className="mt-1 text-lg font-bold text-text">
                      {formatCurrency(b.totalContributed, b.currency)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">Contributed</p>
                  </CardContent>
                </Card>
              ))}

          <Card className="border-border bg-bg">
            <CardContent className="p-4">
              <p className="text-xs text-text-muted">Total</p>
              <p className="mt-1 text-lg font-bold text-text">
                {summaryLoading ? (
                  <span className="inline-block h-6 w-24 animate-pulse rounded bg-border" />
                ) : (
                  formatCurrency(totalContributed, currency)
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">All groups</p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-bg",
              totalFines > 0
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-bg",
            )}
          >
            <CardContent className="p-4">
              <p className="text-xs text-text-muted">Fines</p>
              <p
                className={cn(
                  "mt-1 text-lg font-bold",
                  totalFines > 0 ? "text-destructive" : "text-text",
                )}
              >
                {summaryLoading ? (
                  <span className="inline-block h-6 w-24 animate-pulse rounded bg-border" />
                ) : (
                  formatCurrency(totalFines, currency)
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">Outstanding</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Could not load transactions. Please try again.
          </p>
        )}

        <div className="space-y-5">
          {loading && !transactions.length ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
              <Loader2 className="size-4 animate-spin" />
              Loading history…
            </div>
          ) : null}

          {grouped.map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <p className="mb-2 px-3 text-xs font-semibold text-text-muted">
                {dateLabel}
              </p>
              <div className="space-y-0.5">
                {txs.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </div>
          ))}

          {transactions.length === 0 && !loading && !error && (
            <p className="py-12 text-center text-sm text-text-muted">
              No transactions yet.
            </p>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-xs text-text-muted">
                Page {page}
                {totalPages > 0 ? ` of ${totalPages}` : ""} · {history?.totalItems ?? 0} entries
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || historyLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= totalPages || totalPages === 0 || historyLoading
                  }
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="hidden w-72 shrink-0 xl:block">
        <div className="sticky top-6 rounded-(--radius) border border-border bg-bg">
          <TransactionDetailPanel transaction={selected} />
        </div>
      </aside>
    </div>
  );
}
