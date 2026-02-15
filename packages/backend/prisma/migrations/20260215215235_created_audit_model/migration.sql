/*
  Warnings:

  - Added the required column `username` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'APPROVE', 'REJECT', 'LOCK', 'UNLOCK', 'ARCHIVE', 'RESTORE', 'SEND', 'RECEIVE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PERMISSION_CHANGE');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "businessContext" VARCHAR(100),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endpoint" VARCHAR(255),
ADD COLUMN     "entityName" VARCHAR(255),
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "isCritical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "method" VARCHAR(10),
ADD COLUMN     "relatedEntityId" INTEGER,
ADD COLUMN     "relatedEntityType" VARCHAR(50),
ADD COLUMN     "requestId" VARCHAR(100),
ADD COLUMN     "retentionExpires" TIMESTAMP(3),
ADD COLUMN     "sessionId" VARCHAR(100),
ADD COLUMN     "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
ADD COLUMN     "userAgent" VARCHAR(500),
ADD COLUMN     "username" VARCHAR(50) NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'WARNING',
    "userId" INTEGER,
    "username" VARCHAR(50),
    "email" VARCHAR(255),
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "location" VARCHAR(255),
    "description" TEXT NOT NULL,
    "details" JSONB,
    "actionTaken" VARCHAR(100),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityEvent_eventType_idx" ON "SecurityEvent"("eventType");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "SecurityEvent_ipAddress_idx" ON "SecurityEvent"("ipAddress");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_resolved_idx" ON "SecurityEvent"("resolved");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_username_idx" ON "AuditLog"("username");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");

-- CreateIndex
CREATE INDEX "AuditLog_retentionExpires_idx" ON "AuditLog"("retentionExpires");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_action_idx" ON "AuditLog"("entityType", "entityId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
