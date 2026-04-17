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
}
