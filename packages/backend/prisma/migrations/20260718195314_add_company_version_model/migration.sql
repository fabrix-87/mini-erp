-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "company_version_id" TEXT;

-- CreateTable
CREATE TABLE "company_versions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "company_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "legal_form" VARCHAR(100),
    "entity_type" "CompanyTypeEntity" NOT NULL DEFAULT 'JURIDICAL',
    "vat_number" VARCHAR(20),
    "tax_code" VARCHAR(20),
    "sdi_code" VARCHAR(7),
    "pec" VARCHAR(255),
    "eori_number" VARCHAR(20),
    "vat_id" VARCHAR(20),
    "country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "province_code" CHAR(2),
    "zip_code" VARCHAR(20),
    "main_email" VARCHAR(255),
    "main_phone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_versions_tenant_id_company_id_valid_from_idx" ON "company_versions"("tenant_id", "company_id", "valid_from");

-- CreateIndex
CREATE INDEX "company_versions_tenant_id_company_id_is_current_idx" ON "company_versions"("tenant_id", "company_id", "is_current");

-- CreateIndex
CREATE INDEX "company_versions_tenant_id_vat_number_idx" ON "company_versions"("tenant_id", "vat_number") WHERE ("vat_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "company_versions_tenant_id_tax_code_idx" ON "company_versions"("tenant_id", "tax_code") WHERE ("tax_code" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "company_versions_company_id_valid_from_key" ON "company_versions"("company_id", "valid_from");

-- CreateIndex
CREATE UNIQUE INDEX "company_versions_company_id_key" ON "company_versions"("company_id") WHERE ("is_current" = true);

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_version_id_fkey" FOREIGN KEY ("company_version_id") REFERENCES "company_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
