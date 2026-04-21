"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { useInviteMemberMutation } from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { cn } from "@/utils/cn";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

const inputClassName =
  "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
};

export function InviteMemberDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
}: InviteMemberDialogProps) {
  const mutation = useInviteMemberMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ email: "" });
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await mutation.mutateAsync({
        groupId,
        email: values.email.trim(),
      });
      toast.success(res.message);
      onOpenChange(false);
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Could not send invitation.";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(100%,26rem)] border-border bg-bg p-0 text-text shadow-[var(--shadow-md)]",
        )}
      >
        <DialogHeader className="space-y-2 border-b border-border px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="text-left text-xl font-semibold tracking-tight text-text">
            Invite team member
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-text-muted">
            Send an email invitation to join <span className="font-medium text-text">{groupName}</span>.
            If they already have an account, they are added immediately. New users get a link to register;
            once they complete sign-up, their account is active and they are part of the group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="px-5 pb-5 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-text">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="member@example.com"
                className={`${inputClassName} pl-10`}
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full border-border sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
