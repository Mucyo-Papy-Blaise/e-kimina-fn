"use client";

import { Info, Loader2, Save } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import type { LoanConfigFormFieldValues } from "@/types/loan-config-schema";

export type LoanSettingsFormProps = {
  form: LoanConfigFormFieldValues;
  onChange: <K extends keyof LoanConfigFormFieldValues>(
    key: K,
    value: LoanConfigFormFieldValues[K],
  ) => void;
  onSave: () => void;
  isSaving: boolean;
  /** When true all inputs are disabled and the save button is hidden. */
  readOnly: boolean;
};

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

export function LoanSettingsForm({
  form,
  onChange,
  onSave,
  isSaving,
  readOnly,
}: LoanSettingsFormProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Core Loan Terms ───────────────────────────────────── */}
        <Card className="border-border bg-bg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-text">
              Core Loan Terms
            </CardTitle>
            <CardDescription className="text-text-muted">
              Basic interest and repayment configuration for all loans in this
              group.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ls-interest">
                Interest Rate (% per period){" "}
                <FieldInfo text="Annual or per-period percentage charged on the loan principal." />
              </Label>
              <div className="relative">
                <Input
                  id="ls-interest"
                  type="number"
                  min={0}
                  max={999.99}
                  step={0.01}
                  placeholder="e.g. 5.00"
                  value={form.interestRate}
                  onChange={(e) => onChange("interestRate", e.target.value)}
                  disabled={readOnly}
                  className="border-border bg-secondary-2 pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ls-repayment">
                Repayment Period (days){" "}
                <FieldInfo text="Number of days a borrower has to fully repay the loan." />
              </Label>
              <Input
                id="ls-repayment"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 30"
                value={form.repaymentPeriodDays}
                onChange={(e) =>
                  onChange("repaymentPeriodDays", e.target.value)
                }
                disabled={readOnly}
                className="border-border bg-secondary-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Loan Limits ───────────────────────────────────────── */}
        <Card className="border-border bg-bg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-text">Loan Limits</CardTitle>
            <CardDescription className="text-text-muted">
              Control whether members can borrow beyond their contribution
              amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="ls-exceed" className="cursor-pointer">
                  Allow exceeding contribution{" "}
                  <FieldInfo text="When enabled, members can apply for loans greater than their total contributions to the group." />
                </Label>
                <p className="text-xs text-text-muted">
                  Members can borrow more than they have contributed.
                </p>
              </div>
              <Switch
                id="ls-exceed"
                checked={form.allowExceedContribution}
                onCheckedChange={(v) => onChange("allowExceedContribution", v)}
                disabled={readOnly}
              />
            </div>

            {form.allowExceedContribution && (
              <div className="space-y-1.5 pl-0 sm:pl-2">
                <Label htmlFor="ls-multiplier">
                  Max loan multiplier{" "}
                  <FieldInfo text="Maximum loan as a multiple of the member's contribution. E.g. 2× means they can borrow up to twice what they contributed." />
                </Label>
                <div className="relative max-w-50">
                  <Input
                    id="ls-multiplier"
                    type="number"
                    min={0.01}
                    max={999.99}
                    step={0.01}
                    placeholder="e.g. 2.00"
                    value={form.maxLoanMultiplier}
                    onChange={(e) =>
                      onChange("maxLoanMultiplier", e.target.value)
                    }
                    disabled={readOnly}
                    className="border-border bg-secondary-2 pr-6"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                    ×
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Leave empty for no upper cap.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Repayment Behaviour ───────────────────────────────── */}
        <Card className="border-border bg-bg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-text">
              Repayment Behaviour
            </CardTitle>
            <CardDescription className="text-text-muted">
              Configure partial payments and late-payment penalties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="ls-partial" className="cursor-pointer">
                  Allow partial payments{" "}
                  <FieldInfo text="When enabled, members can repay loans in instalments rather than a single lump sum." />
                </Label>
                <p className="text-xs text-text-muted">
                  Members can make multiple repayments until fully paid.
                </p>
              </div>
              <Switch
                id="ls-partial"
                checked={form.allowPartialPayments}
                onCheckedChange={(v) => onChange("allowPartialPayments", v)}
                disabled={readOnly}
              />
            </div>

            <Separator className="bg-border" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ls-penalty">
                  Penalty rate (% per period){" "}
                  <FieldInfo text="Additional interest charged per period when a loan is overdue. Leave empty to disable penalties." />
                </Label>
                <div className="relative">
                  <Input
                    id="ls-penalty"
                    type="number"
                    min={0}
                    max={999.99}
                    step={0.01}
                    placeholder="Optional, e.g. 1.50"
                    value={form.penaltyRate}
                    onChange={(e) => onChange("penaltyRate", e.target.value)}
                    disabled={readOnly}
                    className="border-border bg-secondary-2 pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ls-grace">
                  Grace period (days){" "}
                  <FieldInfo text="Days after the due date before penalties kick in. Set to 0 for immediate penalties." />
                </Label>
                <Input
                  id="ls-grace"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 7"
                  value={form.gracePeriodDays}
                  onChange={(e) => onChange("gracePeriodDays", e.target.value)}
                  disabled={readOnly}
                  className="border-border bg-secondary-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Save ─────────────────────────────────────────────── */}
        {!readOnly && (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save loan settings
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
