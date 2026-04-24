export type LoanStatus = "ACTIVE" | "OVERDUE" | "PAID" | "PENDING_APPROVAL";

export type PaymentStatus = "COMPLETED" | "LATE" | "MISSED";

export type Loan = {
  id: string;
  groupId: string;
  groupName: string;
  principal: number;
  currency: string;
  interestRate: number; // % per period
  repaymentPeriodDays: number;
  disbursedAt: string; // ISO
  dueDate: string; // ISO
  status: LoanStatus;
  userId?: string
  amountPaid: number;
  penaltyAccrued: number;
  gracePeriodDays: number;
  totalInstallments: number;
  paidInstallments: number;
};

export type LoanPayment = {
  id: string;
  loanId: string;
  groupName: string;
  amount: number;
  currency: string;
  paidAt: string; // ISO
  status: PaymentStatus;
  installmentNumber: number;
  note?: string;
};

export type LoanPenalty = {
  id: string;
  loanId: string;
  groupName: string;
  amount: number;
  currency: string;
  reason: string;
  accruedAt: string;
  isPaid: boolean;
};

// types/loan.ts (add these new types)
export type LoanApplication = {
  id: string;
  userId: string;
  userName: string;
  groupId: string;
  groupName: string;
  principal: number;
  currency: string;
  interestRate: number;
  repaymentPeriodDays: number;
  purpose?: string;
  appliedAt: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
};

export type LoanWithUser = Loan & {
  userId: string;
  userName: string;
  userEmail: string;
};

export type RepaymentSchedule = {
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  paidAt?: string;
};