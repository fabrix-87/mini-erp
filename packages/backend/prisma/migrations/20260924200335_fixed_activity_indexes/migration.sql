/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,name]` on the table `activity_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "activities_has_attachments";

-- DropIndex
DROP INDEX "activities_has_attachments ";

-- DropIndex
DROP INDEX "activities_tenant_id_scheduled_start_scheduled_end_idx";

-- DropIndex
DROP INDEX "activity_templates_tenant_id_name_key";

-- CreateIndex
CREATE INDEX "activities_tenant_id_scheduled_start_idx" ON "activities"("tenant_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "activities_tenant_id_contact_id_idx" ON "activities"("tenant_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_templates_tenant_name" ON "activity_templates"("tenant_id", "name") WHERE ("tenant_id" IS NOT NULL);
