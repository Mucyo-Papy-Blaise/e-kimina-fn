import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type {
  Group,
  GroupDetail,
  GroupMemberRow,
  GroupRemovalNotification,
} from "@/types/group";
import type { JsonValue } from "@/types/json";

const roleNameSchema = z.enum([
  "USER",
  "SUPER_ADMIN",
  "GROUP_ADMIN",
  "TREASURER",
  "MEMBER",
]);

const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdById: z.string(),
  isPublic: z.boolean(),
  isVerified: z.boolean(),
  maxMembers: z.number(),
  createdAt: z.string(),
  memberCount: z.number().optional(),
});

const groupDetailSchema = groupSchema.extend({
  memberCount: z.number(),
  myRole: roleNameSchema,
  isGroupAdmin: z.boolean(),
});

const groupMemberRowSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  email: z.string(),
  role: roleNameSchema,
  membershipStatus: z.enum(["ACTIVE", "SUSPENDED"]),
  joinedAt: z.string(),
});

const removalNotificationSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  kind: z.enum(["REMOVED", "SUSPENDED"]),
  reason: z.string(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

function parseGroup(data: JsonValue | undefined): Group {
  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid group response from server", data);
  }
  return parsed.data;
}

/** Backend should return `Group[]`; accept a single object for robustness (misrouted/proxy). */
function normalizeListPayload(data: JsonValue | undefined): unknown {
  if (data === undefined || data === null) return data;
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && !Array.isArray(data)) return [data];
  return data;
}

function parseGroupList(data: JsonValue | undefined): Group[] {
  const normalized = normalizeListPayload(data);
  const parsed = z.array(groupSchema).safeParse(normalized);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid groups list from server", data);
  }
  return parsed.data;
}

export type GroupsListView = "mine" | "discover";

/** `mine` — groups you belong to (active membership). `discover` — others’ public groups (join flow). */
export async function fetchGroupsByView(view: GroupsListView): Promise<Group[]> {
  const raw = await apiClient.get(
    `/groups?${new URLSearchParams({ view }).toString()}`,
  );
  return parseGroupList(raw);
}

/** Legacy: all public groups (includes yours). Prefer `fetchGroupsByView`. */
export async function fetchPublicGroups(): Promise<Group[]> {
  const raw = await apiClient.get("/groups?publicOnly=true");
  return parseGroupList(raw);
}

export async function createGroup(body: {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers: number;
  treasurerEmail?: string;
}): Promise<Group> {
  const raw = await apiClient.post("/groups", {
    name: body.name,
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
    minMembers: body.maxMembers,
    ...(body.treasurerEmail?.trim()
      ? { treasurerEmail: body.treasurerEmail.trim().toLowerCase() }
      : {}),
  });
  return parseGroup(raw);
}

export async function joinGroup(groupId: string): Promise<void> {
  await apiClient.post(`/groups/${encodeURIComponent(groupId)}/join`);
}

export async function inviteGroupMember(
  groupId: string,
  email: string,
): Promise<{ message: string }> {
  const raw = await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/invite-member`,
    { email: email.trim().toLowerCase() },
  );
  const parsed = z.object({ message: z.string() }).safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid invite response from server", raw);
  }
  return parsed.data;
}

export async function fetchGroup(groupId: string): Promise<GroupDetail> {
  const raw = await apiClient.get(`/groups/${encodeURIComponent(groupId)}`);
  const parsed = groupDetailSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid group detail from server", raw);
  }
  return parsed.data;
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMemberRow[]> {
  const raw = await apiClient.get(`/groups/${encodeURIComponent(groupId)}/members`);
  const parsed = z.array(groupMemberRowSchema).safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid group members from server", raw);
  }
  return parsed.data;
}

export async function updateGroup(
  groupId: string,
  body: { name?: string; description?: string | null },
): Promise<Group> {
  const raw = await apiClient.patch(`/groups/${encodeURIComponent(groupId)}`, {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
  });
  return parseGroup(raw);
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${encodeURIComponent(groupId)}`);
}

export async function removeGroupMember(
  groupId: string,
  memberUserId: string,
  reason: string,
): Promise<void> {
  await apiClient.delete(
    `/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberUserId)}`,
    { reason },
  );
}

export async function suspendGroupMember(
  groupId: string,
  memberUserId: string,
  reason: string,
): Promise<void> {
  await apiClient.patch(
    `/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberUserId)}/suspend`,
    { reason },
  );
}

export async function reactivateGroupMember(
  groupId: string,
  memberUserId: string,
): Promise<void> {
  await apiClient.patch(
    `/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberUserId)}/reactivate`,
    {},
  );
}

export async function fetchRemovalNotifications(): Promise<GroupRemovalNotification[]> {
  const raw = await apiClient.get("/groups/removal-notifications");
  const parsed = z.array(removalNotificationSchema).safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid removal notifications from server", raw);
  }
  return parsed.data;
}

export async function markRemovalNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(
    `/groups/removal-notifications/${encodeURIComponent(notificationId)}/read`,
    {},
  );
}
