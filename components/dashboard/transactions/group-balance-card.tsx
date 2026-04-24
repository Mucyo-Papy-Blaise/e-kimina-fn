"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/transactions-utils";
import type { GroupBalance } from "@/types/transactions";

type GroupBalanceCardProps = {
  balance: GroupBalance;
};

export function GroupBalanceCard({ balance }: GroupBalanceCardProps) {
  return (
    <Card className="border-border bg-bg">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">
              {balance.groupName}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Member since {formatDate(balance.memberSince)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-text">
            {formatCurrency(balance.totalContributed, balance.currency)}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">Total contributed</p>
        </div>
      </CardContent>
    </Card>
  );
}
