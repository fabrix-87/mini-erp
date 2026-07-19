-- AlterTable
ALTER TABLE "company_versions" ADD COLUMN     "updated_by_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
