"use client";

import { ArrowDownLeft, ArrowUpRight, AlertTriangle, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  txTypeLabel,
} from "@/lib/transactions-utils";

import type { TransactionRecord } from "@/types/transactions";
import { cn } from "@/utils/cn";

type TransactionRowProps = {
  transaction: TransactionRecord;
  onSelect?: (tx: TransactionRecord) => void;
};
function TxIcon({ type }: { type: TransactionRecord["type"] }) {
  if (type === "CONTRIBUTION") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ArrowUpRight className="size-4" />
      </div>
    );
  }
  if (type === "LOAN_REPAYMENT") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <ArrowDownLeft className="size-4" />
      </div>
    );
  }
  if (type === "DEPOSIT") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
        <Landmark className="size-4" />
      </div>
    );
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <AlertTriangle className="size-4" />
    </div>
  );
}

export function TransactionRow({ transaction: tx, onSelect }: TransactionRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(tx)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(tx);
        }
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md py-3 outline-none",
        "hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring/30",
      )}
    >
      <TxIcon type={tx.type} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">
          {tx.description}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {tx.groupName} · {formatDate(tx.date)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            tx.type === "PENALTY" ? "text-destructive" : "text-text",
          )}
        >
          {tx.type === "PENALTY" ? "−" : "+"}
          {formatCurrency(tx.amount, tx.currency)}
        </p>
        <Badge
          variant={
            tx.status === "COMPLETED"
              ? "success"
              : tx.status === "FAILED"
                ? "destructive"
                : "secondary"
          }
          className="text-xs"
        >
          {txTypeLabel(tx.type)}
        </Badge>
      </div>
    </div>
  );
}
