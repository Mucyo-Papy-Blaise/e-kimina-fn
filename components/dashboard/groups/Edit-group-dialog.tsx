"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  editDesc: string;
  onNameChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSave: () => void;
  isPending: boolean;
};

export function EditGroupDialog({
  open,
  onOpenChange,
  editName,
  editDesc,
  onNameChange,
  onDescChange,
  onSave,
  isPending,
}: EditGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-bg text-text sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="eg-name">Name</Label>
            <Input
              id="eg-name"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              className="border-border bg-secondary-2"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="eg-desc">Description</Label>
            <Textarea
              id="eg-desc"
              value={editDesc}
              onChange={(e) => onDescChange(e.target.value)}
              className="min-h-25 border-border bg-secondary-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
