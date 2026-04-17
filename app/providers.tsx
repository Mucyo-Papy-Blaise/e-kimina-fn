"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { defaultQueryOptions } from "@/lib/query/query-client";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { AppToaster } from "@/components/ui/app-toaster";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions.queries,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
      mutations: defaultQueryOptions.mutations,
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
        <AppToaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
