"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GroupMemberRow } from "@/types/group";

type MemberAction = "remove" | "suspend";

type MemberActionDialogProps = {
  open: boolean;
  memberAction: MemberAction | null;
  actionTarget: GroupMemberRow | null;
  actionReason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

export function MemberActionDialog({
  open,
  memberAction,
  actionReason,
  onReasonChange,
  onConfirm,
  onCancel,
  isPending,
}: MemberActionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent className="border-border bg-bg text-text sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {memberAction === "remove"
              ? "Remove member"
              : "Suspend member in this group"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-muted">
          They will be notified with the reason below. Their platform login is
          unchanged.
        </p>
        <div className="space-y-1">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            value={actionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Explain why (shown to the member)"
            className="min-h-25 border-border bg-secondary-2"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={memberAction === "remove" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending || actionReason.trim().length < 3}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
