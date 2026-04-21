"use client";

import { X } from "lucide-react";
import {
  useMarkRemovalNotificationReadMutation,
  useRemovalNotificationsQuery,
} from "@/lib/query/groups-queries";
import { cn } from "@/utils/cn";

export function GroupRemovalBanners() {
  const { data, isLoading } = useRemovalNotificationsQuery();
  const markRead = useMarkRemovalNotificationReadMutation();

  if (isLoading || !data?.length) return null;

  const unread = data.filter((n) => n.readAt === null);
  if (!unread.length) return null;

  return (
    <div className="mb-4 space-y-2">
      {unread.map((n) => (
        <div
          key={n.id}
          className={cn(
            "flex gap-3 rounded-[var(--radius)] border border-border bg-secondary px-4 py-3 text-sm text-text shadow-[var(--shadow-md)]",
            n.kind === "REMOVED"
              ? "border-destructive/40 bg-destructive/10"
              : "border-primary/30 bg-primary/5",
          )}
          role="status"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text">
              {n.kind === "REMOVED" ? "Removed from group" : "Suspended in group"}: {n.groupName}
            </p>
            <p className="mt-1 text-text-muted">{n.reason}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-text-muted transition hover:bg-bg hover:text-text"
            aria-label="Dismiss"
            onClick={() => markRead.mutate(n.id)}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
