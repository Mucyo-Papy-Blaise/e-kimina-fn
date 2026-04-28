import { z } from "zod";

export const NOTIFICATION_AUDIENCE = {
  MEMBER: "MEMBER",
  GROUP_ADMIN: "GROUP_ADMIN",
  TREASURER: "TREASURER",
} as const;

export type NotificationAudienceApi =
  (typeof NOTIFICATION_AUDIENCE)[keyof typeof NOTIFICATION_AUDIENCE];

export const userNotificationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  groupId: z.string().nullable(),
  type: z.string(),
  audience: z.enum(["MEMBER", "GROUP_ADMIN", "TREASURER"]),
  title: z.string(),
  body: z.string(),
  metadata: z.unknown().optional().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const userNotificationsListSchema = z.array(userNotificationItemSchema);

export type UserNotificationItem = z.infer<typeof userNotificationItemSchema>;

export const unreadCountSchema = z.object({ count: z.number() });
export const markAllReadResultSchema = z.object({ updated: z.number() });
