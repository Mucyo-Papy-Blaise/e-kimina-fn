"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  completePasswordReset,
  fetchProfile,
  forgotPassword,
  login,
  register,
  resendVerification,
  verifyEmail,
  verifyResetOtp,
} from "@/lib/api/auth-api";
import { tokenStorage } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/query-client";
import type {
  AuthResponse,
  CompletePasswordResetRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  ResendVerificationRequest,
  VerifyEmailRequest,
  VerifyResetOtpRequest,
} from "@/types/auth";
import { authKeys } from "./auth-keys";
import { useHasStoredToken } from "./use-token-state";

export function useProfileQuery() {
  const hasToken = useHasStoredToken();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: authKeys.profile(),
    queryFn: fetchProfile,
    enabled: hasToken,
  });

  useEffect(() => {
    const err = query.error;
    if (err instanceof ApiError && err.status === 401) {
      tokenStorage.remove();
      queryClient.removeQueries({ queryKey: authKeys.profile() });
    }
  }, [query.error, queryClient]);

  return query;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: (data: AuthResponse) => {
      tokenStorage.set(data.accessToken);
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: (data: RegisterResult) => {
      if ("accessToken" in data && data.accessToken) {
        tokenStorage.set(data.accessToken);
        queryClient.setQueryData(authKeys.profile(), data.user);
      }
    },
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: VerifyEmailRequest) => verifyEmail(body),
    onSuccess: (data: AuthResponse) => {
      tokenStorage.set(data.accessToken);
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (body: ResendVerificationRequest) =>
      resendVerification(body),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => forgotPassword(body),
  });
}

export function useVerifyResetOtpMutation() {
  return useMutation({
    mutationFn: (body: VerifyResetOtpRequest) => verifyResetOtp(body),
  });
}

export function useCompletePasswordResetMutation() {
  return useMutation({
    mutationFn: (body: CompletePasswordResetRequest) =>
      completePasswordReset(body),
  });
}
