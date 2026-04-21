import { z } from "zod";
import type {
  AuthResponse,
  CompletePasswordResetRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  ResendVerificationRequest,
  UserResponse,
  VerifyEmailRequest,
  VerifyResetOtpRequest,
} from "@/types/auth";
import {
  authResponseSchema,
  completePasswordResetRequestSchema,
  loginRequestSchema,
  registerRequestSchema,
  registerResultSchema,
  userResponseSchema,
  verifyResetOtpRequestSchema,
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
  if (payload.invitationToken !== undefined) {
    body.invitationToken = payload.invitationToken;
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

export async function register(body: RegisterRequest): Promise<RegisterResult> {
  const payload = registerRequestSchema.parse(body);
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.register, registerBody(payload)),
    "register",
  );
  return registerResultSchema.parse(raw);
}

export async function verifyEmail(
  body: VerifyEmailRequest,
): Promise<AuthResponse> {
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.verifyEmail, {
      email: body.email.trim().toLowerCase(),
      otp: body.otp,
    }),
    "verifyEmail",
  );
  return authResponseSchema.parse(raw);
}

export async function resendVerification(
  body: ResendVerificationRequest,
): Promise<{ message: string }> {
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.resendVerification, {
      email: body.email.trim().toLowerCase(),
    }),
    "resendVerification",
  );
  return z.object({ message: z.string() }).parse(raw);
}

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<{ message: string }> {
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.forgotPassword, {
      email: body.email.trim().toLowerCase(),
    }),
    "forgotPassword",
  );
  return z.object({ message: z.string() }).parse(raw);
}

const verifyResetOtpResponseSchema = z.object({
  resetToken: z.string(),
});

export async function verifyResetOtp(
  body: VerifyResetOtpRequest,
): Promise<{ resetToken: string }> {
  const payload = verifyResetOtpRequestSchema.parse(body);
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.resetPasswordVerifyOtp, {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp,
    }),
    "verifyResetOtp",
  );
  return verifyResetOtpResponseSchema.parse(raw);
}

export async function completePasswordReset(
  body: CompletePasswordResetRequest,
): Promise<{ message: string }> {
  const payload = completePasswordResetRequestSchema.parse(body);
  const raw = ensureJsonObject(
    await apiClient.post(API_AUTH_PATHS.resetPasswordComplete, {
      resetToken: payload.resetToken,
      password: payload.password,
    }),
    "completePasswordReset",
  );
  return z.object({ message: z.string() }).parse(raw);
}

export async function fetchProfile(): Promise<UserResponse> {
  const raw = ensureJsonObject(
    await apiClient.get(API_AUTH_PATHS.profile),
    "fetchProfile",
  );
  return userResponseSchema.parse(raw);
}

const treasurerInvitationPreviewSchema = z.object({
  email: z.string().email(),
});

export async function fetchTreasurerInvitationPreview(
  token: string,
): Promise<{ email: string }> {
  const qs = new URLSearchParams({ token }).toString();
  const raw = ensureJsonObject(
    await apiClient.get(
      `${API_AUTH_PATHS.treasurerInvitationPreview}?${qs}`,
    ),
    "fetchTreasurerInvitationPreview",
  );
  return treasurerInvitationPreviewSchema.parse(raw);
}
