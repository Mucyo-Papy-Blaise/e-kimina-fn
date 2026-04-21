"use client";

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createGroup,
  deleteGroup,
  fetchGroup,
  fetchGroupMembers,
  fetchGroupsByView,
  fetchPublicGroups,
  fetchRemovalNotifications,
  inviteGroupMember,
  joinGroup,
  markRemovalNotificationRead,
  reactivateGroupMember,
  removeGroupMember,
  suspendGroupMember,
  updateGroup,
  type GroupsListView,
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

export function useInviteMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      inviteGroupMember(groupId, email),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function useGroupQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => fetchGroup(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useGroupMembersQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => fetchGroupMembers(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useRemovalNotificationsQuery() {
  return useQuery({
    queryKey: groupKeys.removalNotifications(),
    queryFn: fetchRemovalNotifications,
  });
}

export function useMarkRemovalNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markRemovalNotificationRead(notificationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: groupKeys.removalNotifications() });
    },
  });
}

export function useUpdateGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      ...body
    }: {
      groupId: string;
      name?: string;
      description?: string | null;
    }) => updateGroup(groupId, body),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: groupKeys.detail(v.groupId) });
    },
  });
}

export function useDeleteGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function useRemoveGroupMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      memberUserId,
      reason,
    }: {
      groupId: string;
      memberUserId: string;
      reason: string;
    }) => removeGroupMember(groupId, memberUserId, reason),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: groupKeys.members(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.detail(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function useSuspendGroupMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      memberUserId,
      reason,
    }: {
      groupId: string;
      memberUserId: string;
      reason: string;
    }) => suspendGroupMember(groupId, memberUserId, reason),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: groupKeys.members(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.detail(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function useReactivateGroupMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      memberUserId,
    }: {
      groupId: string;
      memberUserId: string;
    }) => reactivateGroupMember(groupId, memberUserId),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: groupKeys.members(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.detail(v.groupId) });
      await qc.invalidateQueries({ queryKey: groupKeys.all });
      await qc.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}
