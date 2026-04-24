"use client";

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  fetchUserFinanceHistory,
  fetchUserFinanceSummary,
  fetchUserFinanceUpcoming,
} from "@/lib/api/user-finance-api";
import { userFinanceKeys } from "@/lib/query/user-finance-keys";
import { ApiError } from "@/lib/query/query-client";
import type {
  UserFinanceHistoryResponse,
  UserFinanceSummaryResponse,
  UserFinanceUpcomingResponse,
} from "@/types/transactions";

const PAGE_SIZE = 20;

export { PAGE_SIZE as userFinanceHistoryPageSize };

export function useUserFinanceSummaryQuery(
  options?: Omit<
    UseQueryOptions<UserFinanceSummaryResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: userFinanceKeys.summary(),
    queryFn: () => fetchUserFinanceSummary(),
    ...options,
  });
}

export function useUserFinanceHistoryQuery(
  page: number,
  pageSize: number = PAGE_SIZE,
  options?: Omit<
    UseQueryOptions<UserFinanceHistoryResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  const p = Math.max(1, page);
  return useQuery({
    queryKey: userFinanceKeys.history(p, pageSize),
    queryFn: () => fetchUserFinanceHistory(p, pageSize),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useUserFinanceUpcomingQuery(
  options?: Omit<
    UseQueryOptions<UserFinanceUpcomingResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: userFinanceKeys.upcoming(),
    queryFn: () => fetchUserFinanceUpcoming(),
    ...options,
  });
}
