"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import {
  useCreateLoanApplicationMutation,
  useLoanRequestPreviewQuery,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";

type RequestLoanModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  isVerified: boolean;
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function RequestLoanModal({
  open,
  onOpenChange,
  groupId,
  isVerified,
}: RequestLoanModalProps) {
  const preview = useLoanRequestPreviewQuery(groupId, open && isVerified);
  const createLoan = useCreateLoanApplicationMutation();
  const [amount, setAmount] = useState("");

  const p = preview.data;
  const ok = p?.configured && p.canRequest && p.maxAmount != null && p.maxAmount > 0;

  useEffect(() => {
    if (open && ok && p?.maxAmount != null) {
      setAmount(String(p.maxAmount));
    }
  }, [open, ok, p?.maxAmount]);

  const maxAmount = p?.maxAmount ?? 0;
  const requested = parseFloat(amount);
  const valid =
    !Number.isNaN(requested) && requested > 0 && requested <= maxAmount + 0.0001;

  const handleSubmit = async () => {
    if (!ok || !valid) {
      toast.error("Enter a valid amount up to your maximum.");
      return;
    }
    try {
      const res = await createLoan.mutateAsync({
        groupId,
        requestedAmount: requested,
      });
      toast.success(res.message);
      onOpenChange(false);
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Request failed",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-bg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-bold text-text">
            Request a loan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isVerified && (
            <p className="text-sm text-text-muted">Loans are available after verification.</p>
          )}

          {isVerified && preview.isLoading && (
            <div className="flex justify-center py-8 text-text-muted">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}

          {isVerified && preview.isError && (
            <p className="text-sm text-text-muted">
              {preview.error?.message ?? "Could not load loan terms."}
            </p>
          )}

          {isVerified && preview.isSuccess && !p?.configured && (
            <p className="text-sm text-text-muted">
              {p && "message" in p && p.message
                ? p.message
                : "Loan rules are not configured for this group."}
            </p>
          )}

          {isVerified && p?.configured && (
            <div className="rounded-(--radius) border border-border bg-secondary/50 px-3 py-2.5 text-sm space-y-1.5 text-text">
              {p.maxAmount != null && (
                <p>
                  <span className="text-text-muted">Max you can request: </span>
                  <span className="font-semibold">{fmt(p.maxAmount)} RWF</span>
                </p>
              )}
              {p.totalContributed != null && (
                <p>
                  <span className="text-text-muted">Your contributions (paid): </span>
                  {fmt(p.totalContributed)} RWF
                </p>
              )}
              {p.interestRate != null && (
                <p>
                  <span className="text-text-muted">Interest: </span>
                  {fmt(p.interestRate)}% / period
                </p>
              )}
              {p.repaymentPeriodDays != null && (
                <p>
                  <span className="text-text-muted">Repayment: </span>
                  {p.repaymentPeriodDays} days
                </p>
              )}
            </div>
          )}

          {isVerified && p?.configured && p.canRequest === false && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {p.message ??
                "You are not eligible to request a loan yet (maximum is 0). Build your contribution history first."}
            </p>
          )}

          {isVerified && ok && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="loan-amt">Amount (RWF)</Label>
                <Input
                  id="loan-amt"
                  type="number"
                  min={0.01}
                  max={maxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-border bg-secondary-2"
                />
                <p className="text-xs text-text-muted">Must not exceed {fmt(maxAmount)} RWF.</p>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => void handleSubmit()}
                disabled={createLoan.isPending || !valid}
              >
                {createLoan.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Submit request"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
