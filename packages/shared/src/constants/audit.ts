import { z } from "zod";
import {
  auditActionSchema,
  auditSeveritySchema,
  securityEventTypeSchema,
} from "../validators";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditSeverity = z.infer<typeof auditSeveritySchema>;
export type SecurityEventType = z.infer<typeof securityEventTypeSchema>;
