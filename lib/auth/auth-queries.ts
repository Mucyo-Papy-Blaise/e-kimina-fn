"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchProfile, login, register } from "@/lib/api/auth-api";
import { tokenStorage } from "@/lib/api/api-client";
import { ApiError } from "@/lib/api/query-client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
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
    onSuccess: (data: AuthResponse) => {
      tokenStorage.set(data.accessToken);
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
}
