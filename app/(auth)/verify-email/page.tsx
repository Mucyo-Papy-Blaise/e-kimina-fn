"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { toastAuthError } from "@/lib/auth-toast";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";
import { verifyEmailRequestSchema } from "@/types/auth-schema";
import type { z } from "zod";

type VerifyEmailFormValues = z.infer<typeof verifyEmailRequestSchema>;

const STEPS = [
  { id: "verify", label: "Verify your email" },
  { id: "done", label: "You are in" },
] as const;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailRequestSchema),
    defaultValues: { email: emailParam, otp: "" },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam);
    }
  }, [emailParam, form]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const inputClassName =
    "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await verifyMutation.mutateAsync(values);
      toast.success("Email verified", { description: "Welcome to E-Kimina." });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Verification failed.";
      toastAuthError(message);
      form.setError("root", { message });
    }
  });

  const onResend = async () => {
    const email = form.getValues("email").trim();
    if (!email) {
      toastAuthError("Enter your email first.");
      return;
    }
    try {
      await resendMutation.mutateAsync({ email });
      toast.success("If your account needs verification, we sent a new code.");
      setCooldown(60);
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Could not resend.";
      toastAuthError(message);
    }
  };

  return (
    <AuthSplitLayout
      title={
        <>
          Verify
          <br />
          your email
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
            Enter the code
          </h2>
          <p className="text-sm text-text-muted">
            We sent a 6-digit code to your email. Enter it below to activate your account.
          </p>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ve-email" className="text-sm font-medium text-text">
              Email
            </Label>
            <Input
              id="ve-email"
              type="email"
              autoComplete="email"
              className={inputClassName}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text">6-digit code</Label>
            <Controller
              control={form.control}
              name="otp"
              render={({ field }) => (
                <OTPInput
                  numericOnly
                  value={field.value}
                  onChange={field.onChange}
                  disabled={verifyMutation.isPending}
                  aria-label="Email verification code"
                />
              )}
            />
            {form.formState.errors.otp ? (
              <p className="text-xs text-destructive">{form.formState.errors.otp.message}</p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          disabled={verifyMutation.isPending}
          className="w-full rounded-md bg-text py-3 text-sm font-semibold text-bg transition duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {verifyMutation.isPending ? "Verifying…" : "Verify & continue"}
        </Button>

        <div className="flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            disabled={resendMutation.isPending || cooldown > 0}
            onClick={() => void onResend()}
            className="font-medium text-primary transition duration-150 hover:text-primary/80 disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
          </button>
          <Link
            href="/login"
            className="text-text-muted transition duration-150 hover:text-text"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthSplitLayout title={<>Verify</>} subtitle="" steps={STEPS} activeStepIndex={0}>
          <p className="text-sm text-text-muted">Loading…</p>
        </AuthSplitLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
