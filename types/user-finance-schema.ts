import { z } from "zod";

export const userFinanceSummarySchema = z.object({
  groupBalances: z.array(
    z.object({
      groupId: z.string(),
      groupName: z.string(),
      totalContributed: z.number(),
      currency: z.string(),
      memberSince: z.string(),
    }),
  ),
  penaltyBalances: z.array(
    z.object({
      id: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      amount: z.number(),
      currency: z.string(),
      reason: z.string(),
      dueDate: z.string(),
    }),
  ),
});

export const userFinanceHistorySchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      type: z.string(),
      amount: z.number(),
      currency: z.string(),
      date: z.string(),
      description: z.string(),
      isCredit: z.boolean(),
      status: z.string().optional().nullable(),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const userFinanceUpcomingSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      type: z.string(),
      amount: z.number(),
      currency: z.string(),
      dueDate: z.string(),
      description: z.string(),
      status: z.string(),
    }),
  ),
});
