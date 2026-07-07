/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,company_id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,document_type,document_year,sequence_number]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,company_id]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "companies_tax_code_idx";

-- DropIndex
DROP INDEX "customers_tenant_id_idx";

-- DropIndex
DROP INDEX "documents_tenant_id_document_type_document_year_sequence_nu_key";

-- DropIndex
DROP INDEX "suppliers_tenant_id_idx";

-- CreateIndex
CREATE INDEX "companies_tenant_id_tax_code_idx" ON "companies"("tenant_id", "tax_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_company_id_key" ON "customers"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_document_type_document_year_sequence_nu_key" ON "documents"("tenant_id", "document_type", "document_year", "sequence_number") WHERE ("sequence_number" IS NOT NULL AND "direction" = 'OUTBOUND');

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_company_id_key" ON "suppliers"("tenant_id", "company_id");
