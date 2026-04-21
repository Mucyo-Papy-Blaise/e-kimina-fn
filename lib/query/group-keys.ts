import type { GroupsListView } from "@/lib/api/groups-api";

export const groupKeys = {
  all: ["groups"] as const,
  list: (view: GroupsListView) => [...groupKeys.all, "list", view] as const,
  detail: (groupId: string) => [...groupKeys.all, "detail", groupId] as const,
  members: (groupId: string) => [...groupKeys.all, "members", groupId] as const,
  removalNotifications: () => [...groupKeys.all, "removal-notifications"] as const,
  /** @deprecated use list("discover") */
  publicList: () => [...groupKeys.all, "public"] as const,
};
