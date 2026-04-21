import type { Role } from "./enum";

export type { Role, RoleName } from "./enum";

export interface GroupMembership {
  groupId: string;
  groupName: string;
  role: Role;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  image: string | null;
  emailVerified: boolean;
  platformRole: Role;
  groupMemberships: GroupMembership[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  image?: string;
  /** Completes a pending treasurer account created when a group admin invites by email. */
  invitationToken?: string;
}

/** Normal registration — verify email with OTP before using the app. */
export interface RegisterPendingResponse {
  needsEmailVerification: true;
  email: string;
  message?: string;
}

export type RegisterResult = AuthResponse | RegisterPendingResponse;

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface CompletePasswordResetRequest {
  resetToken: string;
  password: string;
}
