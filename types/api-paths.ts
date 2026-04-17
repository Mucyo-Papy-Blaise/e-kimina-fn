/**
 * Paths appended to `NEXT_PUBLIC_API_URL` (which must already include the `/api` prefix).
 * Single source of truth — matches `e-kimina-bn` `AuthController` routes.
 */
export const API_AUTH_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  profile: "/auth/profile",
} as const;
