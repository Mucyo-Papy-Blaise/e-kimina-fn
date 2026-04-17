import type { GroupsListView } from "@/lib/api/groups-api";

export const groupKeys = {
  all: ["groups"] as const,
  list: (view: GroupsListView) => [...groupKeys.all, "list", view] as const,
  /** @deprecated use list("discover") */
  publicList: () => [...groupKeys.all, "public"] as const,
};
