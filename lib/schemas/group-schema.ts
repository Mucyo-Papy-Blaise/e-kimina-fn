import { z } from "zod";

/** Mirrors backend `CreateGroupDto` / `class-validator` rules. */
export const createGroupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(160),
  description: z.string().max(2000),
  isPublic: z.boolean(),
  maxMembers: z
    .number({ error: "Enter max members" })
    .int("Whole number only")
    .min(2, "At least 2 members")
    .max(100_000, "Maximum is too large"),
  /** Registered platform user who will be TREASURER (not the creator). */
  treasurerEmail: z
    .string()
    .min(1, "Treasurer email is required")
    .email("Enter a valid email"),
});

export type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;
