import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth";
import {
  authResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  userResponseSchema,
} from "@/types/auth-schema";
import { API_AUTH_PATHS } from "@/types/api-paths";
import type { JsonObject, JsonValue } from "@/types/json";
import { apiClient } from "./api-client";

function ensureJsonObject(
  raw: JsonValue | undefined,
  context: string,
): JsonValue {
  if (raw === undefined || raw === null) {
    throw new Error(`${context}: empty response body.`);
  }
  return raw;
}

function registerBody(payload: RegisterRequest): JsonObject {
  const body: JsonObject = {
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
  };
  if (payload.phoneNumber !== undefined) {
    body.phoneNumber = payload.phoneNumber;
  }
  if (payload.image !== undefined) {
    body.image = payload.image;
  }
  return body;
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const payload = loginRequestSchema.parse(body);
  const requestBody: JsonObject = {
    email: payload.email,
    password: payload.password,
  };
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.login, requestBody),
    "login",
  );
  return authResponseSchema.parse(raw);
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const payload = registerRequestSchema.parse(body);
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.register, registerBody(payload)),
    "register",
  );
  return authResponseSchema.parse(raw);
}

export async function fetchProfile(): Promise<UserResponse> {
  const raw = ensureJsonObject(
    await apiClient.get(API_AUTH_PATHS.profile),
    "fetchProfile",
  );
  return userResponseSchema.parse(raw);
}
