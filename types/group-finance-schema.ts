import { z } from "zod";
import type {
  DepositPreviewResponse,
  LoanRequestPreviewResponse,
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

export { depositMethodSchema };
export type DepositMethodForm = z.infer<typeof depositMethodSchema>;
