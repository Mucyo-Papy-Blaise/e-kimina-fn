"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Banknote, HandCoins, Info, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContributionConfig } from "@/types/contribution";
import type { LoanConfig } from "@/types/loan-config";

/** Loan policy summary—everyone sees this when the group is verified; the edit tab is admin-only. */
export type GroupHeaderLoanState = {
  isVerified: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** `undefined` while loading; `null` if none saved yet; else current policy. */
  config: LoanConfig | null | undefined;
};

/** Contribution rules—read-only in the header; editing is in Settings for admins. */
export type GroupHeaderContributionState = {
  isVerified: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  config: ContributionConfig | null | undefined;
};

type GroupHeaderProps = {
  name: string;
  description?: string | null;
  isVerified: boolean;
  isPublic: boolean;
  myRole: string;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
  isAdmin: boolean;
  onEdit: () => void;
  onInvite: () => void;
  onDelete: () => void;
  loanState: GroupHeaderLoanState;
  contributionState: GroupHeaderContributionState;
  /** Member actions: deposit uses contribution rules; loan uses loan rules. */
  onOpenDepositModal?: () => void;
  onOpenRequestLoanModal?: () => void;
  showDepositButton?: boolean;
  showLoanRequestButton?: boolean;
};

export function GroupHeader({
  name,
  description,
  isVerified,
  isPublic,
  myRole,
  memberCount,
  maxMembers,
  createdAt,
  isAdmin,
  onEdit,
  onInvite,
  onDelete,
  loanState,
  contributionState,
  onOpenDepositModal,
  onOpenRequestLoanModal,
  showDepositButton = false,
  showLoanRequestButton = false,
}: GroupHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/groups"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-text-muted transition hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Groups
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              {name}
            </h1>
            {isVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Pending verification</Badge>
            )}
            {isPublic ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                Public
              </Badge>
            ) : (
              <Badge variant="secondary">Private</Badge>
            )}
            <Badge variant="secondary">Your role: {myRole}</Badge>
          </div>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              {description}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-text-muted">
            {memberCount} / {maxMembers} active members · Created{" "}
            {format(parseISO(createdAt), "MMM d, yyyy")}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={onEdit}
            >
              Edit group
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={onInvite}
            >
              Invite member
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete group
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <GroupLoanConfigBanner
          state={loanState}
          onRequestLoan={onOpenRequestLoanModal}
          showRequestButton={showLoanRequestButton}
        />
        <GroupContributionConfigBanner
          state={contributionState}
          onDeposit={onOpenDepositModal}
          showDepositButton={showDepositButton}
        />
      </div>
    </div>
  );
}

