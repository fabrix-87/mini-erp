-- AlterTable
ALTER TABLE "document_lines" ADD COLUMN     "source_line_id" TEXT;

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_source_line_id_idx" ON "document_lines"("tenant_id", "source_line_id") WHERE ("source_line_id" IS NOT NULL);

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_source_line_id_fkey" FOREIGN KEY ("tenant_id", "source_line_id") REFERENCES "document_lines"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
