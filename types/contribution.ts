/** Prisma `ContributionInterval` — must match API. */
export const CONTRIBUTION_INTERVALS = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
export type ContributionInterval = (typeof CONTRIBUTION_INTERVALS)[number];

/** Matches `ContributionConfigResponseDto` from `GET /groups/:id/contribution-config`. */
export type ContributionConfig = {
  id: string;
  groupId: string;
  amount: number;
  currency: string;
  interval: ContributionInterval;
  startDate: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  allowPartialPayments: boolean;
  latePenaltyRate: number | null;
  gracePeriodDays: number;
  createdAt: string;
  updatedAt: string;
};

/** Body for `PUT /groups/:id/contribution-config` — aligned with `UpsertContributionConfigDto`. */
export type UpsertContributionConfigRequest = {
  amount: number;
  currency?: string;
  interval: ContributionInterval;
  startDate: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  allowPartialPayments: boolean;
  latePenaltyRate?: number;
  gracePeriodDays: number;
};
