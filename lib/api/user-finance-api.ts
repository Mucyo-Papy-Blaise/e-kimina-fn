import { apiClient } from "@/lib/api/api-client";
import { ApiError } from "@/lib/query/query-client";
import {
  userFinanceHistorySchema,
  userFinanceSummarySchema,
  userFinanceUpcomingSchema,
} from "@/types/user-finance-schema";
import type { JsonValue } from "@/types/json";
import type {
  PaymentStatus,
  TransactionRecord,
  TransactionType,
  UpcomingPayment,
  UserFinanceHistoryResponse,
  UserFinanceSummaryResponse,
  UserFinanceUpcomingResponse,
} from "@/types/transactions";

const emptySummary: UserFinanceSummaryResponse = {
  groupBalances: [],
  penaltyBalances: [],
};

const emptyUpcoming: UserFinanceUpcomingResponse = { items: [] };

const emptyHistory: UserFinanceHistoryResponse = {
  items: [],
  totalItems: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
};

export async function fetchUserFinanceSummary(): Promise<UserFinanceSummaryResponse> {
  const raw = (await apiClient.get("/users/me/finance/summary")) as JsonValue;
  if (raw === undefined || raw === null) {
    return emptySummary;
  }
  const parsed = userFinanceSummarySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid finance summary from server", raw);
  }
  return parsed.data;
}

export async function fetchUserFinanceHistory(
  page: number,
  pageSize: number,
): Promise<UserFinanceHistoryResponse> {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("pageSize", String(pageSize));
  const raw = (await apiClient.get(
    `/users/me/finance/history?${sp.toString()}`,
  )) as JsonValue;
  if (raw === undefined || raw === null) {
    return emptyHistory;
  }
  const parsed = userFinanceHistorySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid finance history from server", raw);
  }
  return {
    totalItems: parsed.data.totalItems,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    totalPages: parsed.data.totalPages,
    items: parsed.data.items.map(mapHistoryItem),
  };
}

export async function fetchUserFinanceUpcoming(): Promise<UserFinanceUpcomingResponse> {
  const raw = (await apiClient.get("/users/me/finance/upcoming")) as JsonValue;
  if (raw === undefined || raw === null) {
    return emptyUpcoming;
  }
  const parsed = userFinanceUpcomingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid upcoming payments from server", raw);
  }
  return {
    items: parsed.data.items.map(mapUpcomingItem),
  };
}

const TX_TYPES: TransactionType[] = [
  "CONTRIBUTION",
  "LOAN_REPAYMENT",
  "PENALTY",
  "DEPOSIT",
];

function isTransactionType(t: string): t is TransactionType {
  return (TX_TYPES as string[]).includes(t);
}

function isPaymentStatus(s: string): s is PaymentStatus {
  return (
    s === "PENDING" ||
    s === "OVERDUE" ||
    s === "PENDING_CONFIRMATION" ||
    s === "FAILED" ||
    s === "COMPLETED" ||
    s === "CANCELLED" ||
    s === "REFUNDED" ||
    s === "UNPAID"
  );
}

function mapHistoryItem(raw: {
  id: string;
  groupId: string;
  groupName: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  isCredit: boolean;
  status?: string | null;
}): TransactionRecord {
  return {
    id: raw.id,
    groupId: raw.groupId,
    groupName: raw.groupName,
    type: isTransactionType(raw.type) ? raw.type : "CONTRIBUTION",
    amount: raw.amount,
    currency: raw.currency,
    date: raw.date,
    description: raw.description,
    isCredit: raw.isCredit,
    status:
      raw.status && raw.status.length > 0
        ? (isPaymentStatus(raw.status) ? raw.status : "COMPLETED")
        : "COMPLETED",
  };
}

function mapUpcomingItem(raw: {
  id: string;
  groupId: string;
  groupName: string;
  type: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  status: string;
}): UpcomingPayment {
  return {
    id: raw.id,
    groupId: raw.groupId,
    groupName: raw.groupName,
    type: isTransactionType(raw.type) ? raw.type : "CONTRIBUTION",
    amount: raw.amount,
    currency: raw.currency,
    dueDate: raw.dueDate,
    description: raw.description,
    status: isPaymentStatus(raw.status) ? raw.status : "PENDING",
  };
}
