import { genderSchema, membershipStatusSchema, userSortFieldSchema } from "../validators";
import { z } from "zod";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type Gender = z.infer<typeof genderSchema>;
export type UserSortField = z.infer<typeof userSortFieldSchema>;
export type UserMembershipStatus = z.infer<typeof membershipStatusSchema>;

export const GENDER = {
  OTHER: "OTHER",
  MALE: "MALE",
  FEMALE: "FEMALE",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;

export const USER_MEMBERSHIP_STATUS = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export const USER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "username",
  "email",
  "lastLogin",
] as const;
