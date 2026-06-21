// packages/shared/validators/user-membership.ts
import { z } from "zod";
import { createCuidSchema } from "./primitives";

/** Param schema for endpoints scoped to a specific user membership. */
export const membershipUserIdParamSchema = z.object({
  userId: createCuidSchema("userId deve essere un CUID valido"),
});

/** Body schema for assigning one or more roles to a membership. */
export const assignRolesToUserSchema = z.object({
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "È richiesto almeno un ruolo"),
});

/** Body schema for removing specific roles from a membership. */
export const removeRolesToUserSchema = z.object({
  roleIds: z
    .array(z.number().int().positive())
    .min(1, "Specificare almeno un ruolo da rimuovere"),
});
