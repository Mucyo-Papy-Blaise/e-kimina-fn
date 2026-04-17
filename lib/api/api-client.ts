import type { JsonObject, JsonValue } from "@/types/json";
import { messageFromErrorJson } from "@/types/http";
import { ApiError } from "./query-client";

/** Nest global prefix is `api` → e.g. `http://localhost:4000/api` + `/auth/login`. */
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "lms_token";
const TOKEN_EVENT = "lms:token-changed";

function notifyTokenChange(hasToken: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<boolean>(TOKEN_EVENT, { detail: hasToken }));
}

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    notifyTokenChange(true);
  },
  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    notifyTokenChange(false);
  },
};

export { TOKEN_EVENT };

async function readJsonBody(res: Response): Promise<JsonValue | undefined> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return undefined;
  }
}

async function request(
  method: string,
  path: string,
  body?: JsonObject,
): Promise<JsonValue | undefined> {
  const token = tokenStorage.get();

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await readJsonBody(res);
    const fallback = `Request failed with status ${res.status}`;
    const message =
      data !== undefined && data !== null
        ? messageFromErrorJson(data) ?? fallback
        : fallback;
    throw new ApiError(res.status, message, data);
  }

  return readJsonBody(res);
}

export const apiClient = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: JsonObject) => request("POST", path, body),
  put: (path: string, body: JsonObject) => request("PUT", path, body),
  patch: (path: string, body: JsonObject) => request("PATCH", path, body),
  delete: (path: string) => request("DELETE", path),
  async postFormData(path: string, formData: FormData): Promise<JsonValue> {
    const token = tokenStorage.get();
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const data = await readJsonBody(res);
      const fallback = `Upload failed: ${res.status}`;
      const message =
        data !== undefined && data !== null
          ? messageFromErrorJson(data) ?? fallback
          : fallback;
      throw new ApiError(res.status, message, data);
    }
    const parsed = await readJsonBody(res);
    if (parsed === undefined || parsed === null) {
      throw new ApiError(res.status, "Empty response", null);
    }
    return parsed;
  },
};

export { BASE_URL };
