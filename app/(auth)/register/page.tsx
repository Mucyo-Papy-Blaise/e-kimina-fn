"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { fetchTreasurerInvitationPreview } from "@/lib/api/auth-api";
import { toast } from "sonner";
import { toastAuthError, toastRegisterSuccess } from "@/lib/auth-toast";
import { useRegisterMutation } from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";
import type { RegisterRequest, RegisterResult } from "@/types/auth";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/types/auth-schema";

const STEPS = [
  { id: "signup", label: "Sign up your account" },
  { id: "workspace", label: "Set up your workspace" },
  { id: "profile", label: "Set up your profile" },
] as const;

function toRegisterRequest(
  values: RegisterFormValues,
  invitationToken: string | null,
): RegisterRequest {
  const base: RegisterRequest = {
    email: values.email.trim().toLowerCase(),
    password: values.password,
    fullName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
  };
  if (invitationToken) {
    return { ...base, invitationToken };
  }
  return base;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitation");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteEmailLocked, setInviteEmailLocked] = useState(false);
  /** False until we know whether `invitation` query param is valid (or absent). */
  const [inviteResolved, setInviteResolved] = useState(false);
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!invitationToken) {
      setInviteEmailLocked(false);
      setInviteResolved(true);
      return;
    }
    let cancelled = false;
    void fetchTreasurerInvitationPreview(invitationToken)
      .then((r) => {
        if (!cancelled) {
          form.setValue("email", r.email);
          setInviteEmailLocked(true);
          setInviteResolved(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toastAuthError("Invalid or expired invitation link.");
          setInviteEmailLocked(false);
          setInviteResolved(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [invitationToken, form]);

  const inputClassName =
    "rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result: RegisterResult = await registerMutation.mutateAsync(
        toRegisterRequest(
          values,
          inviteEmailLocked ? invitationToken : null,
        ),
      );
      if ("needsEmailVerification" in result && result.needsEmailVerification) {
        toast.success("Check your email", {
          description: "Enter the 6-digit code to verify your account.",
        });
        router.push(
          `/verify-email?email=${encodeURIComponent(result.email)}`,
        );
        return;
      }
      toastRegisterSuccess();
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      let message = "Something went wrong. Please try again.";
      if (e instanceof ApiError || e instanceof Error) {
        message = getApiErrorMessage(e);
      }
      toastAuthError(message);
      form.setError("root", { message });
    }
  });

  return (
    <AuthSplitLayout
      title={
        <>
          Get Started
          <br />
          with Us
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
          <h2 className="text-3xl font-bold tracking-tight text-text">Sign Up Account</h2>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-text">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="eg. John"
                className={inputClassName}
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName ? (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-text">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="eg. Francisco"
                className={inputClassName}
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName ? (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-text">
              Email
            </Label>
            {invitationToken && !inviteResolved ? (
              <p className="text-xs text-text-muted">Loading invitation…</p>
            ) : null}
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="eg. johnfrans@gmail.com"
              className={inputClassName}
              readOnly={Boolean(invitationToken && inviteEmailLocked)}
              aria-readonly={invitationToken && inviteEmailLocked ? true : undefined}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-text">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password"
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
            <p className="text-xs text-text-muted">Must be at least 8 characters.</p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            registerMutation.isPending ||
            Boolean(invitationToken && !inviteResolved)
          }
          className="w-full rounded-md bg-text py-3 text-sm font-semibold text-bg transition duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating account…" : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-text transition duration-150 hover:opacity-90">
            Log in
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthSplitLayout
          title={
            <>
              Get Started
              <br />
              with Us
            </>
          }
          subtitle=""
          steps={STEPS}
          activeStepIndex={0}
        >
          <p className="text-sm text-text-muted">Loading…</p>
        </AuthSplitLayout>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
