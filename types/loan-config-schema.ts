import { z } from "zod";
import type { LoanConfig, UpsertLoanConfigRequest } from "./loan-config";

export const loanConfigResponseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  interestRate: z.number(),
  repaymentPeriodDays: z.number().int(),
  allowExceedContribution: z.boolean(),
  maxLoanMultiplier: z.number().nullable(),
  allowPartialPayments: z.boolean(),
  penaltyRate: z.number().nullable(),
  gracePeriodDays: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<LoanConfig>;

/** Request body for PUT — optional `maxLoanMultiplier` / `penaltyRate` map to `null` when omitted. */
export const upsertLoanConfigRequestSchema = z.object({
  interestRate: z.number().min(0).max(999.99),
  repaymentPeriodDays: z.number().int().min(1),
  allowExceedContribution: z.boolean(),
  maxLoanMultiplier: z.number().min(0.01).max(999.99).optional(),
  allowPartialPayments: z.boolean(),
  penaltyRate: z.number().min(0).max(999.99).optional(),
  gracePeriodDays: z.number().int().min(0),
}) satisfies z.ZodType<UpsertLoanConfigRequest>;

/** String-based form fields before coercion to the API. */
export const loanConfigFormFieldSchema = z.object({
  interestRate: z
    .string()
    .refine((s) => {
      const n = parseFloat(s);
      return !Number.isNaN(n) && n >= 0 && n <= 999.99;
    }, "Interest rate must be between 0 and 999.99"),
  repaymentPeriodDays: z
    .string()
    .refine((s) => {
      const n = parseInt(s, 10);
      return !Number.isNaN(n) && n >= 1;
    }, "Repayment period must be at least 1 day"),
  allowExceedContribution: z.boolean(),
  maxLoanMultiplier: z.string(),
  allowPartialPayments: z.boolean(),
  penaltyRate: z
    .string()
    .refine((s) => {
      if (s === "") return true;
      const n = parseFloat(s);
      return !Number.isNaN(n) && n >= 0 && n <= 999.99;
    }, "Penalty rate must be between 0 and 999.99"),
  gracePeriodDays: z
    .string()
    .refine((s) => {
      const n = parseInt(s, 10);
      return !Number.isNaN(n) && n >= 0;
    }, "Grace period cannot be negative"),
});

export type LoanConfigFormFieldValues = z.infer<typeof loanConfigFormFieldSchema>;

/**
 * Coerce the form to an `UpsertLoanConfigRequest` after `loanConfigFormFieldSchema` success.
 * Empty multiplier with "exceed" on → omit key (unlimited in DB). Exceed off → omit.
 */
export function formValuesToUpsertRequest(
  form: LoanConfigFormFieldValues,
): UpsertLoanConfigRequest {
  const interestRate = parseFloat(form.interestRate);
  const repaymentPeriodDays = parseInt(form.repaymentPeriodDays, 10);
  const gracePeriodDays = parseInt(form.gracePeriodDays, 10);
  const penaltyEmpty = form.penaltyRate === "";
  const penaltyRate = penaltyEmpty ? undefined : parseFloat(form.penaltyRate);

  let maxLoanMultiplier: number | undefined;
  if (form.allowExceedContribution) {
    if (form.maxLoanMultiplier.trim() === "") {
      maxLoanMultiplier = undefined;
    } else {
      const m = parseFloat(form.maxLoanMultiplier);
      if (Number.isNaN(m) || m <= 0 || m > 999.99) {
        throw new Error("Max loan multiplier must be between 0.01 and 999.99");
      }
      maxLoanMultiplier = m;
    }
  } else {
    maxLoanMultiplier = undefined;
  }

  const body: UpsertLoanConfigRequest = {
    interestRate,
    repaymentPeriodDays,
    allowExceedContribution: form.allowExceedContribution,
    allowPartialPayments: form.allowPartialPayments,
    gracePeriodDays,
    ...(maxLoanMultiplier !== undefined ? { maxLoanMultiplier } : {}),
    ...(penaltyRate !== undefined ? { penaltyRate } : {}),
  };

  return upsertLoanConfigRequestSchema.parse(body);
}

export function loanConfigToFormValues(config: LoanConfig): LoanConfigFormFieldValues {
  return {
    interestRate: String(config.interestRate),
    repaymentPeriodDays: String(config.repaymentPeriodDays),
    allowExceedContribution: config.allowExceedContribution,
    maxLoanMultiplier:
      config.maxLoanMultiplier == null ? "" : String(config.maxLoanMultiplier),
    allowPartialPayments: config.allowPartialPayments,
    penaltyRate: config.penaltyRate == null ? "" : String(config.penaltyRate),
    gracePeriodDays: String(config.gracePeriodDays),
  };
}
