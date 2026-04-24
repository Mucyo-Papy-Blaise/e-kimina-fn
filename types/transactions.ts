export type TransactionType =
  | "CONTRIBUTION"
  | "LOAN_REPAYMENT"
  | "PENALTY"
  | "DEPOSIT";
export type PaymentStatus =
  | "PENDING"
  | "OVERDUE"
  | "PENDING_CONFIRMATION"
  | "FAILED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "UNPAID";

export type GroupBalance = {
  groupId: string;
  groupName: string;
  totalContributed: number;
  currency: string;
  memberSince: string;
};

export type PenaltyBalance = {
  id: string;
  groupId: string;
  groupName: string;
  amount: number;
  currency: string;
  reason: string;
  dueDate: string;
  status?: PaymentStatus;
};

export type TransactionRecord = {
  id: string;
  groupId: string;
  groupName: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  description: string;
  isCredit: boolean;
  status?: PaymentStatus;
};

export type UpcomingPayment = {
  id: string;
  groupId: string;
  groupName: string;
  type: TransactionType;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  status: PaymentStatus;
};

/** API: GET /users/me/finance/summary */
export type UserFinanceSummaryResponse = {
  groupBalances: GroupBalance[];
  penaltyBalances: PenaltyBalance[];
};

/** API: GET /users/me/finance/history */
export type UserFinanceHistoryResponse = {
  items: TransactionRecord[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** API: GET /users/me/finance/upcoming */
export type UserFinanceUpcomingResponse = {
  items: UpcomingPayment[];
};
