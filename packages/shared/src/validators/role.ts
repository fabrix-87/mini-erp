// packages/shared/src/validators/role.ts
import z from "zod";
import { UserIdSchema } from "./base";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema per validare ID ruolo
 */
export const RoleIdSchema = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().int().positive("ID ruolo non valido"));

/**
 * Schema per validare ID ruolo nei params
 */
export const RoleIdParamSchema = z.object({
  id: RoleIdSchema,
});

/**
 * Schema per validare ID permesso
 */
export const PermissionIdSchema = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().int().positive("ID permesso non valido"));

/**
 * Schema per validare ID permesso nei params
 */
export const PermissionIdParamSchema = z.object({
  id: PermissionIdSchema,
});

/**
 * Schema per validare code
 */
export const RoleCodeSchema = z
  .string()
  .min(1, "Codice ruolo obbligatorio")
  .max(50, "Il codice non può superare 50 caratteri")
  .toUpperCase()
  .regex(
    /^[A-Z0-9_]+$/,
    "Il codice può contenere solo lettere maiuscole, numeri e underscore"
  );

/**
 * Schema per validare code nei params
 */
export const RoleCodeParamSchema = z.object({
  code: RoleCodeSchema,
});

// ============================================================================
// ROLE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo Role
 */
export const CreateRoleSchema = z
  .object({
    code: RoleCodeSchema,
    name: z
      .string()
      .min(1, "Il nome è obbligatorio")
      .max(100, "Il nome non può superare 100 caratteri")
      .trim(),
    description: z
      .string()
      .max(1000, "La descrizione non può superare 1000 caratteri")
      .optional()
      .nullable(),
    isDefault: z.boolean().default(false),

    permissionIds: z.array(z.number().int().positive()).optional().default([]),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Role
 */
export const UpdateRoleSchema = z
  .object({
    code: RoleCodeSchema.optional(),
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(1000).optional().nullable(),
    isDefault: z.boolean().optional(),
  })
  .strict();

/**
 * Schema per assegnare permessi a un ruolo
 */
export const AssignPermissionsSchema = z
  .object({
    permissionIds: z
      .array(z.number().int().positive())
      .min(1, "Almeno un permesso è richiesto"),
  })
  .strict();

/**
 * Schema per rimuovere permessi da un ruolo
 */
export const RemovePermissionsSchema = z
  .object({
    permissionIds: z
      .array(z.number().int().positive())
      .min(1, "Almeno un permesso è richiesto"),
  })
  .strict();

/**
 * Schema per query filtri ruoli
 */
export const RoleQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    isDefault: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional(),
    sortBy: z.enum(["createdAt", "name", "code"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

// ============================================================================
// PERMISSION SCHEMAS
// ============================================================================

const PermissionCodeSchema = z
  .string()
  .min(3, "Il codice è obbligatorio")
  .max(100, "Il codice non può superare 100 caratteri")
  .toLowerCase()
  .regex(
    /^[a-z0-9_:]+$/,
    "Il codice può contenere solo lettere minuscole, numeri, underscore e due punti"
  )
  .refine(
    (code) => {
      const parts = code.split(":");
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    },
    {
      message:
        "Il codice deve seguire il formato resource:action (es. product:read)",
    }
  );

/**
 * Schema per la creazione di un nuovo Permission
 */
export const CreatePermissionSchema = z
  .object({
    code: PermissionCodeSchema,
    resource: z
      .string()
      .min(1, "La risorsa è obbligatoria")
      .max(50, "La risorsa non può superare 50 caratteri")
      .toLowerCase()
      .trim(),

    action: z
      .string()
      .min(1, "L'azione è obbligatoria")
      .max(50, "L'azione non può superare 50 caratteri")
      .toLowerCase()
      .trim(),

    description: z
      .string()
      .max(1000, "La descrizione non può superare 1000 caratteri")
      .optional()
      .nullable(),
  })
  .strict();

/**
 * Schema per l'aggiornamento di un Permission
 */
export const UpdatePermissionSchema = z
  .object({
    code: PermissionCodeSchema.optional(),
    resource: z.string().min(1).max(50).toLowerCase().trim().optional(),
    action: z.string().min(1).max(50).toLowerCase().trim().optional(),
    description: z.string().max(1000).optional().nullable(),
  })
  .strict();

/**
 * Schema per query filtri permessi
 */
export const PermissionQuerySchema = z.object({
  search: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "code", "resource", "action"])
    .default("resource"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Schema per assegnare ruoli a utenti
 */
export const AssignRolesToUserSchema = z
  .object({
    userId: z.number().int().positive("ID utente non valido"),
    roleIds: z
      .array(z.number().int().positive())
      .min(1, "Almeno un ruolo è richiesto"),
  })
  .strict();

/**
 * Schema per verificare permessi
 */
export const CheckPermissionSchema = z
  .object({
    userId: UserIdSchema,
    permissionCode: PermissionCodeSchema,
  })
  .strict();

// ============================================================================
// FRONTEND SCHEMAS
// ============================================================================

export const UserRoleSchema = CreateRoleSchema.extend({
  id: RoleIdSchema,
}).omit({
  description: true,
  isDefault: true,
  permissionIds: true,
});
