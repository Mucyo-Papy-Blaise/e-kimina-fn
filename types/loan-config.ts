/** Matches `LoanConfigResponseDto` from `GET /groups/:id/loan-config` (or `null` when not configured). */
export type LoanConfig = {
  id: string;
  groupId: string;
  interestRate: number;
  repaymentPeriodDays: number;
  allowExceedContribution: boolean;
  maxLoanMultiplier: number | null;
  allowPartialPayments: boolean;
  penaltyRate: number | null;
  gracePeriodDays: number;
  createdAt: string;
  updatedAt: string;
};

/** Request body for `PUT /groups/:id/loan-config` — same shape as `UpsertLoanConfigDto`. */
export type UpsertLoanConfigRequest = {
  interestRate: number;
  repaymentPeriodDays: number;
  allowExceedContribution: boolean;
  /** Omitted when not limiting; maps to `null` in the database. */
  maxLoanMultiplier?: number;
  allowPartialPayments: boolean;
  /** Omitted to disable; maps to `null` in the database. */
  penaltyRate?: number;
  gracePeriodDays: number;
};
