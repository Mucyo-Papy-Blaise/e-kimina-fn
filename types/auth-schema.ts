import { z } from "zod";
import type {
  AuthResponse,
  GroupMembership,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "./auth";
import type { Role } from "./enum";

const roleNameSchema = z.enum([
  "USER",
  "SUPER_ADMIN",
  "GROUP_ADMIN",
  "TREASURER",
  "MEMBER",
]) satisfies z.ZodType<Role>;

const groupMembershipSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  role: roleNameSchema,
}) satisfies z.ZodType<GroupMembership>;

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phoneNumber: z.string().nullable(),
  image: z.string().nullable(),
  platformRole: roleNameSchema,
  groupMemberships: z.array(groupMembershipSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<UserResponse>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userResponseSchema,
}) satisfies z.ZodType<AuthResponse>;

export const loginRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8).max(72),
}) satisfies z.ZodType<LoginRequest>;

export const registerRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8).max(72),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(160),
  phoneNumber: z.string().max(32).optional(),
  image: z.string().max(2048).optional(),
}) satisfies z.ZodType<RegisterRequest>;

/** Sign-up page fields — combined into `RegisterRequest.fullName` before POST. */
export const registerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8).max(72),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
