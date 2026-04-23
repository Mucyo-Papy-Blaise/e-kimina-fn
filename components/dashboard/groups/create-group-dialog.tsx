"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { useCreateGroupMutation } from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import {
  createGroupFormSchema,
  type CreateGroupFormValues,
} from "@/lib/schemas/group-schema";
import { cn } from "@/utils/cn";

const STEP1_FIELDS = ["name", "description", "maxMembers"] as const;

const inputClassName =
  "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

const defaultValues: CreateGroupFormValues = {
  name: "",
  description: "",
  maxMembers: 30,
  treasurerEmail: "",
};

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [step, setStep] = useState(0);
  const createMutation = useCreateGroupMutation();

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues,
  });

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStep(0);
      form.reset(defaultValues);
    }
    onOpenChange(next);
  };

  const goNext = async () => {
    const ok = await form.trigger([...STEP1_FIELDS]);
    if (ok) setStep(1);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        isPublic: false,
        maxMembers: values.maxMembers,
        treasurerEmail: values.treasurerEmail.trim().toLowerCase(),
      });
      toast.success("Group created", {
        description:
          "New groups are private. Your treasurer was added or invited by email. Invite more members from My groups. Loan tools unlock after platform verification.",
      });
      handleOpenChange(false);
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Could not create the group.";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          "flex max-h-[min(92dvh,44rem)] w-[min(100%,26rem)] flex-col gap-0 overflow-hidden border-border bg-bg p-0 text-text shadow-[var(--shadow-md)] sm:max-w-lg",
        )}
      >
        <DialogHeader className="space-y-3 border-b border-border px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-left text-xl font-semibold tracking-tight text-text">
              Create a group
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-text-muted"
              aria-label="Close"
              onClick={() => handleOpenChange(false)}
            >
              ×
            </Button>
          </div>
          <DialogDescription className="text-left text-sm text-text-muted">
            Two quick steps: group details, then invite your treasurer by email. If they do not have an
            account yet, they will receive a link to register and become treasurer.
          </DialogDescription>
          <ol className="flex gap-2" aria-label="Steps">
            {[0, 1].map((i) => (
              <li
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-(--transition)",
                  step === i ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </ol>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Step {step + 1} of 2 · {step === 0 ? "Group info" : "Treasurer"}
          </p>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4 sm:px-6">
            {step === 0 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="cg-name" className="text-text">
                    Group name
                  </Label>
                  <Input
                    id="cg-name"
                    className={inputClassName}
                    placeholder="e.g. Umurenge savings circle"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cg-desc" className="text-text">
                    Description <span className="font-normal text-text-muted">(optional)</span>
                  </Label>
                  <Textarea
                    id="cg-desc"
                    className={cn(inputClassName, "min-h-[88px] resize-y")}
                    placeholder="Purpose, meeting rhythm, rules…"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cg-max" className="text-text">
                    Max members
                  </Label>
                  <Input
                    id="cg-max"
                    type="number"
                    min={2}
                    step={1}
                    className={inputClassName}
                    {...form.register("maxMembers", { valueAsNumber: true })}
                  />
                  {form.formState.errors.maxMembers ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.maxMembers.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-text-muted">
                  The treasurer manages funds alongside you. Enter their email: if they already use
                  E-Kimina, they are added immediately; otherwise they get an invitation to register
                  and their account stays inactive until they complete sign-up from the link.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cg-treasurer" className="text-text">
                    Treasurer email
                  </Label>
                  <Input
                    id="cg-treasurer"
                    type="email"
                    autoComplete="email"
                    className={inputClassName}
                    placeholder="treasurer@example.com"
                    {...form.register("treasurerEmail")}
                  />
                  {form.formState.errors.treasurerEmail ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.treasurerEmail.message}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-(--radius-sm) border border-border bg-secondary/80 px-3 py-2.5 text-xs text-text-muted">
                  You stay <span className="font-medium text-text">Group admin</span>. Min members
                  must cover at least you and the treasurer.
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex-col gap-2 border-t border-border bg-bg px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
            {step === 0 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border sm:w-auto"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="button" className="w-full gap-1 sm:w-auto" onClick={() => void goNext()}>
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-1 border-border sm:w-auto"
                  onClick={() => setStep(0)}
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full gap-2 sm:w-auto"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create group"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
