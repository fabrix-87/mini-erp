/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,email]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unique_tenant_contact_email";

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT;

-- CreateIndex
CREATE INDEX "contacts_tenant_id_deleted_at_idx" ON "contacts"("tenant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tenant_contact_email" ON "contacts"("tenant_id", "email") WHERE ("email" IS NOT NULL AND "deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
