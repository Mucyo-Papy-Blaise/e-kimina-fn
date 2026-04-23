import { format, parseISO } from "date-fns";
import { z } from "zod";
import type { ContributionConfig, UpsertContributionConfigRequest } from "./contribution";
import { CONTRIBUTION_INTERVALS, type ContributionInterval } from "./contribution";

const intervalSchema = z.enum(CONTRIBUTION_INTERVALS) satisfies z.ZodType<ContributionInterval>;

export const contributionConfigResponseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  amount: z.number(),
  currency: z.string(),
  interval: intervalSchema,
  startDate: z.string(),
  dayOfWeek: z.union([z.number().int(), z.null()]),
  dayOfMonth: z.union([z.number().int(), z.null()]),
  allowPartialPayments: z.boolean(),
  latePenaltyRate: z.number().nullable(),
  gracePeriodDays: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<ContributionConfig>;

export const upsertContributionConfigRequestSchema = z.object({
  amount: z.number().min(0.01),
  currency: z.string().max(8).optional(),
  interval: intervalSchema,
  startDate: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  allowPartialPayments: z.boolean(),
  latePenaltyRate: z.number().min(0).max(999.99).optional(),
  gracePeriodDays: z.number().int().min(0),
}) satisfies z.ZodType<UpsertContributionConfigRequest>;

/** String fields used by the settings form before sending to the API. */
export const contributionConfigFormFieldSchema = z
  .object({
    amount: z
      .string()
      .refine((s) => {
        const n = parseFloat(s);
        return !Number.isNaN(n) && n > 0;
      }, "Amount must be greater than 0"),
    currency: z.string().min(1).max(8),
    interval: z.string(),
    startDate: z.string().min(1, "Start date is required"),
    dayOfWeek: z.string(),
    dayOfMonth: z.string(),
    allowPartialPayments: z.boolean(),
    latePenaltyRate: z
      .string()
      .refine((s) => {
        if (s === "") return true;
        const n = parseFloat(s);
        return !Number.isNaN(n) && n >= 0 && n <= 999.99;
      }, "Late penalty must be between 0 and 999.99"),
    gracePeriodDays: z
      .string()
      .refine((s) => {
        const n = parseInt(s, 10);
        return !Number.isNaN(n) && n >= 0;
      }, "Grace period cannot be negative"),
  })
  .refine(
    (v) => (CONTRIBUTION_INTERVALS as readonly string[]).includes(v.interval),
    { message: "Select an interval", path: ["interval"] },
  )
  .superRefine((val, ctx) => {
    if (val.interval === "WEEKLY" || val.interval === "BIWEEKLY") {
      if (val.dayOfWeek === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select the day of the week",
          path: ["dayOfWeek"],
        });
      }
    }
    if (val.interval === "MONTHLY") {
      const dom = parseInt(val.dayOfMonth, 10);
      if (Number.isNaN(dom) || dom < 1 || dom > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Day of month must be 1–31",
          path: ["dayOfMonth"],
        });
      }
    }
  });

export type ContributionConfigFormFieldValues = z.infer<
  typeof contributionConfigFormFieldSchema
>;

export const DEFAULT_CONTRIBUTION_FORM: ContributionConfigFormFieldValues = {
  amount: "",
  currency: "RWF",
  interval: "",
  startDate: "",
  dayOfWeek: "",
  dayOfMonth: "",
  allowPartialPayments: false,
  latePenaltyRate: "",
  gracePeriodDays: "0",
};

export function contributionConfigToFormValues(
  c: ContributionConfig,
): ContributionConfigFormFieldValues {
  let startForInput: string;
  try {
    startForInput = format(parseISO(c.startDate), "yyyy-MM-dd");
  } catch {
    startForInput = c.startDate.slice(0, 10);
  }
  return {
    amount: String(c.amount),
    currency: c.currency,
    interval: c.interval,
    startDate: startForInput,
    dayOfWeek: c.dayOfWeek == null ? "" : String(c.dayOfWeek),
    dayOfMonth: c.dayOfMonth == null ? "" : String(c.dayOfMonth),
    allowPartialPayments: c.allowPartialPayments,
    latePenaltyRate: c.latePenaltyRate == null ? "" : String(c.latePenaltyRate),
    gracePeriodDays: String(c.gracePeriodDays),
  };
}

/**
 * Build the PUT body. Omits `latePenaltyRate`, `dayOfWeek`, and `dayOfMonth` when not applicable.
 */
export function formValuesToUpsertRequest(
  form: ContributionConfigFormFieldValues,
): UpsertContributionConfigRequest {
  const interval = form.interval as ContributionInterval;
  const body: UpsertContributionConfigRequest = {
    amount: parseFloat(form.amount),
    currency: form.currency.trim() || "RWF",
    interval,
    startDate: form.startDate,
    allowPartialPayments: form.allowPartialPayments,
    gracePeriodDays: parseInt(form.gracePeriodDays, 10),
  };

  if (form.latePenaltyRate.trim() !== "") {
    body.latePenaltyRate = parseFloat(form.latePenaltyRate);
  }

  if (form.interval === "WEEKLY" || form.interval === "BIWEEKLY") {
    body.dayOfWeek = parseInt(form.dayOfWeek, 10);
  }
  if (form.interval === "MONTHLY") {
    body.dayOfMonth = parseInt(form.dayOfMonth, 10);
  }

  return upsertContributionConfigRequestSchema.parse(body);
}
