import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type { NotificationAudienceApi } from "@/types/notification-schema";
import {
  unreadCountSchema,
  userNotificationsListSchema,
  type UserNotificationItem,
} from "@/types/notification-schema";
import type { JsonValue } from "@/types/json";

type ListQuery = {
  audience?: NotificationAudienceApi;
  groupId?: string;
  unreadOnly?: boolean;
  limit?: number;
};

export async function fetchUserNotifications(
  q: ListQuery = {},
): Promise<UserNotificationItem[]> {
  const sp = new URLSearchParams();
  if (q.audience) sp.set("audience", q.audience);
  if (q.groupId) sp.set("groupId", q.groupId);
  if (q.unreadOnly) sp.set("unreadOnly", "true");
  if (q.limit != null) sp.set("limit", String(q.limit));
  const qs = sp.toString();
  const path = `/users/me/notifications${qs ? `?${qs}` : ""}`;
  const raw = (await apiClient.get(path)) as JsonValue;
  const p = userNotificationsListSchema.safeParse(raw);
  if (!p.success) {
    throw new ApiError(500, "Invalid notifications list from server", raw);
  }
  return p.data;
}

export async function fetchNotificationUnreadCount(q: {
  audience?: NotificationAudienceApi;
  groupId?: string;
} = {}): Promise<number> {
  const sp = new URLSearchParams();
  if (q.audience) sp.set("audience", q.audience);
  if (q.groupId) sp.set("groupId", q.groupId);
  const qs = sp.toString();
  const path = `/users/me/notifications/unread-count${qs ? `?${qs}` : ""}`;
  const raw = (await apiClient.get(path)) as JsonValue;
  const p = unreadCountSchema.safeParse(raw);
  if (!p.success) {
    throw new ApiError(500, "Invalid unread count from server", raw);
  }
  return p.data.count;
}

export async function patchNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(
    `/users/me/notifications/${encodeURIComponent(notificationId)}/read`,
    {},
  );
}

export async function patchNotificationsReadAll(q: {
  audience?: NotificationAudienceApi;
  groupId?: string;
} = {}): Promise<{ updated: number }> {
  const sp = new URLSearchParams();
  if (q.audience) sp.set("audience", q.audience);
  if (q.groupId) sp.set("groupId", q.groupId);
  const qs = sp.toString();
  const path = `/users/me/notifications/read-all${qs ? `?${qs}` : ""}`;
  const raw = (await apiClient.patch(path, {})) as JsonValue;
  const p = z.object({ updated: z.number() }).safeParse(raw);
  if (!p.success) {
    throw new ApiError(500, "Invalid read-all result from server", raw);
  }
  return p.data;
}
