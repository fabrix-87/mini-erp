import { genderSchema, membershipStatusSchema, userSortFieldSchema } from "../validators";
import { z } from "zod";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type Gender = z.infer<typeof genderSchema>;
export const Gender = genderSchema.enum

export type UserSortField = z.infer<typeof userSortFieldSchema>;

export type UserMembershipStatus = z.infer<typeof membershipStatusSchema>;