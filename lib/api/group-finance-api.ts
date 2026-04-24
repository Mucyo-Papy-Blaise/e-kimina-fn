import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type {
  CreateDepositBody,
  CreateDepositResult,
  CreateLoanApplicationResult,
  DepositPreviewResponse,
  LoanRequestPreviewResponse,
  MyPendingManualDeposit,
  PendingManualDeposit,
} from "@/types/group-finance";
import {
  depositPreviewResponseSchema,
  loanRequestPreviewResponseSchema,
  myPendingManualDepositsResponseSchema,
  pendingManualDepositsResponseSchema,
} from "@/types/group-finance-schema";
import type { JsonObject, JsonValue } from "@/types/json";

const createDepositResultSchema = z.object({
  id: z.string(),
  message: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
});

const confirmRejectResultSchema = z.object({
  id: z.string(),
  status: z.enum(["CONFIRMED", "REJECTED"]),
  message: z.string(),
});

const createLoanResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  requestedAmount: z.number(),
  message: z.string(),
});

export async function fetchLoanRepaymentPreview(
  groupId: string,
  memberLoanId: string,
): Promise<DepositPreviewResponse> {
  const sp = new URLSearchParams();
  sp.set("memberLoanId", memberLoanId);
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-repayment-preview?${sp.toString()}`,
  )) as JsonValue;
  const parsed = depositPreviewResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid loan repayment preview from server", raw);
  }
  return parsed.data;
}

export async function fetchDepositPreview(
  groupId: string,
): Promise<DepositPreviewResponse> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/deposit-preview`,
  )) as JsonValue;
  const parsed = depositPreviewResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid deposit preview from server", raw);
  }
  return parsed.data;
}

export async function fetchLoanRequestPreview(
  groupId: string,
): Promise<LoanRequestPreviewResponse> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-request-preview`,
  )) as JsonValue;
  const parsed = loanRequestPreviewResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid loan preview from server", raw);
  }
  return parsed.data;
}

export async function postDeposit(
  groupId: string,
  body: CreateDepositBody,
): Promise<CreateDepositResult> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/deposits`,
    body as unknown as JsonObject,
  )) as JsonValue;
  const parsed = createDepositResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid deposit response from server", raw);
  }
  return parsed.data;
}

export async function postLoanApplication(
  groupId: string,
  requestedAmount: number,
): Promise<CreateLoanApplicationResult> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/loan-applications`,
    { requestedAmount } as unknown as JsonObject,
  )) as JsonValue;
  const parsed = createLoanResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid loan application response from server", raw);
  }
  return parsed.data;
}

export async function fetchMyPendingManualDeposits(
  groupId: string,
): Promise<MyPendingManualDeposit[]> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/deposits/my-pending`,
  )) as JsonValue;
  const parsed = myPendingManualDepositsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid my-pending manual deposits from server", raw);
  }
  return parsed.data;
}

export async function fetchPendingManualDeposits(
  groupId: string,
): Promise<PendingManualDeposit[]> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/finance/deposits/pending`,
  )) as JsonValue;
  const parsed = pendingManualDepositsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid pending deposits response from server", raw);
  }
  return parsed.data;
}

export async function postConfirmManualDeposit(
  groupId: string,
  depositId: string,
): Promise<{ id: string; status: "CONFIRMED"; message: string }> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/deposits/${encodeURIComponent(depositId)}/confirm`,
    {},
  )) as JsonValue;
  const parsed = confirmRejectResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid confirm response from server", raw);
  }
  return parsed.data as { id: string; status: "CONFIRMED"; message: string };
}

export async function postRejectManualDeposit(
  groupId: string,
  depositId: string,
  body: { reason?: string },
): Promise<{ id: string; status: "REJECTED"; message: string }> {
  const raw = (await apiClient.post(
    `/groups/${encodeURIComponent(groupId)}/finance/deposits/${encodeURIComponent(depositId)}/reject`,
    (body as JsonObject) ?? {},
  )) as JsonValue;
  const parsed = confirmRejectResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid reject response from server", raw);
  }
  return parsed.data as { id: string; status: "REJECTED"; message: string };
}
