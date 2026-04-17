"use client";

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createGroup,
  fetchGroupsByView,
  fetchPublicGroups,
  type GroupsListView,
  joinGroup,
} from "@/lib/api/groups-api";
import { authKeys } from "@/lib/auth/auth-keys";
import { groupKeys } from "@/lib/query/group-keys";
import { ApiError } from "@/lib/query/query-client";
import type { Group } from "@/types/group";

export function useGroupsQuery(
  view: GroupsListView,
  options?: Omit<UseQueryOptions<Group[], ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: groupKeys.list(view),
    queryFn: () => fetchGroupsByView(view),
    ...options,
  });
}

/** @deprecated Prefer `useGroupsQuery("discover")` */
export function usePublicGroupsQuery(
  options?: Omit<UseQueryOptions<Group[], ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: groupKeys.publicList(),
    queryFn: () => fetchPublicGroups(),
    ...options,
  });
}

export function useCreateGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function useJoinGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}
