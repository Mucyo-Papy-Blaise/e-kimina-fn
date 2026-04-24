"use client";

import { Users, FileText, TrendingUp, Landmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { TransactionRecord } from "@/types/transactions";
import { formatCurrency, formatDate, formatTime, txTypeLabel } from "@/lib/transactions-utils";
import { cn } from "@/utils/cn";

type Props = {
  transaction: TransactionRecord | null;
};

export function TransactionDetailPanel({ transaction: tx }: Props) {
  if (!tx) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Select a transaction to view details
      </div>
    );
  }

  const topIcon =
    tx.type === "DEPOSIT" ? (
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-4 ring-emerald-500/5 dark:text-emerald-500">
        <Landmark className="size-6" />
      </div>
    ) : (
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/5">
        <Users className="size-6" />
      </div>
    );

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Icon + name */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        {topIcon}
        <div>
          <p className="font-semibold text-text">{tx.groupName}</p>
          <p className="text-xs text-text-muted">{txTypeLabel(tx.type)}</p>
        </div>
      </div>

      {/* Big amount */}
      <div className="text-center">
        <p
          className={cn(
            "text-3xl font-bold tracking-tight",
            tx.type === "PENALTY" ? "text-destructive" : "text-text",
          )}
        >
          {tx.isCredit ? "+" : "−"} {formatCurrency(tx.amount, tx.currency)}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {formatDate(tx.date)} at {formatTime(tx.date)}
        </p>
      </div>

      <Separator className="bg-border" />

      {/* Meta */}
      <div className="space-y-4">
        <DetailRow
          icon={<FileText className="size-4" />}
          label="Description"
          value={tx.description}
        />
        <DetailRow
          icon={<Users className="size-4" />}
          label="Group"
          value={tx.groupName}
        />
        <DetailRow
          icon={<TrendingUp className="size-4" />}
          label="Type"
          value={txTypeLabel(tx.type)}
        />
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-text-muted">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );
}
