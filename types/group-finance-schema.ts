import { z } from "zod";
import type {
  DepositPreviewResponse,
  LoanRequestPreviewResponse,
  MyPendingManualDeposit,
  PendingManualDeposit,
} from "./group-finance";

const depositMethodSchema = z.enum(["MTN_MOMO", "MANUAL_TRANSFER"]);

export const depositPreviewResponseSchema: z.ZodType<DepositPreviewResponse> = z
  .object({
    configured: z.boolean(),
    message: z.string().optional(),
    currency: z.string().optional(),
    allowPartialPayments: z.boolean().optional(),
    contribution: z.number().optional(),
    fine: z.number().optional(),
    installment: z.number().optional(),
    total: z.number().optional(),
  })
  .passthrough();

export const loanRequestPreviewResponseSchema: z.ZodType<LoanRequestPreviewResponse> = z
  .object({
    configured: z.boolean(),
    message: z.string().optional(),
    canRequest: z.boolean().optional(),
    currency: z.string().optional(),
    maxAmount: z.number().optional(),
    minAmount: z.number().optional(),
    totalContributed: z.number().optional(),
    interestRate: z.number().optional(),
    repaymentPeriodDays: z.number().optional(),
    allowExceedContribution: z.boolean().optional(),
  })
  .passthrough();

const pendingManualDepositItemSchema: z.ZodType<PendingManualDeposit> = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentMethod: depositMethodSchema,
  proofImageUrl: z.string(),
  createdAt: z.string(),
  member: z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
  }),
});

export const pendingManualDepositsResponseSchema = z.array(pendingManualDepositItemSchema);

const myPendingManualDepositItemSchema: z.ZodType<MyPendingManualDeposit> = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export const myPendingManualDepositsResponseSchema = z.array(
  myPendingManualDepositItemSchema,
);

export { depositMethodSchema };
export type DepositMethodForm = z.infer<typeof depositMethodSchema>;
