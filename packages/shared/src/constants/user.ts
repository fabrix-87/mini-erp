import { genderSchema, userSortFieldSchema } from "../validators";
import { z } from "zod";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type Gender = z.infer<typeof genderSchema>;

export type UserSortField = z.infer<typeof userSortFieldSchema>;
