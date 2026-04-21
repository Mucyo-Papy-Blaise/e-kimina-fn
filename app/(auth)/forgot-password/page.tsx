"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { toastAuthError } from "@/lib/auth-toast";
import { useForgotPasswordMutation } from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";
import { forgotPasswordRequestSchema } from "@/types/auth-schema";
import type { z } from "zod";

type ForgotFormValues = z.infer<typeof forgotPasswordRequestSchema>;

const STEPS = [
  { id: "reset", label: "Reset password" },
  { id: "email", label: "Check your email" },
] as const;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const mutation = useForgotPasswordMutation();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: "" },
  });

  const inputClassName =
    "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await mutation.mutateAsync(values);
      toast.success(res.message);
      router.push(
        `/reset-password?email=${encodeURIComponent(values.email.trim().toLowerCase())}`,
      );
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Something went wrong.";
      toastAuthError(message);
      form.setError("root", { message });
    }
  });

  return (
    <AuthSplitLayout
      title={
        <>
          Forgot
          <br />
          password
        </>
      }
      subtitle=""
      steps={STEPS}
      activeStepIndex={0}
    >
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-md flex-col gap-8"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-text">
            Reset link &amp; code
          </h2>
          <p className="text-sm text-text-muted">
            Enter your account email. We will send a 6-digit code and you can set a new password on the next step.
          </p>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="fp-email" className="text-sm font-medium text-text">
            Email
          </Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-text py-3 text-sm font-semibold text-bg transition duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending ? "Sending…" : "Send reset instructions"}
        </Button>

        <p className="text-center text-sm text-text-muted">
          <Link href="/login" className="font-semibold text-text transition duration-150 hover:opacity-90">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}
