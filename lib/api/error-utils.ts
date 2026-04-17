import { ApiError } from "@/lib/query/query-client";

export function getApiErrorMessage(error: ApiError | Error): string {
  return error.message;
}
