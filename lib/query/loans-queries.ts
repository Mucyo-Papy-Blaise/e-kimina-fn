"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGroupLoanApplications,
  fetchGroupMemberLoansAdmin,
  fetchUserLoans,
  postApproveLoanApplication,
  postRejectLoanApplication,
} from "@/lib/api/loans-api";
import { groupKeys } from "@/lib/query/group-keys";
import { userFinanceKeys } from "@/lib/query/user-finance-keys";
import { ApiError } from "@/lib/query/query-client";
import type { UserLoansResponse } from "@/types/user-loans-schema";

export function useUserLoansQuery(enabled = true) {
  return useQuery<UserLoansResponse, ApiError>({
    queryKey: userFinanceKeys.userLoans(),
    queryFn: () => fetchUserLoans(),
    enabled,
  });
}

export function useGroupLoanApplicationsQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financeGroupLoanApplications(groupId),
    queryFn: () => fetchGroupLoanApplications(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useGroupMemberLoansAdminQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.financeGroupMemberLoans(groupId),
    queryFn: () => fetchGroupMemberLoansAdmin(groupId),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useApproveLoanApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      applicationId,
    }: {
      groupId: string;
      applicationId: string;
    }) => postApproveLoanApplication(groupId, applicationId),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financeGroupLoanApplications(v.groupId),
      });
      await qc.invalidateQueries({
        queryKey: groupKeys.financeGroupMemberLoans(v.groupId),
      });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.userLoans() });
      await qc.invalidateQueries({ queryKey: ["user-finance", "notifications"] });
    },
  });
}

export function useRejectLoanApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      applicationId,
      reason,
    }: {
      groupId: string;
      applicationId: string;
      reason: string;
    }) => postRejectLoanApplication(groupId, applicationId, reason),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({
        queryKey: groupKeys.financeGroupLoanApplications(v.groupId),
      });
      await qc.invalidateQueries({ queryKey: userFinanceKeys.userLoans() });
      await qc.invalidateQueries({ queryKey: ["user-finance", "notifications"] });
    },
  });
}
