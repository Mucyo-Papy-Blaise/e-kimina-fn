"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { toastAuthError, toastLoginSuccess } from "@/lib/auth-toast";
import { useLoginMutation } from "@/lib/auth/auth-queries";
import { ApiError } from "@/lib/query/query-client";
import type { LoginRequest } from "@/types/auth";
import { loginRequestSchema } from "@/types/auth-schema";

const STEPS = [
  { id: "sign-in", label: "Sign in to your account" },
  { id: "workspace", label: "Access your workspace" },
  { id: "journey", label: "Continue your journey" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      toastLoginSuccess();
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
          Welcome
          <br />
          Back
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
          <h2 className="text-3xl font-bold tracking-tight text-text">Sign In</h2>
        </div>

        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-text">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="eg. johnfrans@gmail.com"
              className="rounded-md border-border bg-secondary-2 px-4 py-3 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-text">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary transition duration-150 hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="rounded-md border-border bg-secondary-2 px-4 py-3 pr-10 text-text placeholder:text-text-muted transition duration-150 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
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
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-text py-3 text-sm font-semibold text-bg transition duration-150 hover:opacity-90 disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in…" : "Sign In"}
        </Button>

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-text transition duration-150 hover:opacity-90">
            Create one
          </Link>
        </p>
        <p className="text-center text-sm text-text-muted">
          Need to verify your email?{" "}
          <Link href="/verify-email" className="font-semibold text-text transition duration-150 hover:opacity-90">
            Enter verification code
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}
