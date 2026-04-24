import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import { userLoansResponseSchema, type UserLoansResponse } from "@/types/user-loans-schema";
import type { JsonValue } from "@/types/json";

export const loanAppRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  requestedAmount: z.number(),
  currency: z.string(),
  interestRate: z.number(),
  repaymentPeriodDays: z.number(),
  maxAmountAtRequest: z.number().nullable().optional(),
  status: z.string(),
  createdAt: z.string(),
  groupAdminApproved: z.boolean(),
  groupAdminApprovedAt: z.string().nullable().optional(),
  groupAdminApprovedByName: z.string().nullable().optional(),
  treasurerApproved: z.boolean(),
  treasurerApprovedAt: z.string().nullable().optional(),
  treasurerApprovedByName: z.string().nullable().optional(),
  waitingOn: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  rejectedAt: z.string().nullable().optional(),
  memberLoanId: z.string().nullable().optional(),
});

export const memberLoanAdminSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  principal: z.number(),
  totalRepayable: z.number(),
  amountRepaid: z.number(),
  penaltyAccrued: z.number(),
  outstanding: z.number(),
  currency: z.string(),
  interestRate: z.number(),
  repaymentPeriodDays: z.number(),
  disbursedAt: z.string(),
  dueDate: z.string(),
  status: z.string(),
  isOverdue: z.boolean(),
});

export async function fetchUserLoans(): Promise<UserLoansResponse> {
  const raw = (await apiClient.get("/users/me/loans")) as JsonValue;
  const parsed = userLoansResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid user loans response from server", raw);
  }
  return parsed.data;
}

export async function fetchGroupLoanApplications(
  groupId: string,
): Promise<z.infer<typeof loanAppRowSchema>[]> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-applications`,
  )) as JsonValue;
  const arr = z.array(loanAppRowSchema).safeParse(raw);
  if (!arr.success) {
    throw new ApiError(500, "Invalid loan applications list from server", raw);
  }
  return arr.data;
}

export async function fetchGroupMemberLoansAdmin(
  groupId: string,
): Promise<z.infer<typeof memberLoanAdminSchema>[]> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/member-loans`,
  )) as JsonValue;
  const arr = z.array(memberLoanAdminSchema).safeParse(raw);
  if (!arr.success) {
    throw new ApiError(500, "Invalid member loans list from server", raw);
  }
  return arr.data;
}

export async function postApproveLoanApplication(
  groupId: string,
  applicationId: string,
): Promise<{ applicationId: string; status: string; memberLoanId?: string | null; message: string }> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-applications/${encodeURIComponent(applicationId)}/approve`,
    {},
  )) as JsonValue;
  const parsed = z
    .object({
      applicationId: z.string(),
      status: z.string(),
      memberLoanId: z.string().nullable().optional(),
      message: z.string(),
    })
    .safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid approve loan response from server", raw);
  }
  return parsed.data;
}

export type GroupLoanApplicationRow = z.infer<typeof loanAppRowSchema>;
export type GroupMemberLoanAdminRow = z.infer<typeof memberLoanAdminSchema>;

export async function postRejectLoanApplication(
  groupId: string,
  applicationId: string,
  reason: string,
): Promise<{ applicationId: string; status: string; message: string }> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-applications/${encodeURIComponent(applicationId)}/reject`,
    { reason },
  )) as JsonValue;
  const parsed = z
    .object({
      applicationId: z.string(),
      status: z.string(),
      message: z.string(),
    })
    .safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid reject loan response from server", raw);
  }
  return parsed.data;
}
