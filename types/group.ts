import type { Role } from "./enum";

/** Matches `GroupResponseDto` + `memberCount` from `GET /groups`. */
export type Group = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  isPublic: boolean;
  isVerified: boolean;
  maxMembers: number;
  createdAt: string;
  memberCount?: number;
};

/** `GET /groups/:id` for an active member — includes role hints. */
export type GroupDetail = Group & {
  memberCount: number;
  myRole: Role;
  isGroupAdmin: boolean;
};

export type GroupMembershipStatusApi = "ACTIVE" | "SUSPENDED";

export type GroupMemberRow = {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  membershipStatus: GroupMembershipStatusApi;
  joinedAt: string;
};

export type GroupRemovalKindApi = "REMOVED" | "SUSPENDED";

export type GroupRemovalNotification = {
  id: string;
  groupId: string;
  groupName: string;
  kind: GroupRemovalKindApi;
  reason: string;
  readAt: string | null;
  createdAt: string;
};

export type CreateGroupBody = {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers: number;
  /** Registered user email — assigned `TREASURER` after create (not the creator). */
  treasurerEmail?: string;
};
