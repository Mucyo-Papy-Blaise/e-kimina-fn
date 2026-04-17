/** Runtime role constants — aligned with Prisma `RoleName` / API responses. */
export const ROLE = {
  USER: "USER",
  SUPER_ADMIN: "SUPER_ADMIN",
  GROUP_ADMIN: "GROUP_ADMIN",
  TREASURER: "TREASURER",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/** Alias used in Zod and API docs (same as `Role`). */
export type RoleName = Role;

export const ALL_ROLES: readonly Role[] = [
  ROLE.USER,
  ROLE.SUPER_ADMIN,
  ROLE.GROUP_ADMIN,
  ROLE.TREASURER,
  ROLE.MEMBER,
];
