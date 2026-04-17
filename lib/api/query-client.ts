import {
  type DefaultOptions,
  QueryClient,
} from "@tanstack/react-query";
import type { JsonValue } from "@/types/json";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: JsonValue,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status))
        return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  },
  mutations: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});
