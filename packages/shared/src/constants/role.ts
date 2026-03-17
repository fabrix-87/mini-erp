import { z } from "zod";
import { roleSortFieldSchema } from "../validators";

export type RoleSortField = z.infer<typeof roleSortFieldSchema>;

export const ROLE_SYSTEM_DEFAULT = [
  "ADMIN",
  "SALES",
  "USER",
  "WAREHOUSE",
  "MANAGER",
] as const;

export type RoleSystemDefault = typeof ROLE_SYSTEM_DEFAULT[number];