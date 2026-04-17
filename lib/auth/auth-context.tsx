"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { tokenStorage } from "@/lib/api/api-client";
import type { UserResponse } from "@/types/auth";
import { authKeys } from "./auth-keys";
import { useProfileQuery } from "./auth-queries";
import { useHasStoredToken } from "./use-token-state";

type AuthContextValue = {
  user: UserResponse | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = useHasStoredToken();
  const { data: user, isError } = useProfileQuery();

  const logout = useCallback(() => {
    tokenStorage.remove();
    queryClient.removeQueries({ queryKey: authKeys.profile() });
  }, [queryClient]);

  /** True while we have a token but profile not loaded yet (refresh / new tab). */
  const isLoading = useMemo(() => {
    if (!hasToken) return false;
    if (isError) return false;
    return user === undefined;
  }, [hasToken, user, isError]);

  const value = useMemo<AuthContextValue>(() => {
    const authenticated = hasToken && !!user && !isError;
    return {
      user,
      isLoading,
      isAuthenticated: authenticated,
      logout,
    };
  }, [hasToken, user, isLoading, isError, logout]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
