"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotificationUnreadCount,
  fetchUserNotifications,
  patchNotificationRead,
  patchNotificationsReadAll,
} from "@/lib/api/notifications-api";
import { userFinanceKeys } from "@/lib/query/user-finance-keys";
import { ApiError } from "@/lib/query/query-client";
import type { NotificationAudienceApi } from "@/types/notification-schema";

type Filters = {
  audience?: NotificationAudienceApi;
  groupId?: string;
};

export function useUserNotificationsQuery(
  filters: Filters = {},
  options?: { enabled?: boolean; limit?: number; unreadOnly?: boolean },
) {
  return useQuery({
    queryKey: userFinanceKeys.userNotifications({
      audience: filters.audience,
      groupId: filters.groupId,
    }),
    queryFn: () =>
      fetchUserNotifications({
        audience: filters.audience,
        groupId: filters.groupId,
        limit: options?.limit ?? 40,
        unreadOnly: options?.unreadOnly,
      }),
    enabled: options?.enabled !== false,
    staleTime: 30_000,
  });
}

export function useNotificationUnreadCountQuery(
  filters: Filters = {},
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: userFinanceKeys.userNotificationUnread({
      audience: filters.audience,
      groupId: filters.groupId,
    }),
    queryFn: () => fetchNotificationUnreadCount(filters),
    enabled: options?.enabled !== false,
    staleTime: 15_000,
    refetchInterval: options?.refetchInterval ?? 60_000,
  });
}

function invalidateAllNotificationLists(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: ["user-finance", "notifications"] });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patchNotificationRead(id),
    onSuccess: () => {
      return invalidateAllNotificationLists(qc);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (q: { audience?: NotificationAudienceApi; groupId?: string } = {}) =>
      patchNotificationsReadAll(q),
    onSuccess: () => {
      return invalidateAllNotificationLists(qc);
    },
  });
}
