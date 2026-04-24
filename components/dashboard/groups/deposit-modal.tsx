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
import { uploadFile } from "@/lib/api/upload-api";
import {
  useCreateDepositMutation,
  useDepositPreviewQuery,
  useLoanRepaymentPreviewQuery,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { cn } from "@/utils/cn";
import type { DepositPaymentMethodApi } from "@/types/group-finance";

type DepositModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  isVerified: boolean;
  /** When paying down a member loan, pass its id (uses loan repayment preview + same payment rails). */
  memberLoanId?: string;
  /** Override dialog title (e.g. “Repay loan”). */
  title?: string;
  /** When opening from another screen, group detail may still be loading. */
  groupDetailLoading?: boolean;
};

function fmtCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.length === 3 ? currency : "RWF",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${currency}`;
  }
}

export function DepositModal({
  open,
  onOpenChange,
  groupId,
  isVerified,
  memberLoanId,
  title,
  groupDetailLoading = false,
}: DepositModalProps) {
  const depositPreview = useDepositPreviewQuery(
    groupId,
    open && isVerified && !memberLoanId,
  );
  const loanPreview = useLoanRepaymentPreviewQuery(
    groupId,
    memberLoanId,
    open && isVerified && Boolean(memberLoanId),
  );
  const preview = memberLoanId ? loanPreview : depositPreview;
  const createDeposit = useCreateDepositMutation();
  const [method, setMethod] = useState<DepositPaymentMethodApi>("MTN_MOMO");
  const [phone, setPhone] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const p = preview.data;
  const configured = p?.configured;
  const total = p && "total" in p && p.total != null ? p.total : 0;
  const currency = p?.currency ?? "RWF";
  const allowPartial = p?.allowPartialPayments === true;
  const contribution = p && "contribution" in p ? (p.contribution ?? 0) : 0;
  const fine = p && "fine" in p ? (p.fine ?? 0) : 0;
  const installment = p && "installment" in p ? (p.installment ?? 0) : 0;

  useEffect(() => {
    if (open && configured && p && "total" in p && p.total != null) {
      setCustomAmount(
        allowPartial ? String(Math.round(p.total * 100) / 100) : String(p.total),
      );
    }
  }, [open, configured, p, allowPartial, total]);

  const payAmount = (() => {
    if (!allowPartial) return total;
    const n = parseFloat(customAmount);
    if (Number.isNaN(n)) return 0;
    return n;
  })();

  const handlePay = async () => {
    if (!p?.configured) return;
    if (total <= 0) {
      toast.error("Nothing to pay right now.");
      return;
    }
    if (method === "MTN_MOMO" && !phone.trim()) {
      toast.error("Enter the MoMo phone number.");
      return;
    }
    if (method === "MANUAL_TRANSFER" && !proofFile) {
      toast.error("Attach a payment proof (screenshot or receipt).");
      return;
    }
    if (allowPartial) {
      if (payAmount < 0.01 || payAmount > total + 0.01) {
        toast.error(`Amount must be between 0.01 and ${total.toFixed(2)}.`);
        return;
      }
    }
    try {
      let proofImageUrl: string | undefined;
      if (method === "MANUAL_TRANSFER" && proofFile) {
        setUploading(true);
        try {
          proofImageUrl = await uploadFile(proofFile);
        } finally {
          setUploading(false);
        }
      }
      const res = await createDeposit.mutateAsync({
        groupId,
        body: {
          amount: allowPartial ? payAmount : total,
          paymentMethod: method,
          phone: method === "MTN_MOMO" ? phone.trim() : undefined,
          proofImageUrl,
          memberLoanId,
        },
      });
      toast.success(res.message);
      onOpenChange(false);
      setPhone("");
      setProofFile(null);
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Payment failed",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-bg p-0 sm:max-w-lg">
        <div className="border-b border-border px-5 pb-3 pt-5">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-bold text-text">
              {title ?? (memberLoanId ? "Repay loan" : "Make a Deposit")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-5 py-4">
          {groupDetailLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
              <Loader2 className="size-5 animate-spin" />
              Loading group…
            </div>
          )}

          {!groupDetailLoading && !isVerified && (
            <p className="text-sm text-text-muted">Deposits are available after verification.</p>
          )}

          {!groupDetailLoading && isVerified && preview.isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
              <Loader2 className="size-5 animate-spin" />
              Loading…
            </div>
          )}

          {!groupDetailLoading && isVerified && preview.isError && (
            <p className="text-sm text-text-muted">
              {preview.error?.message ?? "Could not load amount due."}
            </p>
          )}

          {!groupDetailLoading && isVerified && preview.isSuccess && !configured && (
            <p className="text-sm text-text-muted">
              {p && "message" in p && p.message
                ? p.message
                : "Contribution rules are not set up for this group yet."}
            </p>
          )}

          {!groupDetailLoading && isVerified && configured && p && "total" in p && p.total != null && (
            <>
              <div className="rounded-(--radius) border border-border bg-secondary/60 px-3 py-3">
                <p className="mb-2.5 text-sm font-medium text-text">
                  {memberLoanId ? "Loan balance due" : "Amount due breakdown"}
                </p>
                <ul className="space-y-2 text-sm">
                  {memberLoanId ? (
                    <li className="flex justify-between gap-3">
                      <span className="text-text-muted">Outstanding</span>
                      <span className="font-medium text-text">
                        {fmtCurrency(total, currency)}
                      </span>
                    </li>
                  ) : (
                    <>
                      <li className="flex justify-between gap-3">
                        <span className="text-text-muted">Contribution</span>
                        <span className="font-medium text-text">
                          {fmtCurrency(contribution, currency)}
                        </span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-text-muted">Fine</span>
                        <span className="font-semibold text-destructive">
                          {fmtCurrency(fine, currency)}
                        </span>
                      </li>
                      <li className="flex justify-between gap-3">
                        <span className="text-text-muted">Installment</span>
                        <span className="font-medium text-text">
                          {fmtCurrency(installment, currency)}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
                <div className="mt-2.5 border-t border-border pt-2.5">
                  <div className="flex justify-between gap-3 text-base font-bold text-text">
                    <span>Total due</span>
                    <span className="tabular-nums">{fmtCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              {allowPartial && (
                <div className="space-y-1.5">
                  <Label htmlFor="dep-amount">Amount to pay</Label>
                  <Input
                    id="dep-amount"
                    type="number"
                    min={0.01}
                    max={total}
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="border-border bg-secondary-2"
                  />
                  <p className="text-xs text-text-muted">Partial payments are allowed for this group.</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 border-2",
                      method === "MTN_MOMO"
                        ? "border-primary text-primary"
                        : "border-border",
                    )}
                    onClick={() => setMethod("MTN_MOMO")}
                  >
                    MTN MoMo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 border-2",
                      method === "MANUAL_TRANSFER"
                        ? "border-primary text-primary"
                        : "border-border",
                    )}
                    onClick={() => setMethod("MANUAL_TRANSFER")}
                  >
                    Manual transfer
                  </Button>
                </div>
              </div>

              {method === "MTN_MOMO" && (
                <div className="space-y-1.5">
                  <Label htmlFor="dep-phone">MoMo phone number</Label>
                  <Input
                    id="dep-phone"
                    type="tel"
                    placeholder="+250 788 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-border bg-secondary-2"
                    autoComplete="tel"
                  />
                  <p className="text-xs text-text-muted">
                    Payment is saved as confirmed and your contribution balance updates right away. When
                    the MTN API is connected, a prompt can be sent to this number to complete the
                    payment on the phone.
                  </p>
                </div>
              )}

              {method === "MANUAL_TRANSFER" && (
                <div className="space-y-1.5">
                  <Label htmlFor="dep-proof">Payment proof</Label>
                  <Input
                    id="dep-proof"
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    className="border-border bg-secondary-2 file:me-2 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-sm"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setProofFile(f);
                    }}
                  />
                  <p className="text-xs text-text-muted">
                    Upload a clear screenshot or photo of your transfer receipt. An admin will verify
                    it before your balance is updated.
                  </p>
                </div>
              )}

              <Button
                type="button"
                className="h-12 w-full font-semibold"
                onClick={() => void handlePay()}
                disabled={createDeposit.isPending || uploading || total <= 0}
              >
                {createDeposit.isPending || uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Pay ${fmtCurrency(allowPartial ? payAmount : total, currency)}`
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
