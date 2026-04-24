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
import { fetchContributionConfig, putContributionConfig } from "@/lib/api/contribution-config-api";
import {
  fetchDepositPreview,
  fetchLoanRepaymentPreview,
  fetchLoanRequestPreview,
  fetchMyPendingManualDeposits,
  fetchPendingManualDeposits,
  postConfirmManualDeposit,
  postDeposit,
  postLoanApplication,
  postRejectManualDeposit,
} from "@/lib/api/group-finance-api";
import { fetchLoanConfig, putLoanConfig } from "@/lib/api/loan-config-api";
import { authKeys } from "@/lib/auth/auth-keys";
import { groupKeys } from "@/lib/query/group-keys";
import { userFinanceKeys } from "@/lib/query/user-finance-keys";
import { ApiError } from "@/lib/query/query-client";
import type { Group } from "@/types/group";
import type { UpsertContributionConfigRequest } from "@/types/contribution";
import type { CreateDepositBody } from "@/types/group-finance";
import type { UpsertLoanConfigRequest } from "@/types/loan-config";

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

export function useLoanConfigQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.loanConfig(groupId),
    queryFn: () => fetchLoanConfig(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useUpsertLoanConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      body,
    }: {
      groupId: string;
      body: UpsertLoanConfigRequest;
    }) => putLoanConfig(groupId, body),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: groupKeys.loanConfig(v.groupId) });
    },
  });
}

export function useContributionConfigQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.contributionConfig(groupId),
    queryFn: () => fetchContributionConfig(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useUpsertContributionConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      body,
    }: {
      groupId: string;
      body: UpsertContributionConfigRequest;
    }) => putContributionConfig(groupId, body),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.contributionConfig(v.groupId),
      });
    },
  });
}

export function useDepositPreviewQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financeDepositPreview(groupId),
    queryFn: () => fetchDepositPreview(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useLoanRepaymentPreviewQuery(
  groupId: string,
  memberLoanId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: groupKeys.financeLoanRepaymentPreview(
      groupId,
      memberLoanId ?? "__none__",
    ),
    queryFn: () => fetchLoanRepaymentPreview(groupId, memberLoanId!),
    enabled: Boolean(groupId && memberLoanId) && enabled,
  });
}

export function useLoanRequestPreviewQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financeLoanPreview(groupId),
    queryFn: () => fetchLoanRequestPreview(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useCreateDepositMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      body,
    }: {
      groupId: string;
      body: CreateDepositBody;
    }) => postDeposit(groupId, body),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financeDepositPreview(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financePendingDeposits(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financeMyPendingManual(v.groupId),
      });
      if (v.body.memberLoanId) {
        await qc.invalidateQueries({
          queryKey: groupKeys.financeLoanRepaymentPreview(
            v.groupId,
            v.body.memberLoanId,
          ),
        });
      }
      await qc.invalidateQueries({ queryKey: userFinanceKeys.all });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.userLoans() });
      await qc.invalidateQueries({
        queryKey: groupKeys.all,
      });
    },
  });
}

export function useMyPendingManualDepositsQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financeMyPendingManual(groupId),
    queryFn: () => fetchMyPendingManualDeposits(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function usePendingManualDepositsQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financePendingDeposits(groupId),
    queryFn: () => fetchPendingManualDeposits(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useConfirmManualDepositMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, depositId }: { groupId: string; depositId: string }) =>
      postConfirmManualDeposit(groupId, depositId),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financePendingDeposits(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financeMyPendingManual(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financeDepositPreview(v.groupId),
      });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.all });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.userLoans() });
    },
  });
}

export function useRejectManualDepositMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      depositId,
      reason,
    }: {
      groupId: string;
      depositId: string;
      reason?: string;
    }) => postRejectManualDeposit(groupId, depositId, { reason }),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financePendingDeposits(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financeMyPendingManual(v.groupId),
      });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.all });
    },
  });
}

export function useCreateLoanApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      requestedAmount,
    }: {
      groupId: string;
      requestedAmount: number;
    }) => postLoanApplication(groupId, requestedAmount),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financeLoanPreview(v.groupId),
      });
    },
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
