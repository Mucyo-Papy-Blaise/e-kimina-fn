"use client";

import { Clock, Loader2 } from "lucide-react";
import { useMyPendingManualDepositsQuery } from "@/lib/query/groups-queries";
import { cn } from "@/utils/cn";

type MyManualDepositPendingNoticeProps = {
  groupId: string;
  /** When true, the user is a group admin and sees the full review list instead — skip this notice. */
  isGroupAdmin: boolean;
  isVerified: boolean;
};

function fmt(n: number, c: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c.length === 3 ? c : "RWF",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${c}`;
  }
}

/**
 * Shown to members (not group admins) when they have a manual bank transfer
 * still awaiting group admin approval — no action buttons.
 */
export function MyManualDepositPendingNotice({
  groupId,
  isGroupAdmin,
  isVerified,
}: MyManualDepositPendingNoticeProps) {
  const enabled = Boolean(groupId) && isVerified && !isGroupAdmin;
  const q = useMyPendingManualDepositsQuery(groupId, enabled);

  if (!enabled) return null;
  if (q.isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-(--radius) border border-border bg-secondary/40 px-4 py-3 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin" />
        Checking your payments…
      </div>
    );
  }
  if (q.isError) return null;

  const items = q.data ?? [];
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-(--radius) border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-text",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Clock className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
        <div>
          <p className="font-medium">Manual payment pending confirmation</p>
          <p className="mt-1 text-text-muted">
            A group admin must confirm your bank transfer before your balance is updated. You can still
            use the app — no action is required from you here.
          </p>
          <ul className="mt-2 space-y-1.5 text-text">
            {items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-text-muted">
                  Submitted {new Date(d.createdAt).toLocaleString()}
                </span>
                <span className="font-medium tabular-nums">
                  {fmt(d.amount, d.currency)} —{" "}
                  {d.status === "PENDING_VERIFICATION" ? "Awaiting review" : d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
