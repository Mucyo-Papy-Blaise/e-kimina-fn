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

export type CreateGroupBody = {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers: number;
  /** Registered user email — assigned `TREASURER` after create (not the creator). */
  treasurerEmail?: string;
};
