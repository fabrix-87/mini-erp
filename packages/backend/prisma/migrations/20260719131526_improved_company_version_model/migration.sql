-- AlterTable
ALTER TABLE "company_versions" ADD COLUMN     "created_by_user_id" TEXT,
ADD COLUMN     "storicize_reason" VARCHAR(500);

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
