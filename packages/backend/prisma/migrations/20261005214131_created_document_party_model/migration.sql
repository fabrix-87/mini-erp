/*
  Warnings:

  - You are about to drop the column `carrier_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `carrier_name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `company_version_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_address` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_city` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_country_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_email` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_pec` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_phone` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_postal_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_province` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_sdi_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_tax_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `counterparty_vat_number` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_city` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_country_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_name` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_postal_code` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_province` on the `documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id,id]` on the table `company_addresses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,company_id,id]` on the table `company_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentPartyRole" AS ENUM ('COUNTERPARTY', 'TENANT', 'SHIPPING', 'CARRIER');

-- CreateEnum
CREATE TYPE "ReaShareholderType" AS ENUM ('SU', 'SM');

-- CreateEnum
CREATE TYPE "ReaLiquidationStatus" AS ENUM ('LS', 'LN');

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_counterparty_country_code_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_shipping_country_code_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_tenant_id_company_version_id_fkey";

-- DropIndex
DROP INDEX "company_versions_tenant_id_company_id_is_current_idx";

-- DropIndex
DROP INDEX "company_versions_tenant_id_company_id_valid_from_idx";

-- DropIndex
DROP INDEX "company_versions_tenant_id_id_key";

-- DropIndex
DROP INDEX "company_versions_tenant_id_tax_code_idx";

-- DropIndex
DROP INDEX "company_versions_tenant_id_vat_number_idx";

-- DropIndex
DROP INDEX "documents_tenant_id_counterparty_country_code_idx";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "rea_liquidation_status" "ReaLiquidationStatus",
ADD COLUMN     "rea_number" VARCHAR(20),
ADD COLUMN     "rea_office" CHAR(2),
ADD COLUMN     "rea_share_capital" DECIMAL(14,2),
ADD COLUMN     "rea_shareholder_type" "ReaShareholderType";

-- AlterTable
ALTER TABLE "company_versions" ADD COLUMN     "rea_liquidation_status" "ReaLiquidationStatus",
ADD COLUMN     "rea_number" VARCHAR(20),
ADD COLUMN     "rea_office" CHAR(2),
ADD COLUMN     "rea_share_capital" DECIMAL(14,2),
ADD COLUMN     "rea_shareholder_type" "ReaShareholderType";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "carrier_code",
DROP COLUMN "carrier_name",
DROP COLUMN "company_version_id",
DROP COLUMN "counterparty_address",
DROP COLUMN "counterparty_city",
DROP COLUMN "counterparty_country_code",
DROP COLUMN "counterparty_email",
DROP COLUMN "counterparty_name",
DROP COLUMN "counterparty_pec",
DROP COLUMN "counterparty_phone",
DROP COLUMN "counterparty_postal_code",
DROP COLUMN "counterparty_province",
DROP COLUMN "counterparty_sdi_code",
DROP COLUMN "counterparty_tax_code",
DROP COLUMN "counterparty_vat_number",
DROP COLUMN "shipping_address",
DROP COLUMN "shipping_city",
DROP COLUMN "shipping_country_code",
DROP COLUMN "shipping_name",
DROP COLUMN "shipping_postal_code",
DROP COLUMN "shipping_province",
ADD COLUMN     "snapshot_locked_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "document_parties" (
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "role" "DocumentPartyRole" NOT NULL,
    "code" VARCHAR(20),
    "name" VARCHAR(255) NOT NULL,
    "entity_type" "CompanyTypeEntity",
    "legal_form" VARCHAR(100),
    "vat_number" VARCHAR(20),
    "tax_code" VARCHAR(20),
    "vat_id" VARCHAR(20),
    "eori_number" VARCHAR(20),
    "tax_regime" "TaxRegime",
    "pec" VARCHAR(255),
    "sdi_code" VARCHAR(7),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "province" VARCHAR(100),
    "country_code" CHAR(2),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "rea_office" CHAR(2),
    "rea_number" VARCHAR(20),
    "rea_share_capital" DECIMAL(14,2),
    "rea_shareholder_type" "ReaShareholderType",
    "rea_liquidation_status" "ReaLiquidationStatus",
    "source_company_id" TEXT,
    "source_address_id" TEXT,
    "company_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_parties_pkey" PRIMARY KEY ("document_id","role")
);

-- CreateIndex
CREATE INDEX "document_parties_tenant_id_source_company_id_idx" ON "document_parties"("tenant_id", "source_company_id");

-- CreateIndex
CREATE INDEX "document_parties_source_company_id_source_address_id_idx" ON "document_parties"("source_company_id", "source_address_id") WHERE ("source_address_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_parties_company_version_id_idx" ON "document_parties"("company_version_id") WHERE ("company_version_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_parties_tenant_id_name_document_id_idx" ON "document_parties"("tenant_id", "name", "document_id") WHERE ("role" = 'COUNTERPARTY');

-- CreateIndex
CREATE INDEX "document_parties_tenant_id_vat_number_idx" ON "document_parties"("tenant_id", "vat_number") WHERE ("role" = 'COUNTERPARTY' AND "vat_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_parties_tenant_id_tax_code_idx" ON "document_parties"("tenant_id", "tax_code") WHERE ("role" = 'COUNTERPARTY' AND "tax_code" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "company_addresses_company_id_id_key" ON "company_addresses"("company_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "company_versions_tenant_id_company_id_id_key" ON "company_versions"("tenant_id", "company_id", "id");

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_tenant_id_source_company_id_fkey" FOREIGN KEY ("tenant_id", "source_company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_source_company_id_source_address_id_fkey" FOREIGN KEY ("source_company_id", "source_address_id") REFERENCES "company_addresses"("company_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_tenant_id_source_company_id_company_versi_fkey" FOREIGN KEY ("tenant_id", "source_company_id", "company_version_id") REFERENCES "company_versions"("tenant_id", "company_id", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ============================================================================
-- DOCUMENT PARTY CONSTRAINTS
-- ============================================================================

ALTER TABLE public.document_parties
    ADD CONSTRAINT document_parties_address_requires_company
    CHECK (
        source_address_id IS NULL
        OR source_company_id IS NOT NULL
    ),
    ADD CONSTRAINT document_parties_version_requires_company
    CHECK (
        company_version_id IS NULL
        OR source_company_id IS NOT NULL
    ),
    ADD CONSTRAINT document_parties_name_not_blank
    CHECK (length(btrim(name)) > 0),
    ADD CONSTRAINT document_parties_country_format
    CHECK (
        country_code IS NULL
        OR country_code ~ '^[A-Z]{2}$'
    ),
    ADD CONSTRAINT document_parties_rea_office_format
    CHECK (
        rea_office IS NULL
        OR rea_office ~ '^[A-Z]{2}$'
    ),
    ADD CONSTRAINT document_parties_rea_number_not_blank
    CHECK (
        rea_number IS NULL
        OR length(btrim(rea_number)) > 0
    ),
    ADD CONSTRAINT document_parties_rea_capital_nonnegative
    CHECK (
        rea_share_capital IS NULL
        OR rea_share_capital >= 0
    );

-- ============================================================================
-- SNAPSHOT LOCK POLICY
-- Quotes, proformas, orders and generic archived documents remain unlocked.
-- Delivery notes are intentionally included.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.document_supports_snapshot_lock(
    p_document_type text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
    SELECT p_document_type IN (
        'INVOICE',
        'CREDIT_NOTE',
        'DEBIT_NOTE',
        'SELF_INVOICE',
        'SUPPLIER_INVOICE',
        'SUPPLIER_CREDIT_NOTE',
        'DELIVERY_NOTE',
        'SUPPLIER_DELIVERY_NOTE'
    );
$$;

-- ============================================================================
-- DOCUMENT SNAPSHOT GUARD
-- ============================================================================

CREATE OR REPLACE FUNCTION public.documents_snapshot_lock_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_tenant_company_id public.companies.id%TYPE;
    v_counterparty_company_id public.companies.id%TYPE;
    v_carrier_company_id public.companies.id%TYPE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.snapshot_locked_at IS NOT NULL THEN
            RAISE EXCEPTION
                'Cannot delete document %: snapshots are locked',
                OLD.id
                USING ERRCODE = '23514';
        END IF;

        RETURN OLD;
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- Create the document first, then its parties, then finalize it.
        IF NEW.snapshot_locked_at IS NOT NULL THEN
            RAISE EXCEPTION
                'Document % must be created without a snapshot lock',
                NEW.id
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Stable aggregate identity, including while unlocked.
        IF NEW.id IS DISTINCT FROM OLD.id
           OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
            RAISE EXCEPTION
                'Cannot change document identity'
                USING ERRCODE = '23514';
        END IF;

        IF OLD.snapshot_locked_at IS NOT NULL THEN
            IF NEW.snapshot_locked_at IS DISTINCT FROM OLD.snapshot_locked_at THEN
                RAISE EXCEPTION
                    'Cannot clear or change snapshot lock on document %',
                    OLD.id
                    USING ERRCODE = '23514';
            END IF;

            -- Preserve snapshot provenance and document classification.
            IF NEW.customer_id IS DISTINCT FROM OLD.customer_id
               OR NEW.supplier_id IS DISTINCT FROM OLD.supplier_id
               OR NEW.contact_id IS DISTINCT FROM OLD.contact_id
               OR NEW.carrier_id IS DISTINCT FROM OLD.carrier_id
               OR NEW.document_type IS DISTINCT FROM OLD.document_type
               OR NEW.direction IS DISTINCT FROM OLD.direction
               OR NEW.document_date IS DISTINCT FROM OLD.document_date
               OR NEW.document_year IS DISTINCT FROM OLD.document_year
               OR NEW.document_number IS DISTINCT FROM OLD.document_number
               OR NEW.sequence_number IS DISTINCT FROM OLD.sequence_number
               OR NEW.counterparty_document_number IS DISTINCT FROM OLD.counterparty_document_number THEN
                RAISE EXCEPTION
                    'Cannot change classification, numbering or party references on locked document %',
                    OLD.id
                    USING ERRCODE = '23514';
            END IF;
        END IF;
    END IF;

    IF NEW.snapshot_locked_at IS NOT NULL
       AND NOT public.document_supports_snapshot_lock(NEW.document_type::text) THEN
        RAISE EXCEPTION
            'Document type % does not support snapshot locking',
            NEW.document_type
            USING ERRCODE = '23514';
    END IF;

    -- Numbered OUTBOUND documents covered by this policy must be locked.
    IF public.document_supports_snapshot_lock(NEW.document_type::text)
       AND NEW.direction::text = 'OUTBOUND'
       AND NEW.sequence_number IS NOT NULL
       AND NEW.snapshot_locked_at IS NULL THEN
        RAISE EXCEPTION
            'Document % must be locked when assigning its sequence number',
            NEW.id
            USING ERRCODE = '23514';
    END IF;

    -- VAT registration is a locking boundary for both directions.
    IF public.document_supports_snapshot_lock(NEW.document_type::text)
       AND NEW.vat_register_protocol IS NOT NULL
       AND NEW.snapshot_locked_at IS NULL THEN
        RAISE EXCEPTION
            'Document % must be locked before VAT registration',
            NEW.id
            USING ERRCODE = '23514';
    END IF;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    IF OLD.snapshot_locked_at IS NULL
       AND NEW.snapshot_locked_at IS NOT NULL THEN

        -- An ordinary document must not have two competing counterparties.
        IF NEW.customer_id IS NOT NULL
           AND NEW.supplier_id IS NOT NULL THEN
            RAISE EXCEPTION
                'Cannot lock document % with both customer and supplier',
                NEW.id
                USING ERRCODE = '23514';
        END IF;

        SELECT t.company_id
          INTO v_tenant_company_id
          FROM public.tenants AS t
         WHERE t.id = NEW.tenant_id
         FOR SHARE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Tenant % does not exist',
                NEW.tenant_id
                USING ERRCODE = '23503';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.document_parties AS p
            WHERE p.tenant_id = NEW.tenant_id
              AND p.document_id = NEW.id
              AND p.role::text = 'TENANT'
              AND p.country_code IS NOT NULL
              AND p.source_company_id = v_tenant_company_id
        ) THEN
            RAISE EXCEPTION
                'Cannot lock document %: TENANT party must reference the tenant company and have a country',
                NEW.id
                USING ERRCODE = '23514';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.document_parties AS p
            WHERE p.tenant_id = NEW.tenant_id
              AND p.document_id = NEW.id
              AND p.role::text = 'COUNTERPARTY'
              AND p.country_code IS NOT NULL
        ) THEN
            RAISE EXCEPTION
                'Cannot lock document %: COUNTERPARTY with country is required',
                NEW.id
                USING ERRCODE = '23514';
        END IF;

        v_counterparty_company_id := NULL;

        IF NEW.customer_id IS NOT NULL THEN
            SELECT c.company_id
              INTO v_counterparty_company_id
              FROM public.customers AS c
             WHERE c.tenant_id = NEW.tenant_id
               AND c.id = NEW.customer_id
             FOR SHARE;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Customer % does not exist in tenant %',
                    NEW.customer_id,
                    NEW.tenant_id
                    USING ERRCODE = '23503';
            END IF;
        ELSIF NEW.supplier_id IS NOT NULL THEN
            SELECT s.company_id
              INTO v_counterparty_company_id
              FROM public.suppliers AS s
             WHERE s.tenant_id = NEW.tenant_id
               AND s.id = NEW.supplier_id
             FOR SHARE;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Supplier % does not exist in tenant %',
                    NEW.supplier_id,
                    NEW.tenant_id
                    USING ERRCODE = '23503';
            END IF;
        END IF;

        -- Manual counterparties remain allowed when no registry link exists.
        IF v_counterparty_company_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1
               FROM public.document_parties AS p
               WHERE p.tenant_id = NEW.tenant_id
                 AND p.document_id = NEW.id
                 AND p.role::text = 'COUNTERPARTY'
                 AND p.source_company_id = v_counterparty_company_id
           ) THEN
            RAISE EXCEPTION
                'COUNTERPARTY source does not match customer or supplier on document %',
                NEW.id
                USING ERRCODE = '23514';
        END IF;

        IF NEW.carrier_id IS NOT NULL THEN
            -- Stabilize the carrier-to-supplier link during validation.
            PERFORM 1
            FROM public.carriers AS c
            WHERE c.tenant_id = NEW.tenant_id
              AND c.id = NEW.carrier_id
            FOR SHARE;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Carrier % does not exist in tenant %',
                    NEW.carrier_id,
                    NEW.tenant_id
                    USING ERRCODE = '23503';
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM public.document_parties AS p
                WHERE p.tenant_id = NEW.tenant_id
                  AND p.document_id = NEW.id
                  AND p.role::text = 'CARRIER'
                  AND p.code IS NOT NULL
                  AND length(btrim(p.code)) > 0
            ) THEN
                RAISE EXCEPTION
                    'Cannot lock document %: linked carrier requires a CARRIER party with code',
                    NEW.id
                    USING ERRCODE = '23514';
            END IF;

            SELECT s.company_id
              INTO v_carrier_company_id
              FROM public.carriers AS c
              JOIN public.suppliers AS s
                ON s.tenant_id = c.tenant_id
               AND s.id = c.supplier_id
             WHERE c.tenant_id = NEW.tenant_id
               AND c.id = NEW.carrier_id
             FOR SHARE OF s;

            IF FOUND THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM public.document_parties AS p
                    WHERE p.tenant_id = NEW.tenant_id
                      AND p.document_id = NEW.id
                      AND p.role::text = 'CARRIER'
                      AND p.source_company_id = v_carrier_company_id
                ) THEN
                    RAISE EXCEPTION
                        'CARRIER source does not match carrier supplier on document %',
                        NEW.id
                        USING ERRCODE = '23514';
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documents_snapshot_lock_guard
ON public.documents;

CREATE TRIGGER trg_documents_snapshot_lock_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.documents_snapshot_lock_guard();

-- ============================================================================
-- DOCUMENT PARTY IMMUTABILITY
-- ============================================================================

CREATE OR REPLACE FUNCTION public.document_parties_lock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_document_id public.documents.id%TYPE;
    v_tenant_id public.documents.tenant_id%TYPE;
    v_locked_at public.documents.snapshot_locked_at%TYPE;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.document_id IS DISTINCT FROM OLD.document_id
           OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
           OR NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION
                'Cannot change party identity; delete and recreate it while unlocked'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        v_document_id := OLD.document_id;
        v_tenant_id := OLD.tenant_id;
    ELSE
        v_document_id := NEW.document_id;
        v_tenant_id := NEW.tenant_id;
    END IF;

    SELECT d.snapshot_locked_at
      INTO v_locked_at
      FROM public.documents AS d
     WHERE d.id = v_document_id
       AND d.tenant_id = v_tenant_id
     FOR UPDATE;

    IF NOT FOUND THEN
        IF TG_OP = 'DELETE' THEN
            -- The parent is already absent during an allowed draft cascade.
            -- Locked parent deletion is rejected by the parent trigger.
            RETURN OLD;
        END IF;

        RAISE EXCEPTION
            'Parent document % does not exist in tenant %',
            v_document_id,
            v_tenant_id
            USING ERRCODE = '23503';
    END IF;

    IF v_locked_at IS NOT NULL THEN
        RAISE EXCEPTION
            'Document % is locked: party snapshots are immutable',
            v_document_id
            USING ERRCODE = '23514';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_document_parties_lock
ON public.document_parties;

CREATE TRIGGER trg_document_parties_lock
BEFORE INSERT OR UPDATE OR DELETE ON public.document_parties
FOR EACH ROW
EXECUTE FUNCTION public.document_parties_lock();