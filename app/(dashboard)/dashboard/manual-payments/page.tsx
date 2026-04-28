"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { fetchGroup } from "@/lib/api/groups-api";
import { groupKeys } from "@/lib/query/group-keys";
import {
  useConfirmManualDepositMutation,
  useGroupQuery,
  useGroupsQuery,
  usePendingManualDepositsQuery,
  useRejectManualDepositMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { ROLE } from "@/types/enum";
import type { PendingManualDeposit } from "@/types/group-finance";

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

function canReview(role?: string) {
  return role === ROLE.GROUP_ADMIN || role === ROLE.TREASURER;
}

export default function ManualPaymentsPage() {
  const groupsQ = useGroupsQuery("mine");
  const [chosenGroupId, setChosenGroupId] = useState("");
  const [proofOpenId, setProofOpenId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState<PendingManualDeposit | null>(null);
  const [reason, setReason] = useState("");

  const roleDetailsQueries = useQueries({
    queries: (groupsQ.data ?? []).map((g) => ({
      queryKey: groupKeys.detail(g.id),
      queryFn: () => fetchGroup(g.id),
      enabled: Boolean(groupsQ.data?.length),
    })),
  });

  const manageableGroupIds = useMemo(() => {
    const out = new Set<string>();
    for (const q of roleDetailsQueries) {
      if (canReview(q.data?.myRole)) out.add(q.data.id);
    }
    return out;
  }, [roleDetailsQueries]);

  const manageableGroups = useMemo(
    () => (groupsQ.data ?? []).filter((g) => manageableGroupIds.has(g.id)),
    [groupsQ.data, manageableGroupIds],
  );

  const groupId = useMemo(() => {
    if (chosenGroupId && manageableGroups.some((g) => g.id === chosenGroupId)) {
      return chosenGroupId;
    }
    return manageableGroups[0]?.id ?? "";
  }, [chosenGroupId, manageableGroups]);

  const groupQ = useGroupQuery(groupId, Boolean(groupId));
  const pendingQ = usePendingManualDepositsQuery(
    groupId,
    Boolean(groupId) && canReview(groupQ.data?.myRole),
  );
  const confirmM = useConfirmManualDepositMutation();
  const rejectM = useRejectManualDepositMutation();

  const canTakeAction = groupQ.data?.myRole === ROLE.TREASURER;
  const list = pendingQ.data ?? [];
  const current = list.find((d) => d.id === proofOpenId) ?? null;

  const onConfirm = async (d: PendingManualDeposit) => {
    try {
      const res = await confirmM.mutateAsync({ groupId, depositId: d.id });
      toast.success(res.message);
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Could not confirm",
      );
    }
  };

  const onReject = async () => {
    if (!rejectOpen) return;
    try {
      const res = await rejectM.mutateAsync({
        groupId,
        depositId: rejectOpen.id,
        reason: reason.trim() || undefined,
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

  if (groupsQ.isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-bg-muted/30">
        <Loader2 className="size-8 animate-spin text-text-muted" />
      </main>
    );
  }

  if (groupsQ.isError || !groupsQ.data) {
    return (
      <main className="min-h-screen bg-bg-muted/30 py-6">
        <div className="container mx-auto max-w-5xl px-4">
          <p className="text-destructive">{groupsQ.error?.message ?? "Could not load your groups."}</p>
        </div>
      </main>
    );
  }

  if (manageableGroups.length === 0) {
    return (
      <main className="min-h-screen bg-bg-muted/30 py-6">
        <div className="container mx-auto max-w-5xl px-4 text-text-muted">
          You do not have manual-payment review access in any group. Only{" "}
          <span className="font-medium text-text">GROUP_ADMIN</span> and{" "}
          <span className="font-medium text-text">TREASURER</span> can open this page.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-muted/30 py-6">
      <div className="container mx-auto max-w-5xl space-y-6 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Manual payments</h1>
            <p className="mt-1 text-sm text-text-muted">
              Review manual transfer proofs by group. Group admins can view proofs; only treasurers can approve or reject.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-1.5">
            <Label htmlFor="mp-group" className="text-xs text-text-muted">
              Group
            </Label>
            <Select value={groupId} onValueChange={setChosenGroupId}>
              <SelectTrigger id="mp-group" className="border-border bg-bg">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {manageableGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {groupQ.isLoading || pendingQ.isLoading ? (
          <div className="flex items-center gap-2 rounded-(--radius) border border-border bg-bg px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" />
            Loading manual payments…
          </div>
        ) : null}

        {groupQ.isError ? <p className="text-destructive">{groupQ.error?.message}</p> : null}
        {pendingQ.isError ? <p className="text-destructive">{pendingQ.error?.message}</p> : null}

        {groupQ.isSuccess && pendingQ.isSuccess && (
          <>
            <div className="rounded-(--radius) border border-border bg-bg px-4 py-3 text-sm text-text-muted">
              Your role in this group: <span className="font-medium text-text">{groupQ.data.myRole}</span>.
              {canTakeAction
                ? " You can approve or reject these manual payments."
                : " You can view proofs, but only the treasurer can approve or reject."}
            </div>

            {list.length === 0 ? (
              <div className="rounded-(--radius) border border-border bg-bg p-8 text-center text-text-muted">
                No pending manual payments in this group.
              </div>
            ) : (
              <ul className="space-y-3">
                {list.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col gap-3 rounded-(--radius) border border-border bg-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-text">{d.member.fullName}</p>
                      <p className="truncate text-text-muted">{d.member.email}</p>
                      <p className="mt-1 tabular-nums text-text">
                        {fmt(d.amount, d.currency)} · {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setProofOpenId(d.id)}>
                        View proof
                      </Button>
                      {canTakeAction ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void onConfirm(d)}
                            disabled={confirmM.isPending}
                          >
                            {confirmM.isPending ? <Loader2 className="size-4 animate-spin" /> : "Approve"}
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
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Dialog open={proofOpenId != null} onOpenChange={(o) => !o && setProofOpenId(null)}>
        <DialogContent className="max-w-lg border-border bg-bg">
          <DialogHeader>
            <DialogTitle>Manual payment proof</DialogTitle>
            <DialogDescription>
              {current ? (
                <>
                  {current.member.fullName} · {fmt(current.amount, current.currency)}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {current?.proofImageUrl ? (
            <>
              <a
                href={current.proofImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary"
              >
                Open full size <ExternalLink className="size-3.5" />
              </a>
              <div className="max-h-[min(60vh,28rem)] overflow-auto rounded-md border border-border bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element -- stored proof URL */}
                <img src={current.proofImageUrl} alt="Payment proof" className="h-auto w-full object-contain" />
              </div>
            </>
          ) : null}
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
              The member will be notified with your reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason for rejection"
            className="min-h-[100px] border-border bg-secondary-2"
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
            <Button type="button" variant="destructive" onClick={() => void onReject()} disabled={rejectM.isPending}>
              {rejectM.isPending ? <Loader2 className="size-4 animate-spin" /> : "Send rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

