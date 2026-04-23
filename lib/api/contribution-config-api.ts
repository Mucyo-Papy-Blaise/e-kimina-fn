import { z } from "zod";
import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import type { ContributionConfig, UpsertContributionConfigRequest } from "@/types/contribution";
import {
  contributionConfigResponseSchema,
  upsertContributionConfigRequestSchema,
} from "@/types/contribution-schema";
import type { JsonObject, JsonValue } from "@/types/json";

const contributionConfigGetSchema = z.union([
  contributionConfigResponseSchema,
  z.null(),
]);

export async function fetchContributionConfig(
  groupId: string,
): Promise<ContributionConfig | null> {
  const raw = (await apiClient.get(
    `/groups/${encodeURIComponent(groupId)}/contribution-config`,
  )) as JsonValue;
  if (raw === null || raw === undefined) {
    return null;
  }
  const parsed = contributionConfigGetSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid contribution config from server", raw);
  }
  return parsed.data;
}

export async function putContributionConfig(
  groupId: string,
  body: UpsertContributionConfigRequest,
): Promise<ContributionConfig> {
  const valid = upsertContributionConfigRequestSchema.parse(body);
  const raw = (await apiClient.put(
    `/groups/${encodeURIComponent(groupId)}/contribution-config`,
    valid as unknown as JsonObject,
  )) as JsonValue;
  const parsed = contributionConfigResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid contribution config from server", raw);
  }
  return parsed.data;
}
