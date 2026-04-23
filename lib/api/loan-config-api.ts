import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type { LoanConfig, UpsertLoanConfigRequest } from "@/types/loan-config";
import {
  loanConfigResponseSchema,
  upsertLoanConfigRequestSchema,
} from "@/types/loan-config-schema";
import type { JsonObject, JsonValue } from "@/types/json";

const loanConfigGetSchema = z.union([loanConfigResponseSchema, z.null()]);

export async function fetchLoanConfig(groupId: string): Promise<LoanConfig | null> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/loan-config`,
  )) as JsonValue;
  if (raw === null || raw === undefined) {
    return null;
  }
  const parsed = loanConfigGetSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid loan config from server", raw);
  }
  return parsed.data;
}

export async function putLoanConfig(
  groupId: string,
  body: UpsertLoanConfigRequest,
): Promise<LoanConfig> {
  const valid = upsertLoanConfigRequestSchema.parse(body);
  const raw = (await apiClient.put(
    `/groups/${encodeURIComponent(groupId)}/loan-config`,
    valid as unknown as JsonObject,
  )) as JsonValue;
  const parsed = loanConfigResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid loan config from server", raw);
  }
  return parsed.data;
}
