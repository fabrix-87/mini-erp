import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { isoDateSchema } from "./primitives/date";
import { inputJsonValueSchema } from "./base";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Audit Action enum
 */
export const auditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "VIEW",
  "EXPORT",
  "APPROVE",
  "REJECT",
  "LOCK",
  "UNLOCK",
  "ARCHIVE",
  "RESTORE",
  "SEND",
  "RECEIVE",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "PERMISSION_CHANGE",
]);

/**
 * Audit Severity enum
 */
export const auditSeveritySchema = z.enum([
  "INFO",
  "WARNING",
  "ERROR",
  "CRITICAL",
]);

/**
 * Security Event Type enum
 */
export const securityEventTypeSchema = z.enum([
  "FAILED_LOGIN",
  "SUSPICIOUS_ACTIVITY",
  "UNAUTHORIZED_ACCESS",
  "BRUTE_FORCE_ATTEMPT",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "PERMISSION_DENIED",
  "ACCOUNT_LOCKED",
  "PASSWORD_RESET_REQUESTED",
  "TWO_FACTOR_FAILED",
  "SESSION_HIJACKING",
  "SQL_INJECTION_ATTEMPT",
  "XSS_ATTEMPT",
  "RATE_LIMIT_EXCEEDED",
]);

// ============================================================================
// AUDIT LOG SCHEMAS
// ============================================================================

/**
 * Schema for Audit Log ID (UUID)
 */
export const auditLogIdSchema = z.string().uuid("Audit Log ID non valido");

/**
 * Schema for creating an Audit Log (internal use only)
 */
export const createAuditLogSchema = z
  .object({
    entityType: z
      .string()
      .min(1, "Entity type obbligatorio")
      .max(50, "Entity type max 50 caratteri"),

    entityId: createIdSchema("Entity ID non valido"),

    entityName: z.string().max(255).optional().nullable(),

    action: auditActionSchema,

    severity: auditSeveritySchema.default("INFO"),

    userId: createIdSchema("User ID non valido").optional().nullable(),

    username: z.string().max(50, "Username max 50 caratteri"),

    changes: inputJsonValueSchema,

    description: z.string().max(5000).optional().nullable(),

    metadata: inputJsonValueSchema.optional().nullable(),

    ipAddress: z
      .string()
      .max(45, "IP address max 45 caratteri")
      .optional()
      .nullable(),

    userAgent: z.string().max(500).optional().nullable(),

    requestId: z.string().max(100).optional().nullable(),

    sessionId: z.string().max(100).optional().nullable(),

    endpoint: z.string().max(255).optional().nullable(),

    method: z
      .string()
      .max(10)
      .toUpperCase()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true;
          return ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(val);
        },
        { message: "HTTP method non valido" },
      ),

    isCritical: z.boolean().default(false),

    retentionExpires: isoDateSchema(),

    relatedEntityType: z.string().max(50).optional().nullable(),

    relatedEntityId: createIdSchema("Related Entity ID non valido")
      .optional()
      .nullable(),

    businessContext: z.string().max(100).optional().nullable(),
  })
  .strict();

// ============================================================================
// SECURITY EVENT SCHEMAS
// ============================================================================

/**
 * Schema for Security Event ID (UUID)
 */
export const securityEventIdSchema = z.string().uuid("Security Event ID non valido");

/**
 * Schema for creating a Security Event
 */
export const createSecurityEventSchema = z
  .object({
    eventType: securityEventTypeSchema,

    severity: auditSeveritySchema.default("WARNING"),

    userId: createIdSchema("User ID non valido").optional().nullable(),

    username: z.string().max(50).optional().nullable(),

    email: z.string().email("Email non valida").max(255).optional().nullable(),

    ipAddress: z.string().max(45, "IP address max 45 caratteri"),

    userAgent: z.string().max(500).optional().nullable(),

    location: z.string().max(255).optional().nullable(),

    description: z.string().min(1, "Descrizione obbligatoria").max(5000),

    details: inputJsonValueSchema.optional().nullable(),

    actionTaken: z.string().max(100).optional().nullable(),
  })
  .strict();

/**
 * Schema for resolving a Security Event
 */
export const resolveSecurityEventSchema = z
  .object({
    resolvedBy: createIdSchema("User ID non valido"),
    notes: z.string().max(1000).optional().nullable(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for Audit Log queries
 */
export const auditLogQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  entityType: z.string().optional(),
  entityId: createIdSchema("Entity ID non valido").optional(),
  action: auditActionSchema.optional(),
  severity: auditSeveritySchema.optional(),
  userId: createIdSchema("User ID non valido").optional(),
  username: z.string().optional(),
  ipAddress: z.string().optional(),
  isCritical: queryBooleanSchema,
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  search: z.string().optional(), // Search in description, entityName, username
  sortBy: z
    .enum(["createdAt", "severity", "action", "entityType"])
    .default("createdAt"),
  sortOrder: sortOrderSchema,
});

/**
 * Schema for Security Event queries
 */
export const securityEventQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  eventType: securityEventTypeSchema.optional(),
  severity: auditSeveritySchema.optional(),
  userId: createIdSchema("User ID non valido").optional(),
  ipAddress: z.string().optional(),
  resolved: queryBooleanSchema,
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "severity", "eventType", "resolved"])
    .default("createdAt"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const auditLogIdParamSchema = z.object({
  id: auditLogIdSchema,
});

export const securityEventIdParamSchema = z.object({
  id: securityEventIdSchema,
});

/**
 * Schema for entity audit history
 */
export const entityAuditHistorySchema = z.object({
  entityType: z.string().min(1, "Entity type obbligatorio"),
  entityId: createIdSchema("Entity ID non valido"),
  page: pageSchema,
  limit: limitSchema,
  actions: z.array(auditActionSchema).optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
});

/**
 * Schema for user audit history
 */
export const userAuditHistorySchema = z.object({
  userId: createIdSchema("User ID non valido"),
  page: pageSchema,
  limit: limitSchema,
  actions: z.array(auditActionSchema).optional(),
  entityTypes: z.array(z.string()).optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
});

/**
 * Schema for audit statistics filters
 */
export const auditStatsSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  entityType: z.string().optional(),
  userId: createIdSchema("User ID non valido").optional(),
  groupBy: z
    .enum(["action", "severity", "entityType", "user", "day", "hour"])
    .default("action"),
});

/**
 * Schema for compliance report filters
 */
export const complianceReportSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  entityTypes: z.array(z.string()).optional(),
  includeSecurityEvents: z.boolean().default(true),
  format: z.enum(["json", "csv", "pdf"]).default("json"),
});

/**
 * Schema for retention policy
 */
export const auditRetentionPolicySchema = z.object({
  entityType: z.string().optional(), // If null, applies to all
  retentionDays: z.number().int().positive().min(30).max(3650), // 30 days to 10 years
  isCriticalOnly: z.boolean().default(false),
});
