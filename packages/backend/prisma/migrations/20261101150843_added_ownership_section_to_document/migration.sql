-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "approved_by_user_id" TEXT,
ADD COLUMN     "shipping_address_id" TEXT,
ADD COLUMN     "updated_by_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "company_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
