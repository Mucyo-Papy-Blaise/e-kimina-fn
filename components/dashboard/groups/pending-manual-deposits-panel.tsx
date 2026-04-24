"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import {
  useConfirmManualDepositMutation,
  usePendingManualDepositsQuery,
  useRejectManualDepositMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { cn } from "@/utils/cn";
import type { PendingManualDeposit } from "@/types/group-finance";

type PendingManualDepositsPanelProps = {
  groupId: string;
};

function fmt(n: number, c: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c.length === 3 ? c : "RWF",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${c}`;
  }
}

export function PendingManualDepositsPanel({ groupId }: PendingManualDepositsPanelProps) {
  const query = usePendingManualDepositsQuery(groupId, true);
  const confirmM = useConfirmManualDepositMutation();
  const rejectM = useRejectManualDepositMutation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState<PendingManualDeposit | null>(null);
  const [reason, setReason] = useState("");

  const list = query.data ?? [];
  const current = list.find((d) => d.id === openId) ?? null;

  const onConfirm = async (d: PendingManualDeposit) => {
    try {
      const res = await confirmM.mutateAsync({ groupId, depositId: d.id });
      toast.success(res.message);
      setOpenId(null);
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Could not confirm",
      );
    }
  };

  const onReject = async () => {
    if (!rejectOpen) return;
    try {
      const r = reason.trim() || undefined;
      const res = await rejectM.mutateAsync({
        groupId,
        depositId: rejectOpen.id,
        reason: r,
      });
      toast.success(res.message);
      setRejectOpen(null);
      setReason("");
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Could not reject",
      );
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-(--radius) border border-border bg-secondary/40 px-4 py-3 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin" />
        Loading payment reviews…
      </div>
    );
  }
  if (query.isError) {
    return (
      <p className="text-sm text-text-muted">
        {query.error?.message ?? "Could not load pending payments."}
      </p>
    );
  }
  if (list.length === 0) {
    return null;
  }

  return (
    <section className="rounded-(--radius) border border-border bg-bg px-4 py-4 sm:px-5">
      <h3 className="text-base font-semibold text-text">Manual payments to verify (group admin)</h3>
      <p className="mt-1 text-sm text-text-muted">
        When a member pays by bank transfer, group admins are notified by email. Open each proof, then
        confirm or reject. MTN MoMo payments are confirmed automatically when recorded and do not appear
        here. Reject can include an optional message to the member.
      </p>
      <ul className="mt-3 space-y-2">
        {list.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 text-sm">
              <p className="font-medium text-text">{d.member.fullName}</p>
              <p className="truncate text-text-muted">{d.member.email}</p>
              <p className="mt-0.5 tabular-nums text-text">
                {fmt(d.amount, d.currency)} · {new Date(d.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenId(d.id)}
                className="border-border"
              >
                View proof
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-primary"
                onClick={() => void onConfirm(d)}
                disabled={confirmM.isPending}
              >
                {confirmM.isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirm"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setReason("");
                  setRejectOpen(d);
                }}
                disabled={rejectM.isPending}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={openId != null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-lg border-border bg-bg">
          <DialogHeader>
            <DialogTitle>Payment proof</DialogTitle>
            <DialogDescription>
              {current ? (
                <>
                  {current.member.fullName} · {fmt(current.amount, current.currency)}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {current?.proofImageUrl && (
            <a
              href={current.proofImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary"
            >
              Open full size <ExternalLink className="size-3.5" />
            </a>
          )}
          {current?.proofImageUrl && (
            <div
              className={cn(
                "max-h-[min(60vh,28rem)] overflow-auto rounded-md border border-border bg-secondary",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic proof URL from storage */}
              <img
                src={current.proofImageUrl}
                alt="Payment proof"
                className="h-auto w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectOpen != null}
        onOpenChange={(o) => {
          if (!o) {
            setRejectOpen(null);
            setReason("");
          }
        }}
      >
        <DialogContent className="max-w-md border-border bg-bg">
          <DialogHeader>
            <DialogTitle>Reject this payment?</DialogTitle>
            <DialogDescription>
              The member will receive a rejection email. You may add a short reason below — it is included
              in that email and in the audit copy to other super admins.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason (shown to the member), e.g. amount does not match the transfer proof"
            className="min-h-[100px] border-border bg-secondary-2"
            aria-label="Optional rejection message for the member"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectOpen(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onReject()}
              disabled={rejectM.isPending}
            >
              {rejectM.isPending ? <Loader2 className="size-4 animate-spin" /> : "Send rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
