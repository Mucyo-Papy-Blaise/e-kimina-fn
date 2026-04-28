"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationUnreadCountQuery,
  useUserNotificationsQuery,
} from "@/lib/query/notifications-queries";
import { cn } from "@/utils/cn";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useNotificationUnreadCountQuery({});
  const unread = unreadData ?? 0;

  const listQ = useUserNotificationsQuery(
    {},
    { enabled: open, limit: 30 },
  );

  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative shrink-0 text-text-muted hover:bg-primary-soft hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] border-border bg-bg p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="border-b border-border px-3 py-2.5 text-text">
          <div className="flex items-center justify-between gap-2">
            <span>Notifications</span>
            {unread > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate({})}
              >
                {markAll.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  "Mark all read"
                )}
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <div className="max-h-80 overflow-y-auto">
          {listQ.isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-text-muted">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          )}
          {listQ.isError && (
            <p className="px-3 py-4 text-sm text-destructive">
              {listQ.error?.message ?? "Could not load notifications."}
            </p>
          )}
          {listQ.isSuccess && listQ.data.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-text-muted">No notifications yet.</p>
          )}
          {listQ.isSuccess &&
            listQ.data.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-border px-3 py-2.5 last:border-0",
                  !n.readAt && "bg-primary/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">{n.title}</p>
                    <p className="text-xs text-text-muted line-clamp-4">{n.body}</p>
                    <p className="mt-1.5 text-[10px] text-text-muted/90">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.readAt && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      title="Mark read"
                      disabled={markOne.isPending}
                      onClick={() => markOne.mutate(n.id)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
