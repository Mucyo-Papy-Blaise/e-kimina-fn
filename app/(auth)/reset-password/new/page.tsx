"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { PASSWORD_RESET_TOKEN_KEY } from "@/lib/auth/password-reset-token";
import { toastAuthError } from "@/lib/auth-toast";
import { useCompletePasswordResetMutation } from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";

const newPasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

const STEPS = [
  { id: "code", label: "Code verified" },
  { id: "new", label: "New password" },
] as const;

export default function ResetPasswordNewPage() {
  const router = useRouter();
  const mutation = useCompletePasswordResetMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setSessionChecked(true);
    if (typeof sessionStorage === "undefined") {
      toastAuthError("Start again from forgot password.");
      router.replace("/forgot-password");
      return;
    }
    const t = sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY);
    if (!t) {
      toastAuthError("Start again from forgot password.");
      router.replace("/forgot-password");
      return;
    }
    setResetToken(t);
  }, [router]);

  const inputClassName =
    "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

  const onSubmit = form.handleSubmit(async (values) => {
    if (!resetToken) {
      return;
    }
    try {
      const res = await mutation.mutateAsync({
        resetToken,
        password: values.password,
      });
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
      }
      toast.success(res.message);
      router.push("/login");
      router.refresh();
    } catch (e) {
      const message =
        e instanceof ApiError || e instanceof Error
          ? getApiErrorMessage(e)
          : "Could not update password.";
      toastAuthError(message);
      form.setError("root", { message });
    }
  });

  if (!sessionChecked || resetToken === null) {
    return (
      <AuthSplitLayout title={<>New password</>} subtitle="" steps={STEPS} activeStepIndex={1}>
        <p className="text-sm text-text-muted">Loading…</p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title={
        <>
          New
          <br />
          password
        </>
      }
      subtitle=""
      steps={STEPS}
      activeStepIndex={1}
    >
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-md flex-col gap-8"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-text">Choose a new password</h2>
          <p className="text-sm text-text-muted">
            After saving, sign in again with your email and new password.
          </p>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="np-pass" className="text-sm font-medium text-text">
              New password
            </Label>
            <div className="relative">
              <Input
                id="np-pass"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`${inputClassName} pr-10`}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition duration-150 hover:text-text"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="np-confirm" className="text-sm font-medium text-text">
              Confirm password
            </Label>
            <Input
              id="np-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={inputClassName}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-text py-3 text-sm font-semibold text-bg transition duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending ? "Saving…" : "Update password"}
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
