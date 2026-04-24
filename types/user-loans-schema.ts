import { z } from "zod";

export const userLoansResponseSchema = z.object({
  applications: z.array(
    z.object({
      id: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      requestedAmount: z.number(),
      currency: z.string(),
      interestRate: z.number(),
      repaymentPeriodDays: z.number(),
      status: z.string(),
      createdAt: z.string(),
      groupAdminApproved: z.boolean(),
      treasurerApproved: z.boolean(),
      waitingOn: z.string().nullable(),
      rejectionReason: z.string().nullable().optional(),
      rejectedAt: z.string().nullable().optional(),
      disbursedLoanId: z.string().nullable().optional(),
    }),
  ),
  memberLoans: z.array(
    z.object({
      id: z.string(),
      groupId: z.string(),
      groupName: z.string(),
      applicationId: z.string(),
      principal: z.number(),
      totalRepayable: z.number(),
      amountRepaid: z.number(),
      penaltyAccrued: z.number(),
      outstanding: z.number(),
      currency: z.string(),
      interestRate: z.number(),
      repaymentPeriodDays: z.number(),
      disbursedAt: z.string(),
      dueDate: z.string(),
      status: z.string(),
      isOverdue: z.boolean(),
    }),
  ),
});

export type UserLoansResponse = z.infer<typeof userLoansResponseSchema>;
