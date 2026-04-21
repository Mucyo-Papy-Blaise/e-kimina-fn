/**
 * Paths appended to `NEXT_PUBLIC_API_URL` (which must already include the `/api` prefix).
 * Single source of truth — matches `e-kimina-bn` `AuthController` routes.
 */
export const API_AUTH_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  forgotPassword: "/auth/forgot-password",
  resetPasswordVerifyOtp: "/auth/reset-password/verify-otp",
  resetPasswordComplete: "/auth/reset-password/complete",
  profile: "/auth/profile",
  /** `GET ?token=` — public; resolves email for treasurer invitation registration. */
  treasurerInvitationPreview: "/auth/treasurer-invitation",
} as const;

/** Authenticated Nest `GroupsController` (`/api/groups`). */
export const API_GROUPS_PATHS = {
  list: "/groups",
  /** `view=mine` | `view=discover` | legacy `publicOnly=true` */
  listPublic: "/groups?publicOnly=true",
  create: "/groups",
  join: (groupId: string) => `/groups/${encodeURIComponent(groupId)}/join`,
} as const;
