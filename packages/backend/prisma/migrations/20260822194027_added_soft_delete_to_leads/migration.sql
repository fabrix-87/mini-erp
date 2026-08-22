/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,code]` on the table `leads` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "leads_contact_email_idx";

-- DropIndex
DROP INDEX "leads_converted_to_id_idx";

-- DropIndex
DROP INDEX "leads_created_at_idx";

-- DropIndex
DROP INDEX "leads_last_contact_date_idx";

-- DropIndex
DROP INDEX "leads_quality_score_idx";

-- DropIndex
DROP INDEX "leads_source_idx";

-- DropIndex
DROP INDEX "leads_status_assigned_user_id_idx";

-- DropIndex
DROP INDEX "leads_tenant_id_code_key";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by_user_id" TEXT;

-- CreateIndex
CREATE INDEX "leads_tenant_id_source_idx" ON "leads"("tenant_id", "source") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_deleted_at_idx" ON "leads"("tenant_id", "deleted_at") WHERE ("deleted_at" IS NOT NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_contact_email_idx" ON "leads"("tenant_id", "contact_email") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_created_at_idx" ON "leads"("tenant_id", "created_at") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_last_contact_date_idx" ON "leads"("tenant_id", "last_contact_date") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_status_assigned_user_id_idx" ON "leads"("tenant_id", "status", "assigned_user_id") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "leads_tenant_id_quality_score_idx" ON "leads"("tenant_id", "quality", "score") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "leads_tenant_id_code_key" ON "leads"("tenant_id", "code") WHERE ("deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_deleted_by_user_id_fkey" FOREIGN KEY ("deleted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
