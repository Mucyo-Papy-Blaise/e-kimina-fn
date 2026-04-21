"use client";

import { toast } from "sonner";
import {
  AuthToastCard,
  type AuthToastVariant,
} from "@/components/ui/auth-toast-card";

export type ShowAuthToastInput = {
  variant: AuthToastVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

export function showAuthToast({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  duration = 6500,
}: ShowAuthToastInput): string | number {
  return toast.custom(
    (id) => (
      <AuthToastCard
        toastId={id}
        variant={variant}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    ),
    {
      duration,
      /** Card supplies its own surface; strip Sonner wrapper so we do not double borders. */
      unstyled: true,
      className: "!p-0 !bg-transparent !border-0 !shadow-none",
    },
  );
}

export function toastLoginSuccess(action?: () => void): void {
  showAuthToast({
    variant: "success",
    title: "Signed in",
    description: "Welcome back — your session is ready.",
    actionLabel: action ? "Continue" : undefined,
    onAction: action,
  });
}

export function toastRegisterSuccess(action?: () => void): void {
  showAuthToast({
    variant: "success",
    title: "Account created",
    description: "You are signed in and can start using the workspace.",
    actionLabel: action ? "Get started" : undefined,
    onAction: action,
  });
}

export function toastSignedOut(): void {
  showAuthToast({
    variant: "info",
    title: "Signed out",
    description: "You have been logged out. See you soon.",
  });
}

export function toastAuthError(message: string): void {
  showAuthToast({
    variant: "error",
    title: "Something went wrong",
    description: message,
    duration: 9000,
  });
}
