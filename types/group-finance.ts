export type DepositPaymentMethodApi = "MTN_MOMO" | "MANUAL_TRANSFER";

export type DepositPreviewResponse = {
  configured: boolean;
  message?: string;
  currency?: string;
  allowPartialPayments?: boolean;
  contribution?: number;
  fine?: number;
  installment?: number;
  total?: number;
};

export type LoanRequestPreviewResponse = {
  configured: boolean;
  message?: string;
  canRequest?: boolean;
  currency?: string;
  maxAmount?: number;
  minAmount?: number;
  totalContributed?: number;
  interestRate?: number;
  repaymentPeriodDays?: number;
  allowExceedContribution?: boolean;
};

export type CreateDepositBody = {
  amount: number;
  paymentMethod: DepositPaymentMethodApi;
  phone?: string;
  /** Set for MANUAL_TRANSFER after uploading via POST /upload. */
  proofImageUrl?: string;
  /** When repaying a disbursed member loan, pass its id (same payment methods as a deposit). */
  memberLoanId?: string;
};

export type PendingManualDeposit = {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: DepositPaymentMethodApi;
  proofImageUrl: string;
  createdAt: string;
  member: { id: string; fullName: string; email: string };
};

/** Current user’s own manual transfer(s) awaiting group admin (read-only in UI). */
export type MyPendingManualDeposit = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type CreateDepositResult = {
  id: string;
  message: string;
  amount: number;
  currency: string;
  status: string;
};

export type CreateLoanApplicationResult = {
  id: string;
  status: string;
  requestedAmount: number;
  message: string;
};
