import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type { Group } from "@/types/group";
import type { JsonValue } from "@/types/json";

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

function parseGroup(data: JsonValue | undefined): Group {
  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid group response from server", data);
  }
  return parsed.data;
}

function parseGroupList(data: JsonValue | undefined): Group[] {
  const parsed = z.array(groupSchema).safeParse(data);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid groups list from server", data);
  }
  return parsed.data;
}

export type GroupsListView = "mine" | "discover";

/** `mine` — groups you created. `discover` — others’ public groups (join flow). */
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
    maxMembers: body.maxMembers,
    ...(body.treasurerEmail?.trim()
      ? { treasurerEmail: body.treasurerEmail.trim().toLowerCase() }
      : {}),
  });
  return parseGroup(raw);
}

export async function joinGroup(groupId: string): Promise<void> {
  await apiClient.post(`/groups/${encodeURIComponent(groupId)}/join`);
}
