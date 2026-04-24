"use client";

import { UpcomingRow } from "./upcoming-row";
import { formatCurrency } from "@/lib/transactions-utils";
import { cn } from "@/utils/cn";
import { useUserFinanceUpcomingQuery } from "@/lib/query/user-finance-queries";
import { Loader2 } from "lucide-react";
import type { UpcomingPayment } from "@/types/transactions";

function partitionPayments(payments: UpcomingPayment[]) {
  const pendingConfirmation: UpcomingPayment[] = [];
  const overdue: UpcomingPayment[] = [];
  const upcoming: UpcomingPayment[] = [];
  for (const p of payments) {
    if (p.status === "PENDING_CONFIRMATION") {
      pendingConfirmation.push(p);
    } else if (p.status === "OVERDUE") {
      overdue.push(p);
    } else {
      upcoming.push(p);
    }
  }
  return { pendingConfirmation, overdue, upcoming };
}

export function UpcomingTab() {
  const { data, isLoading, isError } = useUserFinanceUpcomingQuery();
  const payments = data?.items ?? [];

  const { pendingConfirmation, overdue, upcoming } = partitionPayments(payments);
  const currency = payments[0]?.currency ?? "RWF";
  const totalDue = payments.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin" />
        Loading upcoming payments…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Could not load upcoming payments. Please try again.
      </p>
    );
  }

  return (
    <div className="flex gap-4 lg:gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        {pendingConfirmation.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Pending confirmation · {pendingConfirmation.length}
            </p>
            <p className="px-1 text-xs text-text-muted">
              You submitted a manual bank transfer; the group will confirm it in the dashboard.
            </p>
            <div className="space-y-2">
              {pendingConfirmation.map((p) => (
                <UpcomingRow key={p.id} payment={p} />
              ))}
            </div>
          </div>
        )}

        {overdue.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-destructive">
              Overdue · {overdue.length}
            </p>
            <div className="space-y-2">
              {overdue.map((p) => (
                <UpcomingRow key={p.id} payment={p} />
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Upcoming · {upcoming.length}
            </p>
            <div className="space-y-2">
              {upcoming.map((p) => (
                <UpcomingRow key={p.id} payment={p} />
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 && (
          <p className="py-16 text-center text-sm text-text-muted">
            You&apos;re all caught up — no upcoming payments.
          </p>
        )}
      </div>

      <aside className="hidden w-72 shrink-0 xl:block">
        <div className="sticky top-6 space-y-3 rounded-(--radius) border border-border bg-bg p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Payment summary
          </p>

          <div className="space-y-3 pt-1">
            <SummaryLine
              label="Total due"
              value={formatCurrency(totalDue, currency)}
              valueClass={overdue.length > 0 ? "text-destructive" : "text-text"}
            />
            {totalOverdue > 0 && (
              <SummaryLine
                label="Overdue"
                value={formatCurrency(totalOverdue, currency)}
                valueClass="text-destructive"
              />
            )}
            <SummaryLine label="Items" value={`${payments.length}`} />
            <SummaryLine
              label="Groups"
              value={`${new Set(payments.map((p) => p.groupId)).size}`}
            />
          </div>

          {payments.length > 0 && (
            <>
              <div className="my-3 border-t border-border" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                By group
              </p>
              <div className="mt-2 space-y-2">
                {Array.from(
                  payments.reduce((map, p) => {
                    const prev = map.get(p.groupName) ?? 0;
                    map.set(p.groupName, prev + p.amount);
                    return map;
                  }, new Map<string, number>()),
                ).map(([name, amt]) => (
                  <SummaryLine
                    key={name}
                    label={name}
                    value={formatCurrency(amt, currency)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  valueClass = "text-text",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={cn("text-sm font-semibold tabular-nums", valueClass)}>
        {value}
      </p>
    </div>
  );
}