function fmtPct(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function GroupLoanConfigBanner({
  state,
  onRequestLoan,
  showRequestButton,
}: {
  state: GroupHeaderLoanState;
  onRequestLoan?: () => void;
  showRequestButton: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-(--radius) border border-border bg-secondary/40 px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text">Loan policy</h2>
        <div className="flex items-center gap-2">
          {showRequestButton && onRequestLoan && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={onRequestLoan}
            >
              <HandCoins className="size-3.5" />
              Request loan
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 shrink-0 cursor-help text-text-muted" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Terms that apply to loans in this group. To change them, a group admin can use
                the Settings tab.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {!state.isVerified && (
        <p className="text-sm text-text-muted">
          The loan policy will be shown here after this group is verified.
        </p>
      )}

      {state.isVerified && state.isLoading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading loan policy…
        </div>
      )}

      {state.isVerified && !state.isLoading && state.isError && (
        <p className="text-sm text-text-muted">
          {state.errorMessage ?? "Could not load the loan policy."}
        </p>
      )}

      {state.isVerified && !state.isLoading && !state.isError && state.config === null && (
        <p className="text-sm text-text-muted">
          No loan policy has been set yet. When it is, all members will see the details
          here.
        </p>
      )}

      {state.isVerified && !state.isLoading && !state.isError && state.config != null && (
        <div className="min-h-0 flex-1 space-y-3 text-sm text-text">
          <ul className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <li>
              <p className="text-xs text-text-muted">Interest</p>
              <p className="font-medium">
                {fmtPct(state.config.interestRate)}% <span className="text-text-muted">/ period</span>
              </p>
            </li>
            <li>
              <p className="text-xs text-text-muted">Repayment period</p>
              <p className="font-medium">
                {state.config.repaymentPeriodDays} day{state.config.repaymentPeriodDays === 1 ? "" : "s"}
              </p>
            </li>
            <li>
              <p className="text-xs text-text-muted">Exceeds contribution</p>
              <p className="font-medium">
                {state.config.allowExceedContribution ? "Yes" : "No"}
                {state.config.allowExceedContribution &&
                  state.config.maxLoanMultiplier != null && (
                    <span className="text-text-muted">
                      {" "}
                      (max {fmtPct(state.config.maxLoanMultiplier)}×)
                    </span>
                  )}
                {state.config.allowExceedContribution &&
                  state.config.maxLoanMultiplier == null && (
                    <span className="text-text-muted"> (no cap)</span>
                  )}
              </p>
            </li>
            <li>
              <p className="text-xs text-text-muted">Partial payments</p>
              <p className="font-medium">
                {state.config.allowPartialPayments ? "Yes" : "No"}
              </p>
            </li>
            <li>
              <p className="text-xs text-text-muted">Penalty (late)</p>
              <p className="font-medium">
                {state.config.penaltyRate == null
                  ? "None"
                  : `${fmtPct(state.config.penaltyRate)}% / period`}
              </p>
            </li>
            <li>
              <p className="text-xs text-text-muted">Grace period</p>
              <p className="font-medium">
                {state.config.gracePeriodDays} day{state.config.gracePeriodDays === 1 ? "" : "s"}
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

const CONTRIBUTION_INTERVAL_LABELS: Record<
  ContributionConfig["interval"],
  string
> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
};

const CONTRIBUTION_WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function fmtMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.length === 3 ? currency : "RWF",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

function fmtScheduleDate(iso: string) {
  try {
    const d = parseISO(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return format(d, "MMM d, yyyy");
  } catch {
    return iso.slice(0, 10);
  }
}

function GroupContributionConfigBanner({
  state,
  onDeposit,
  showDepositButton,
}: {
  state: GroupHeaderContributionState;
  onDeposit?: () => void;
  showDepositButton: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-(--radius) border border-border bg-secondary/40 px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text">Contribution rules</h2>
        <div className="flex items-center gap-2">
          {showDepositButton && onDeposit && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={onDeposit}
            >
              <Banknote className="size-3.5" />
              Make a deposit
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 shrink-0 cursor-help text-text-muted" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                How much and how often members contribute. To change these, a group admin can use
                the Settings tab.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {!state.isVerified && (
        <p className="text-sm text-text-muted">
          Contribution rules will appear here after this group is verified.
        </p>
      )}

      {state.isVerified && state.isLoading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading contribution rules…
        </div>
      )}

      {state.isVerified && !state.isLoading && state.isError && (
        <p className="text-sm text-text-muted">
          {state.errorMessage ?? "Could not load contribution rules."}
        </p>
      )}

      {state.isVerified &&
        !state.isLoading &&
        !state.isError &&
        state.config === null && (
          <p className="text-sm text-text-muted">
            No contribution schedule has been set yet. When it is, everyone in the group will
            see it here.
          </p>
        )}

      {state.isVerified &&
        !state.isLoading &&
        !state.isError &&
        state.config != null && (
          <div className="min-h-0 flex-1 space-y-3 text-sm text-text">
            <p className="rounded-(--radius) border border-border/60 bg-bg/50 px-3 py-2.5 text-center text-base font-semibold tabular-nums text-text">
              {fmtMoney(state.config.amount, state.config.currency)}{" "}
              <span className="text-xs font-normal text-text-muted">
                per {CONTRIBUTION_INTERVAL_LABELS[state.config.interval].toLowerCase()} cycle
              </span>
            </p>
            <ul className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <li>
                <p className="text-xs text-text-muted">Interval</p>
                <p className="font-medium">
                  {CONTRIBUTION_INTERVAL_LABELS[state.config.interval]}
                </p>
              </li>
              <li>
                <p className="text-xs text-text-muted">Schedule starts</p>
                <p className="font-medium">{fmtScheduleDate(state.config.startDate)}</p>
              </li>
              {(state.config.interval === "WEEKLY" ||
                state.config.interval === "BIWEEKLY") &&
                state.config.dayOfWeek != null && (
                  <li>
                    <p className="text-xs text-text-muted">Due day (week)</p>
                    <p className="font-medium">
                      {CONTRIBUTION_WEEKDAY_LABELS[state.config.dayOfWeek] ?? "—"}
                    </p>
                  </li>
                )}
              {state.config.interval === "MONTHLY" && state.config.dayOfMonth != null && (
                <li>
                  <p className="text-xs text-text-muted">Due day (month)</p>
                  <p className="font-medium">
                    Day {state.config.dayOfMonth} of each month
                  </p>
                </li>
              )}
              <li>
                <p className="text-xs text-text-muted">Partial payments</p>
                <p className="font-medium">
                  {state.config.allowPartialPayments ? "Allowed" : "Not allowed"}
                </p>
              </li>
              <li>
                <p className="text-xs text-text-muted">Late penalty</p>
                <p className="font-medium">
                  {state.config.latePenaltyRate == null
                    ? "None"
                    : `${fmtPct(state.config.latePenaltyRate)}% / period`}
                </p>
              </li>
              <li className="sm:col-span-2">
                <p className="text-xs text-text-muted">Grace period</p>
                <p className="font-medium">
                  {state.config.gracePeriodDays} day
                  {state.config.gracePeriodDays === 1 ? "" : "s"} after due date
                </p>
              </li>
            </ul>
          </div>
        )}
    </div>
  );
}
