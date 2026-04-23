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
