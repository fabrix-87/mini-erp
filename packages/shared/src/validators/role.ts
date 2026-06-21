// packages/shared/src/validators/role.ts
import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { queryBooleanSchema } from "./query/params";
import { limitSchema, pageSchema, sortOrderSchema } from "./query/pagination";
import { userIdSchema } from "./base";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema per validare ID ruolo
 */
export const roleIdSchema = createIdSchema("ID ruolo non valido");

/**
 * Schema per validare ID ruolo nei params
 */
export const roleIdParamSchema = z.object({
  id: roleIdSchema,
});

/**
 * Schema per validare ID permesso
 */
export const permissionIdSchema = createIdSchema("ID permesso non valido");

/**
 * Schema per validare ID permesso nei params
 */
export const permissionIdParamSchema = z.object({
  id: permissionIdSchema,
});

/**
 * Schema per validare code
 */
export const roleCodeSchema = z
  .string()
  .min(1, "Codice ruolo obbligatorio")
  .max(50, "Il codice non può superare 50 caratteri")
  .toUpperCase()
  .regex(/^[A-Z0-9_]+$/, "Il codice può contenere solo lettere maiuscole, numeri e underscore");

/**
 * Schema per validare code nei params
 */
export const roleCodeParamSchema = z.object({
  code: roleCodeSchema,
});

export const roleSortFieldSchema = z.enum(["createdAt", "name", "code", "updatedAt"]);

// ============================================================================
// ROLE SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo Role
 */
export const createRoleSchema = z
  .object({
    code: roleCodeSchema,
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

    permissionIds: z.array(permissionIdSchema).optional().default([]),
  })
  .strict();

/**
 * Schema per assegnare permessi a un ruolo
 */
export const assignPermissionsSchema = z
  .object({
    permissionIds: z.array(permissionIdSchema).min(1, "Almeno un permesso è richiesto"),
  })
  .strict();

/**
 * Schema per rimuovere permessi da un ruolo
 */
export const removePermissionsSchema = z
  .object({
    permissionIds: z.array(permissionIdSchema).min(1, "Almeno un permesso è richiesto"),
  })
  .strict();

/**
 * Schema per query filtri ruoli
 */
export const roleQuerySchema = z.object({
  search: z.string().optional(),
  isDefault: queryBooleanSchema.optional(),
  sortBy: roleSortFieldSchema.default("name"),
  sortOrder: sortOrderSchema,
  page: pageSchema,
  limit: limitSchema
});

// ============================================================================
// PERMISSION SCHEMAS
// ============================================================================

const permissionCodeSchema = z
  .string()
  .min(3, "Il codice è obbligatorio")
  .max(100, "Il codice non può superare 100 caratteri")
  .toLowerCase()
  .regex(
    /^[a-z0-9_:]+$/,
    "Il codice può contenere solo lettere minuscole, numeri, underscore e due punti",
  )
  .refine(
    (code) => {
      const parts = code.split(":");
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    },
    {
      message: "Il codice deve seguire il formato resource:action (es. product:read)",
    },
  );

/**
 * Schema per la creazione di un nuovo Permission
 */
export const createPermissionSchema = z
  .object({
    code: permissionCodeSchema,
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
export const updatePermissionSchema = z
  .object({
    code: permissionCodeSchema.optional(),
    resource: z.string().min(1).max(50).toLowerCase().trim().optional(),
    action: z.string().min(1).max(50).toLowerCase().trim().optional(),
    description: z.string().max(1000).optional().nullable(),
  })
  .strict();

/**
 * Schema per query filtri permessi
 */
export const permissionQuerySchema = z.object({
  search: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  sortBy: z.enum(["createdAt", "code", "resource", "action"]).default("resource"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema per verificare permessi
 */
export const checkPermissionSchema = z
  .object({
    userId: userIdSchema,
    permissionCode: permissionCodeSchema,
  })
  .strict();

// ============================================================================
// FRONTEND SCHEMAS
// ============================================================================

export const userRoleSchema = createRoleSchema
  .extend({
    id: roleIdSchema,
  })
  .omit({
    description: true,
    isDefault: true,
    permissionIds: true,
  });
