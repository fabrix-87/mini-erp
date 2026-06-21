import { z } from "zod";
import {
  assignRolesToUserSchema,
  membershipUserIdParamSchema,
  removeRolesToUserSchema,
} from "../validators/user-membership";

export type MembershipUserIdParam = z.infer<typeof membershipUserIdParamSchema>;
export type AssignRolesToUserInput = z.infer<typeof assignRolesToUserSchema>;
export type RemoveRolesFromUserInput = z.infer<typeof removeRolesToUserSchema>;
