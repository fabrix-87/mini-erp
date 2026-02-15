// ============================================================================
// AUDIT LOG TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { User } from "./user";
import {
  createAuditLogSchema,
  createSecurityEventSchema,
  resolveSecurityEventSchema,
  auditLogQuerySchema,
  securityEventQuerySchema,
  auditLogIdParamSchema,
  securityEventIdParamSchema,
  entityAuditHistorySchema,
  userAuditHistorySchema,
  auditStatsSchema,
  complianceReportSchema,
  auditRetentionPolicySchema,
} from "../validators/audit";
import {
  AuditAction,
  AuditSeverity,
  SecurityEventType,
} from "../constants/audit";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Audit Log entity
 */
export type AuditLog = {
  id: string; // UUID
  entityType: string;
  entityId: number;
  entityName: string | null;
  action: AuditAction;
  severity: AuditSeverity;
  userId: number | null;
  user?: User | null;
  username: string;
  changes: Record<string, any>;
  description: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  sessionId: string | null;
  endpoint: string | null;
  method: string | null;
  isCritical: boolean;
  retentionExpires: Date | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  businessContext: string | null;
  createdAt: Date;
};

/**
 * Security Event entity
 */
export type SecurityEvent = {
  id: string; // UUID
  eventType: SecurityEventType;
  severity: AuditSeverity;
  userId: number | null;
  user?: User | null;
  username: string | null;
  email: string | null;
  ipAddress: string;
  userAgent: string | null;
  location: string | null;
  description: string;
  details: Record<string, any> | null;
  actionTaken: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: number | null;
  createdAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type CreateSecurityEventInput = z.infer<
  typeof createSecurityEventSchema
>;
export type ResolveSecurityEventInput = z.infer<
  typeof resolveSecurityEventSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
export type SecurityEventQueryInput = z.infer<typeof securityEventQuerySchema>;
export type EntityAuditHistoryInput = z.infer<typeof entityAuditHistorySchema>;
export type UserAuditHistoryInput = z.infer<typeof userAuditHistorySchema>;
export type AuditStatsInput = z.infer<typeof auditStatsSchema>;
export type ComplianceReportInput = z.infer<typeof complianceReportSchema>;
export type AuditRetentionPolicyInput = z.infer<
  typeof auditRetentionPolicySchema
>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type AuditLogIdParam = z.infer<typeof auditLogIdParamSchema>;
export type SecurityEventIdParam = z.infer<typeof securityEventIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Audit Log list item (simplified)
 */
export type AuditLogListItem = {
  id: string;
  entityType: string;
  entityId: number;
  entityName: string | null;
  action: AuditAction;
  severity: AuditSeverity;
  username: string;
  description: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

/**
 * Change detail (structured format for changes JSON)
 */
export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
  displayName?: string; // Human-readable field name
}

/**
 * Audit Log with structured changes
 */
export type AuditLogWithChanges = AuditLog & {
  structuredChanges: ChangeDetail[];
};

/**
 * Audit statistics
 */
export interface AuditStats {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  bySeverity: Record<AuditSeverity, number>;
  byEntityType: Record<string, number>;
  byUser: {
    userId: number;
    username: string;
    count: number;
  }[];
  topEntities: {
    entityType: string;
    entityId: number;
    entityName: string | null;
    count: number;
  }[];
  criticalCount: number;
  averageLogsPerDay: number;
  peakActivityHour: number; // 0-23
  peakActivityDay: string; // day of week
}

/**
 * Security event statistics
 */
export interface SecurityEventStats {
  totalEvents: number;
  unresolvedEvents: number;
  byEventType: Record<SecurityEventType, number>;
  bySeverity: Record<AuditSeverity, number>;
  topIpAddresses: {
    ipAddress: string;
    count: number;
    location: string | null;
  }[];
  topUsers: {
    userId: number | null;
    username: string | null;
    email: string | null;
    count: number;
  }[];
  resolutionRate: number; // percentage
  averageResolutionTime: number; // hours
}

/**
 * Entity audit timeline
 */
export interface EntityAuditTimeline {
  entityType: string;
  entityId: number;
  entityName: string | null;
  events: {
    id: string;
    action: AuditAction;
    timestamp: Date;
    username: string;
    description: string | null;
    changes: ChangeDetail[];
  }[];
  firstEvent: Date;
  lastEvent: Date;
  totalChanges: number;
  uniqueUsers: number;
}

/**
 * User activity timeline
 */
export interface UserActivityTimeline {
  userId: number;
  username: string;
  activities: {
    id: string;
    entityType: string;
    entityId: number;
    entityName: string | null;
    action: AuditAction;
    timestamp: Date;
    ipAddress: string | null;
  }[];
  period: {
    from: Date;
    to: Date;
  };
  totalActions: number;
  uniqueEntities: number;
  mostFrequentAction: AuditAction;
  mostAffectedEntityType: string;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  period: {
    from: Date;
    to: Date;
  };
  generatedAt: Date;
  generatedBy: number;
  summary: {
    totalAuditLogs: number;
    totalSecurityEvents: number;
    criticalEvents: number;
    unresolvedSecurityEvents: number;
    uniqueUsers: number;
    uniqueEntities: number;
  };
  auditLogsByEntity: Record<string, number>;
  criticalActions: AuditLogListItem[];
  securityEvents: SecurityEvent[];
  userActivity: {
    userId: number;
    username: string;
    totalActions: number;
    criticalActions: number;
  }[];
  dataRetention: {
    totalLogs: number;
    expiringSoon: number; // expiring in next 30 days
    expired: number;
  };
  recommendations: string[];
}

/**
 * Audit trail for specific entity
 */
export interface EntityAuditTrail {
  entityType: string;
  entityId: number;
  currentState: Record<string, any>;
  history: {
    version: number;
    timestamp: Date;
    action: AuditAction;
    userId: number | null;
    username: string;
    changes: ChangeDetail[];
    snapshot: Record<string, any>; // Full state at this version
  }[];
  canRestore: boolean;
  totalVersions: number;
}

/**
 * Suspicious activity pattern
 */
export interface SuspiciousActivityPattern {
  pattern: string;
  description: string;
  severity: AuditSeverity;
  occurrences: number;
  affectedUsers: {
    userId: number | null;
    username: string | null;
    count: number;
  }[];
  affectedIpAddresses: string[];
  firstOccurrence: Date;
  lastOccurrence: Date;
  relatedEvents: SecurityEvent[];
  recommendedAction: string;
}

/**
 * Retention policy
 */
export interface RetentionPolicy {
  id: number;
  entityType: string | null; // null = applies to all
  retentionDays: number;
  isCriticalOnly: boolean;
  appliesTo: string; // human-readable description
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retention summary
 */
export interface RetentionSummary {
  totalLogs: number;
  retainedLogs: number;
  eligibleForDeletion: number;
  criticalLogs: number;
  byEntityType: {
    entityType: string;
    total: number;
    retained: number;
    eligibleForDeletion: number;
  }[];
  nextCleanupDate: Date;
  storageUsed: number; // bytes
  estimatedSavings: number; // bytes after cleanup
}

/**
 * Audit dashboard metrics
 */
export interface AuditDashboardMetrics {
  today: {
    totalLogs: number;
    criticalLogs: number;
    securityEvents: number;
    uniqueUsers: number;
  };
  thisWeek: {
    totalLogs: number;
    criticalLogs: number;
    securityEvents: number;
    topActions: Record<AuditAction, number>;
  };
  thisMonth: {
    totalLogs: number;
    criticalLogs: number;
    securityEvents: number;
    trend: "increasing" | "stable" | "decreasing";
    percentageChange: number;
  };
  alerts: {
    unresolvedSecurityEvents: number;
    suspiciousPatterns: number;
    failedLogins: number;
    unauthorizedAccess: number;
  };
  recentCritical: AuditLogListItem[];
  recentSecurityEvents: SecurityEvent[];
}
