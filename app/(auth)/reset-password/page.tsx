"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { PASSWORD_RESET_TOKEN_KEY } from "@/lib/auth/password-reset-token";
import { toastAuthError } from "@/lib/auth-toast";
import { useVerifyResetOtpMutation } from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";
import { verifyResetOtpRequestSchema } from "@/types/auth-schema";
import { base64UrlDecode } from "@/utils/base64url";
import type { z } from "zod";

type ResetOtpFormValues = z.infer<typeof verifyResetOtpRequestSchema>;

const STEPS = [
  { id: "code", label: "Enter code" },
  { id: "new", label: "New password" },
] as const;

function ResetPasswordOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyMutation = useVerifyResetOtpMutation();

  const form = useForm<ResetOtpFormValues>({
    resolver: zodResolver(verifyResetOtpRequestSchema),
    defaultValues: { email: "", otp: "" },
  });

  useEffect(() => {
    const emailQ = searchParams.get("email");
    const otpQ = searchParams.get("otp");

    if (emailQ) {
      const raw = decodeURIComponent(emailQ);
      if (raw.includes("@")) {
        form.setValue("email", raw);
      } else {
        try {
          form.setValue("email", base64UrlDecode(emailQ));
        } catch {
          form.setValue("email", raw);
        }
      }
    }

    if (otpQ) {
      const raw = decodeURIComponent(otpQ);
      if (/^\d{6}$/.test(raw)) {
        form.setValue("otp", raw);
      } else {
        try {
          form.setValue("otp", base64UrlDecode(otpQ));
        } catch {
          form.setValue("otp", raw);
        }
      }
    }
  }, [searchParams, form]);

  const inputClassName =
    "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const { resetToken } = await verifyMutation.mutateAsync({
        email: values.email.trim().toLowerCase(),
        otp: values.otp,
      });
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, resetToken);
      }
      toast.success("Code verified", { description: "Choose a new password." });
      router.push("/reset-password/new");
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Verification failed.";
      toastAuthError(message);
      form.setError("root", { message });
    }
  });

  return (
    <AuthSplitLayout
      title={
        <>
          Reset
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
            Enter the code
          </h2>
          <p className="text-sm text-text-muted">
            We emailed you a 6-digit code. Enter it here, then you&apos;ll set a new password on the next step.
          </p>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="rp-email" className="text-sm font-medium text-text">
              Email
            </Label>
            <Input
              id="rp-email"
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
                  aria-label="One-time password"
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
          {verifyMutation.isPending ? "Checking…" : "Continue"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthSplitLayout title={<>Reset</>} subtitle="" steps={STEPS} activeStepIndex={0}>
          <p className="text-sm text-text-muted">Loading…</p>
        </AuthSplitLayout>
      }
    >
      <ResetPasswordOtpContent />
    </Suspense>
  );
}
