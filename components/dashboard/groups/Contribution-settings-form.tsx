"use client";

import { useState } from "react";
import { Info, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import {
  useContributionConfigQuery,
  useUpsertContributionConfigMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import type { ContributionInterval } from "@/types/contribution";
import {
  contributionConfigToFormValues,
  contributionConfigFormFieldSchema,
  DEFAULT_CONTRIBUTION_FORM,
  formValuesToUpsertRequest,
  type ContributionConfigFormFieldValues,
} from "@/types/contribution-schema";

const DAY_OF_WEEK_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const CURRENCY_OPTIONS = ["RWF", "USD", "EUR", "GBP", "KES", "UGX", "TZS"];

function FieldInfo({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="inline size-3.5 cursor-help text-text-muted" />
      </TooltipTrigger>
      <TooltipContent className="max-w-55 text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

type ContributionSettingsFormProps = {
  groupId: string;
  isVerified: boolean;
  /** `GROUP_ADMIN` in settings tab; must match `PUT` access for contribution config. */
  canEdit: boolean;
};

/**
 * Fetches config, then mounts a keyed editor so initial values come from props (no
 * setState-in-effect hydration).
 */
export function ContributionSettingsForm({
  groupId,
  isVerified,
  canEdit,
}: ContributionSettingsFormProps) {
  const query = useContributionConfigQuery(groupId, isVerified);

  if (!isVerified) {
    return (
      <p className="text-sm text-text-muted">
        Contribution settings are available after this group is verified.
      </p>
    );
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center gap-2 text-text-muted">
        <Loader2 className="size-5 animate-spin" />
        Loading contribution settings…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-(--radius) border border-border bg-secondary px-4 py-6 text-sm text-text">
        {query.error instanceof ApiError && query.error.status === 403
          ? "You cannot view contribution settings for this group."
          : (query.error?.message ?? "Could not load contribution settings.")}
      </div>
    );
  }

  const data = query.data ?? null;
  const initialForm: ContributionConfigFormFieldValues =
    data === null ? DEFAULT_CONTRIBUTION_FORM : contributionConfigToFormValues(data);
  const configKey = data
    ? `${data.id}-${data.updatedAt}`
    : "empty";

  return (
    <TooltipProvider>
      {canEdit ? null : (
        <p className="mb-4 text-sm text-text-muted">
          You can view this group&apos;s contribution rules. Only a group admin can change them in
          this app.
        </p>
      )}
      <ContributionSettingsFormEditor
        key={`${groupId}-${configKey}`}
        groupId={groupId}
        canEdit={canEdit}
        initialForm={initialForm}
      />
    </TooltipProvider>
  );
}

type EditorProps = {
  groupId: string;
  canEdit: boolean;
  initialForm: ContributionConfigFormFieldValues;
};

function ContributionSettingsFormEditor({
  groupId,
  canEdit,
  initialForm,
}: EditorProps) {
  const upsert = useUpsertContributionConfigMutation();
  const [form, setForm] = useState<ContributionConfigFormFieldValues>(initialForm);

  const set = <K extends keyof ContributionConfigFormFieldValues>(
    key: K,
    value: ContributionConfigFormFieldValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const needsDayOfWeek =
    form.interval === "WEEKLY" || form.interval === "BIWEEKLY";
  const needsDayOfMonth = form.interval === "MONTHLY";

  const ro = !canEdit;

  const handleSave = async () => {
    const parsed = contributionConfigFormFieldSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Check your inputs";
      toast.error(first);
      return;
    }

    let body: ReturnType<typeof formValuesToUpsertRequest>;
    try {
      body = formValuesToUpsertRequest(parsed.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid values");
      return;
    }

    try {
      const result = await upsert.mutateAsync({ groupId, body });
      setForm(contributionConfigToFormValues(result));
      toast.success("Contribution settings saved");
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Save failed",
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-bg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-text">Contribution Amount</CardTitle>
          <CardDescription className="text-text-muted">
            Set the fixed amount each member must contribute per cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cc-amount">
              Amount{" "}
              <FieldInfo text="Fixed contribution charged to every member each cycle." />
            </Label>
            <Input
              id="cc-amount"
              type="number"
              min={0.01}
              step={0.01}
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              disabled={ro}
              className="border-border bg-secondary-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cc-currency">
              Currency{" "}
              <FieldInfo text="The currency used for contributions and payouts in this group." />
            </Label>
            <Select
              value={form.currency}
              onValueChange={(v) => set("currency", v)}
              disabled={ro}
            >
              <SelectTrigger
                id="cc-currency"
                className="border-border bg-secondary-2"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-bg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-text">Schedule</CardTitle>
          <CardDescription className="text-text-muted">
            Define how often contributions are collected and when the first cycle begins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cc-interval">
                Interval{" "}
                <FieldInfo text="How frequently members are expected to contribute." />
              </Label>
              <Select
                value={form.interval === "" ? undefined : form.interval}
                onValueChange={(v) => {
                  set("interval", v as ContributionInterval);
                  set("dayOfWeek", "");
                  set("dayOfMonth", "");
                }}
                disabled={ro}
              >
                <SelectTrigger
                  id="cc-interval"
                  className="border-border bg-secondary-2"
                >
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cc-start">
                Start date{" "}
                <FieldInfo text="The date the first contribution cycle begins. Future cycles are scheduled from here." />
              </Label>
              <Input
                id="cc-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                disabled={ro}
                className="border-border bg-secondary-2"
              />
            </div>
          </div>

          {needsDayOfWeek && (
            <div className="space-y-1.5">
              <Label htmlFor="cc-dow">
                Due day of week{" "}
                <FieldInfo text="The day of the week when contributions are due each cycle." />
              </Label>
              <Select
                value={form.dayOfWeek === "" ? undefined : form.dayOfWeek}
                onValueChange={(v) => set("dayOfWeek", v)}
                disabled={ro}
              >
                <SelectTrigger
                  id="cc-dow"
                  className="max-w-55 border-border bg-secondary-2"
                >
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OF_WEEK_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needsDayOfMonth && (
            <div className="space-y-1.5">
              <Label htmlFor="cc-dom">
                Due day of month{" "}
                <FieldInfo text="Calendar day (1–31) contributions are due each month. Shorter months use the last day." />
              </Label>
              <Input
                id="cc-dom"
                type="number"
                min={1}
                max={31}
                step={1}
                placeholder="e.g. 1"
                value={form.dayOfMonth}
                onChange={(e) => set("dayOfMonth", e.target.value)}
                disabled={ro}
                className="max-w-40 border-border bg-secondary-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-bg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-text">Payment Rules</CardTitle>
          <CardDescription className="text-text-muted">
            Control how members can pay and what happens when they pay late.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="cc-partial" className="cursor-pointer">
                Allow partial payments{" "}
                <FieldInfo text="When enabled, members can pay a portion of the due amount rather than the full amount at once." />
              </Label>
              <p className="text-xs text-text-muted">
                Members can split their contribution across multiple payments.
              </p>
            </div>
            <Switch
              id="cc-partial"
              checked={form.allowPartialPayments}
              onCheckedChange={(v) => set("allowPartialPayments", v)}
              disabled={ro}
            />
          </div>

          <Separator className="bg-border" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cc-penalty">
                Late penalty rate (% per period){" "}
                <FieldInfo text="Extra charge applied each period to overdue contributions. Leave empty to disable penalties." />
              </Label>
              <div className="relative">
                <Input
                  id="cc-penalty"
                  type="number"
                  min={0}
                  max={999.99}
                  step={0.01}
                  placeholder="Optional, e.g. 2.00"
                  value={form.latePenaltyRate}
                  onChange={(e) => set("latePenaltyRate", e.target.value)}
                  disabled={ro}
                  className="border-border bg-secondary-2 pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cc-grace">
                Grace period (days){" "}
                <FieldInfo text="Days after the due date before the late penalty is applied. Set to 0 for immediate penalties." />
              </Label>
              <Input
                id="cc-grace"
                type="number"
                min={0}
                step={1}
                placeholder="e.g. 3"
                value={form.gracePeriodDays}
                onChange={(e) => set("gracePeriodDays", e.target.value)}
                disabled={ro}
                className="border-border bg-secondary-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={upsert.isPending}
            className="gap-2"
          >
            {upsert.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save contribution settings
          </Button>
        </div>
      )}
    </div>
  );
}
