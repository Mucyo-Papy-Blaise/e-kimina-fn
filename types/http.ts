import type { JsonObject, JsonValue } from "./json";

/** Typical NestJS `HttpException` JSON body (validation errors use `message: string[]`). */
export interface HttpExceptionBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** Best-effort message from a failed response JSON body. */
export function messageFromErrorJson(data: JsonValue): string | null {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const o = data as JsonObject;
    if (
      typeof o.statusCode === "number" &&
      (typeof o.message === "string" || Array.isArray(o.message))
    ) {
      const { message } = o;
      if (Array.isArray(message)) {
        return message.filter((m): m is string => typeof m === "string").join(" ");
      }
      return message;
    }
    if ("message" in o && typeof o.message === "string") {
      return o.message;
    }
  }
  return null;
}
