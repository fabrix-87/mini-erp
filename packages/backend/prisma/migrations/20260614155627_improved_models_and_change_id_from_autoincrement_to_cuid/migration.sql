/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mode_of_transport` on the `intrastat_transactions` table. All the data in the column will be lost.
  - The primary key for the `tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActivityParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActivityTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClosedReason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentPaymentInstallment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentSequence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Opportunity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[document_line_id,is_correction]` on the table `intrastat_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `intrastat_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'TENTATIVE', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('ORGANIZER', 'REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "LeadPurchaseTimeframe" AS ENUM ('IMMEDIATE', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "LeadDecisionAuthority" AS ENUM ('DECISION_MAKER', 'INFLUENCER', 'GATEKEEPER', 'END_USER', 'UNKNOWN');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_followUpActivityId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityParticipant" DROP CONSTRAINT "ActivityParticipant_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityParticipant" DROP CONSTRAINT "ActivityParticipant_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityParticipant" DROP CONSTRAINT "ActivityParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_customerTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_defaultPriceListId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_parentCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_customerCountryCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_parentDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_shippingCountryCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_parentLineId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_productId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_taxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPaymentInstallment" DROP CONSTRAINT "DocumentPaymentInstallment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPaymentInstallment" DROP CONSTRAINT "DocumentPaymentInstallment_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRelation" DROP CONSTRAINT "DocumentRelation_sourceDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentRelation" DROP CONSTRAINT "DocumentRelation_targetDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSequence" DROP CONSTRAINT "DocumentSequence_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_convertedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_convertedToId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_assignedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_closedReasonId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_leadId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityEvent" DROP CONSTRAINT "SecurityEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_parentSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_supplierTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "UserDetails" DROP CONSTRAINT "UserDetails_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_B_fkey";

-- DropForeignKey
ALTER TABLE "company_addresses" DROP CONSTRAINT "company_addresses_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_contacts" DROP CONSTRAINT "company_contacts_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_contacts" DROP CONSTRAINT "company_contacts_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "company_notes" DROP CONSTRAINT "company_notes_author_id_fkey";

-- DropForeignKey
ALTER TABLE "company_notes" DROP CONSTRAINT "company_notes_company_id_fkey";

-- DropForeignKey
ALTER TABLE "intrastat_transactions" DROP CONSTRAINT "intrastat_transactions_document_id_fkey";

-- DropForeignKey
ALTER TABLE "intrastat_transactions" DROP CONSTRAINT "intrastat_transactions_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "manufacturers" DROP CONSTRAINT "manufacturers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "price_lists" DROP CONSTRAINT "price_lists_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_deleted_by_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_deleted_by_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_batches" DROP CONSTRAINT "stock_batches_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_document_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_document_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "tax_rules" DROP CONSTRAINT "tax_rules_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_bank_accounts" DROP CONSTRAINT "tenant_bank_accounts_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_company_id_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_fkey";

-- DropIndex
DROP INDEX "intrastat_transactions_document_line_id_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserDetails" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "company_addresses" ALTER COLUMN "company_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "company_contacts" ALTER COLUMN "contact_id" SET DATA TYPE TEXT,
ALTER COLUMN "company_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "company_notes" ALTER COLUMN "company_id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "intrastat_commodity_codes" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valid_to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "intrastat_transaction_codes" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valid_to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "intrastat_transactions" DROP COLUMN "mode_of_transport",
ADD COLUMN     "mode_of_transport_code" CHAR(2),
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "document_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "manufacturers" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payment_methods" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "price_lists" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "deleted_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "supplier_id" SET DATA TYPE TEXT,
ALTER COLUMN "deleted_by" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stock_batches" ALTER COLUMN "supplier_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stock_movements" ALTER COLUMN "document_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by_user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stock_reservations" ALTER COLUMN "document_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tax_rules" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tenant_bank_accounts" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "company_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tenants_id_seq";

-- AlterTable
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "ActivityParticipant";

-- DropTable
DROP TABLE "ActivityTemplate";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "ClosedReason";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentLine";

-- DropTable
DROP TABLE "DocumentPaymentInstallment";

-- DropTable
DROP TABLE "DocumentRelation";

-- DropTable
DROP TABLE "DocumentSequence";

-- DropTable
DROP TABLE "Lead";

-- DropTable
DROP TABLE "Opportunity";

-- DropTable
DROP TABLE "SecurityEvent";

-- DropTable
DROP TABLE "Supplier";

-- DropEnum
DROP TYPE "DocumentStatusCategory";

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "ActivityPriority" NOT NULL DEFAULT 'MEDIUM',
    "outcome" "ActivityOutcome",
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "duration" INTEGER,
    "reminder_minutes" INTEGER,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "customer_id" TEXT,
    "contact_id" TEXT,
    "opportunity_id" TEXT,
    "lead_id" TEXT,
    "assigned_user_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "attachments" JSONB,
    "internal_notes" TEXT,
    "result" TEXT,
    "follow_up_activity_id" INTEGER,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_participants" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "contact_id" TEXT,
    "external_email" VARCHAR(255),
    "external_name" VARCHAR(255),
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "role" "ParticipantRole" NOT NULL DEFAULT 'OPTIONAL',
    "response_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "priority" "ActivityPriority" NOT NULL DEFAULT 'MEDIUM',
    "default_duration" INTEGER,
    "default_subject" VARCHAR(255) NOT NULL,
    "default_description" TEXT,
    "tenant_id" TEXT,
    "checklist" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "entity_name" VARCHAR(255),
    "action" "AuditAction" NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "user_id" TEXT,
    "username" VARCHAR(50) NOT NULL,
    "changes" JSONB NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "request_id" VARCHAR(100),
    "session_id" VARCHAR(100),
    "endpoint" VARCHAR(255),
    "method" VARCHAR(10),
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "retention_expires" TIMESTAMP(3),
    "related_entity_type" VARCHAR(50),
    "related_entity_id" INTEGER,
    "business_context" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'WARNING',
    "user_id" TEXT,
    "username" VARCHAR(50),
    "email" VARCHAR(255),
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(500),
    "location" VARCHAR(255),
    "description" TEXT NOT NULL,
    "details" JSONB,
    "action_taken" VARCHAR(100),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "legal_form" VARCHAR(100),
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "entity_type" "CompanyTypeEntity" NOT NULL DEFAULT 'JURIDICAL',
    "vat_number" VARCHAR(20),
    "tax_code" VARCHAR(20),
    "sdi_code" VARCHAR(7),
    "pec" VARCHAR(255),
    "eori_number" VARCHAR(20),
    "vat_id" VARCHAR(20),
    "country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "main_email" VARCHAR(255),
    "main_phone" VARCHAR(50),
    "assigned_user_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "priority" "CustomerPriority" NOT NULL DEFAULT 'LOW',
    "segment" "CustomerSegment" NOT NULL DEFAULT 'STANDARD',
    "size" "CustomerSize" NOT NULL DEFAULT 'SMALL',
    "type" "CustomerType" NOT NULL DEFAULT 'PROSPECT',
    "creditStatus" "CreditCheckStatus" NOT NULL DEFAULT 'PENDING',
    "default_price_list_id" INTEGER,
    "customer_tax_rule_id" INTEGER,
    "payment_method_id" INTEGER,
    "credit_limit" DECIMAL(15,2),
    "first_sale_date" TIMESTAMP(3),
    "last_sale_date" TIMESTAMP(3),
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "customer_since" TIMESTAMP(3),
    "last_interaction_at" TIMESTAMP(3),
    "average_order_value" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "lifetime_value" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "churn_risk" SMALLINT NOT NULL DEFAULT 0,
    "health_score" SMALLINT NOT NULL DEFAULT 50,
    "nps_score" SMALLINT,
    "satisfaction_rate" DECIMAL(3,2),
    "last_survey_date" TIMESTAMP(3),
    "parent_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "payment_terms" VARCHAR(100),
    "credit_limit" DECIMAL(15,2),
    "bank_account" VARCHAR(100),
    "lead_time_days" INTEGER DEFAULT 0,
    "transport_cost" DECIMAL(10,2),
    "first_order_date" TIMESTAMP(3),
    "last_order_date" TIMESTAMP(3),
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "rating" INTEGER DEFAULT 5,
    "supplier_tax_rule_id" INTEGER,
    "parent_supplier_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "document_number" TEXT,
    "sequence_number" INTEGER,
    "document_year" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "supplier_id" TEXT,
    "contact_id" TEXT,
    "opportunity_id" TEXT,
    "lead_id" TEXT,
    "warehouse_id" INTEGER,
    "document_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "delivery_date" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "sent_date" TIMESTAMP(3),
    "customer_name" TEXT NOT NULL,
    "customer_vat_number" TEXT,
    "customer_tax_code" TEXT,
    "customer_pec" TEXT,
    "customer_sdi_code" TEXT,
    "customer_address" TEXT,
    "customer_city" TEXT,
    "customer_postal_code" TEXT,
    "customer_province" TEXT,
    "customer_country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "shipping_name" TEXT,
    "shipping_address" TEXT,
    "shipping_city" TEXT,
    "shipping_postal_code" TEXT,
    "shipping_province" TEXT,
    "shipping_country_code" CHAR(2),
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "shipping_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "shipping_tax_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "exchange_rate" DECIMAL(12,6) NOT NULL DEFAULT 1.0,
    "exchange_rate_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base_currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "payment_method_id" INTEGER,
    "payment_method" VARCHAR(50) NOT NULL,
    "payment_terms" VARCHAR(100),
    "bank_name" VARCHAR(100),
    "bank_iban" TEXT,
    "bank_swift" TEXT,
    "notes" TEXT,
    "internal_notes" TEXT,
    "terms_and_conditions" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "assigned_user_id" TEXT,
    "deleted_by" TEXT,
    "custom_fields" JSONB,
    "approved_at" TIMESTAMP(3),
    "invoiced_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "voided_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_lines" (
    "id" SERIAL NOT NULL,
    "document_id" TEXT NOT NULL,
    "product_variant_id" INTEGER,
    "product_id" TEXT,
    "line_number" INTEGER NOT NULL,
    "lineType" "DocumentLineType" NOT NULL DEFAULT 'PRODUCT',
    "code" TEXT,
    "name_system" VARCHAR(255) NOT NULL,
    "description_system" TEXT,
    "name_customer" VARCHAR(255),
    "description_customer" TEXT,
    "quantity" DECIMAL(15,6) NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'pz',
    "unit_price" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_rule_id" INTEGER,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 22,
    "tax_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "vat_nature_code" VARCHAR(10),
    "vat_norm_reference" VARCHAR(255),
    "line_total_with_tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "custom_fields" JSONB,
    "warehouse_id" INTEGER,
    "parent_line_id" INTEGER,
    "is_component" BOOLEAN NOT NULL DEFAULT false,
    "quantity_invoiced" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "quantity_delivered" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "quantity_returned" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "original_unit_price" DECIMAL(20,6),
    "price_override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_payment_installments" (
    "id" SERIAL NOT NULL,
    "document_id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL DEFAULT 1,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "payment_method_id" INTEGER,
    "payment_reference" VARCHAR(100),
    "bank_transaction_id" VARCHAR(100),
    "reminders_sent" INTEGER NOT NULL DEFAULT 0,
    "last_reminder_at" TIMESTAMP(3),
    "late_fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_payment_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "id" SERIAL NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "year" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "prefix" VARCHAR(10),
    "tenant_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_relations" (
    "source_document_id" TEXT NOT NULL,
    "target_document_id" TEXT NOT NULL,
    "relation_type" "DocumentRelationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_relations_pkey" PRIMARY KEY ("source_document_id","target_document_id","relation_type")
);

-- CreateTable
CREATE TABLE "document_status_history" (
    "id" SERIAL NOT NULL,
    "document_id" TEXT NOT NULL,
    "from_status" "DocumentStatus",
    "to_status" "DocumentStatus" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intrastat_transport_modes" (
    "code" CHAR(2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_transport_modes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "intrastat_transport_mode_translations" (
    "id" SERIAL NOT NULL,
    "transport_mode_code" CHAR(2) NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_transport_mode_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "website" VARCHAR(255),
    "vat_number" VARCHAR(20),
    "tax_code" VARCHAR(20),
    "country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "tenant_id" TEXT NOT NULL,
    "contact_first_name" VARCHAR(100) NOT NULL,
    "contact_last_name" VARCHAR(100) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(50),
    "contact_mobile" VARCHAR(50),
    "contact_position" VARCHAR(100),
    "contact_department" VARCHAR(100),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "province_code" CHAR(2),
    "zip_code" VARCHAR(20),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "quality" "LeadQuality" NOT NULL DEFAULT 'COLD',
    "score" SMALLINT NOT NULL DEFAULT 0,
    "estimated_value" DECIMAL(15,2),
    "estimated_size" "CustomerSize",
    "industry" VARCHAR(100),
    "employees_count" INTEGER,
    "annual_revenue" DECIMAL(15,2),
    "budget" DECIMAL(15,2),
    "purchase_timeframe" "LeadPurchaseTimeframe",
    "decision_authority" "LeadDecisionAuthority",
    "primary_need" TEXT,
    "interested_in" TEXT,
    "created_by_user_id" TEXT,
    "assigned_user_id" TEXT,
    "converted_at" TIMESTAMP(3),
    "converted_to_id" TEXT,
    "converted_by_user_id" TEXT,
    "lost_reason" TEXT,
    "lost_date" TIMESTAMP(3),
    "first_contact_date" TIMESTAMP(3),
    "last_contact_date" TIMESTAMP(3),
    "contact_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_status_change" TIMESTAMP(3),
    "bant_qualified" BOOLEAN NOT NULL DEFAULT false,
    "bant_notes" TEXT,
    "privacy_consent" BOOLEAN NOT NULL DEFAULT false,
    "privacy_consent_date" TIMESTAMP(3),
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent_date" TIMESTAMP(3),
    "do_not_call" BOOLEAN NOT NULL DEFAULT false,
    "do_not_email" BOOLEAN NOT NULL DEFAULT false,
    "campaign_name" VARCHAR(100),
    "utm_medium" VARCHAR(50),
    "utm_source" VARCHAR(50),
    "utm_campaign" VARCHAR(50),
    "landing_page" VARCHAR(255),
    "referrer" VARCHAR(255),
    "notes" TEXT,
    "description" TEXT,
    "custom_fields" JSONB,
    "competitors" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "lead_id" TEXT,
    "customer_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "source" "OpportunitySource" NOT NULL DEFAULT 'OTHER',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "stage" "SalesStage" NOT NULL DEFAULT 'LEAD_QUALIFICATION',
    "estimated_value" DECIMAL(15,2),
    "weighted_value" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "actual_value" DECIMAL(15,2),
    "expected_close_date" TIMESTAMP(3),
    "closed_date" TIMESTAMP(3),
    "closed_reason_id" INTEGER,
    "closed_notes" TEXT,
    "created_by_user_id" TEXT,
    "assigned_user_id" TEXT,
    "last_stage_change" TIMESTAMP(3),
    "days_in_current_stage" INTEGER NOT NULL DEFAULT 0,
    "total_activities" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "proposed_products" JSONB,
    "notes" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closed_reasons" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_won" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closed_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closed_reason_translations" (
    "id" SERIAL NOT NULL,
    "closed_reason_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closed_reason_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_tenant_id_idx" ON "activities"("tenant_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_status_idx" ON "activities"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "activities_tenant_id_assigned_user_id_idx" ON "activities"("tenant_id", "assigned_user_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_scheduled_start_idx" ON "activities"("tenant_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "activities_priority_idx" ON "activities"("priority");

-- CreateIndex
CREATE INDEX "activities_companyId_idx" ON "activities"("companyId");

-- CreateIndex
CREATE INDEX "activities_customer_id_idx" ON "activities"("customer_id");

-- CreateIndex
CREATE INDEX "activities_opportunity_id_idx" ON "activities"("opportunity_id");

-- CreateIndex
CREATE INDEX "activities_lead_id_idx" ON "activities"("lead_id");

-- CreateIndex
CREATE INDEX "activities_scheduled_start_scheduled_end_idx" ON "activities"("scheduled_start", "scheduled_end");

-- CreateIndex
CREATE INDEX "activities_follow_up_activity_id_idx" ON "activities"("follow_up_activity_id");

-- CreateIndex
CREATE INDEX "activity_participants_activity_id_idx" ON "activity_participants"("activity_id");

-- CreateIndex
CREATE INDEX "activity_participants_user_id_idx" ON "activity_participants"("user_id");

-- CreateIndex
CREATE INDEX "activity_participants_contact_id_idx" ON "activity_participants"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_activity_id_user_id_key" ON "activity_participants"("activity_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_activity_id_contact_id_key" ON "activity_participants"("activity_id", "contact_id");

-- CreateIndex
CREATE INDEX "activity_templates_tenant_id_idx" ON "activity_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "activity_templates_type_idx" ON "activity_templates"("type");

-- CreateIndex
CREATE INDEX "activity_templates_active_idx" ON "activity_templates"("active");

-- CreateIndex
CREATE UNIQUE INDEX "activity_templates_tenant_id_name_key" ON "activity_templates"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_username_idx" ON "audit_logs"("username");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_ip_address_idx" ON "audit_logs"("ip_address");

-- CreateIndex
CREATE INDEX "audit_logs_retention_expires_idx" ON "audit_logs"("retention_expires");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_action_idx" ON "audit_logs"("entity_type", "entity_id", "action");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "security_events_event_type_idx" ON "security_events"("event_type");

-- CreateIndex
CREATE INDEX "security_events_user_id_idx" ON "security_events"("user_id");

-- CreateIndex
CREATE INDEX "security_events_ip_address_idx" ON "security_events"("ip_address");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "security_events"("resolved");

-- CreateIndex
CREATE INDEX "security_events_created_at_idx" ON "security_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE INDEX "companies_vat_number_idx" ON "companies"("vat_number");

-- CreateIndex
CREATE INDEX "companies_tax_code_idx" ON "companies"("tax_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_key" ON "customers"("company_id");

-- CreateIndex
CREATE INDEX "customers_parent_customer_id_idx" ON "customers"("parent_customer_id");

-- CreateIndex
CREATE INDEX "customers_deleted_at_idx" ON "customers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_company_id_key" ON "suppliers"("company_id");

-- CreateIndex
CREATE INDEX "suppliers_parent_supplier_id_idx" ON "suppliers"("parent_supplier_id");

-- CreateIndex
CREATE INDEX "suppliers_deleted_at_idx" ON "suppliers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_key" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "documents_currency_code_idx" ON "documents"("currency_code");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_tenant_id_idx" ON "documents"("tenant_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_document_type_idx" ON "documents"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "documents_tenant_id_status_idx" ON "documents"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "documents_customer_id_idx" ON "documents"("customer_id");

-- CreateIndex
CREATE INDEX "documents_supplier_id_idx" ON "documents"("supplier_id");

-- CreateIndex
CREATE INDEX "documents_opportunity_id_idx" ON "documents"("opportunity_id");

-- CreateIndex
CREATE INDEX "documents_lead_id_idx" ON "documents"("lead_id");

-- CreateIndex
CREATE INDEX "documents_document_year_idx" ON "documents"("document_year");

-- CreateIndex
CREATE INDEX "documents_customer_country_code_idx" ON "documents"("customer_country_code");

-- CreateIndex
CREATE INDEX "documents_shipping_country_code_idx" ON "documents"("shipping_country_code");

-- CreateIndex
CREATE INDEX "documents_tenant_id_document_type_document_year_document_nu_idx" ON "documents"("tenant_id", "document_type", "document_year", "document_number");

-- CreateIndex
CREATE INDEX "documents_deleted_at_document_type_idx" ON "documents"("deleted_at", "document_type");

-- CreateIndex
CREATE INDEX "documents_deleted_at_customer_id_idx" ON "documents"("deleted_at", "customer_id");

-- CreateIndex
CREATE INDEX "documents_deleted_at_supplier_id_idx" ON "documents"("deleted_at", "supplier_id");

-- CreateIndex
CREATE INDEX "documents_deleted_at_status_idx" ON "documents"("deleted_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_document_type_document_year_sequence_nu_key" ON "documents"("tenant_id", "document_type", "document_year", "sequence_number");

-- CreateIndex
CREATE INDEX "document_lines_warehouse_id_idx" ON "document_lines"("warehouse_id");

-- CreateIndex
CREATE INDEX "document_lines_parent_line_id_idx" ON "document_lines"("parent_line_id");

-- CreateIndex
CREATE INDEX "document_lines_document_id_line_number_idx" ON "document_lines"("document_id", "line_number");

-- CreateIndex
CREATE INDEX "document_lines_document_id_idx" ON "document_lines"("document_id");

-- CreateIndex
CREATE INDEX "document_lines_product_id_idx" ON "document_lines"("product_id");

-- CreateIndex
CREATE INDEX "document_lines_product_variant_id_idx" ON "document_lines"("product_variant_id");

-- CreateIndex
CREATE INDEX "document_lines_tax_rule_id_idx" ON "document_lines"("tax_rule_id");

-- CreateIndex
CREATE INDEX "document_payment_installments_status_due_date_idx" ON "document_payment_installments"("status", "due_date");

-- CreateIndex
CREATE INDEX "document_payment_installments_document_id_idx" ON "document_payment_installments"("document_id");

-- CreateIndex
CREATE INDEX "document_payment_installments_due_date_idx" ON "document_payment_installments"("due_date");

-- CreateIndex
CREATE INDEX "document_payment_installments_status_idx" ON "document_payment_installments"("status");

-- CreateIndex
CREATE INDEX "document_sequences_tenant_id_idx" ON "document_sequences"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_tenant_id_document_type_year_key" ON "document_sequences"("tenant_id", "document_type", "year");

-- CreateIndex
CREATE INDEX "document_relations_target_document_id_idx" ON "document_relations"("target_document_id");

-- CreateIndex
CREATE INDEX "document_status_history_document_id_changed_at_idx" ON "document_status_history"("document_id", "changed_at");

-- CreateIndex
CREATE INDEX "document_status_history_to_status_idx" ON "document_status_history"("to_status");

-- CreateIndex
CREATE INDEX "intrastat_transport_modes_active_idx" ON "intrastat_transport_modes"("active");

-- CreateIndex
CREATE INDEX "intrastat_transport_mode_translations_language_id_idx" ON "intrastat_transport_mode_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_transport_mode_translations_transport_mode_code_l_key" ON "intrastat_transport_mode_translations"("transport_mode_code", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_converted_to_id_key" ON "leads"("converted_to_id");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_contact_email_idx" ON "leads"("contact_email");

-- CreateIndex
CREATE INDEX "leads_converted_to_id_idx" ON "leads"("converted_to_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE INDEX "leads_last_contact_date_idx" ON "leads"("last_contact_date");

-- CreateIndex
CREATE INDEX "leads_status_assigned_user_id_idx" ON "leads"("status", "assigned_user_id");

-- CreateIndex
CREATE INDEX "leads_quality_score_idx" ON "leads"("quality", "score");

-- CreateIndex
CREATE UNIQUE INDEX "leads_tenant_id_code_key" ON "leads"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_lead_id_idx" ON "opportunities"("tenant_id", "lead_id");

-- CreateIndex
CREATE INDEX "opportunities_customer_id_idx" ON "opportunities"("customer_id");

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "opportunities"("status");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- CreateIndex
CREATE INDEX "opportunities_source_idx" ON "opportunities"("source");

-- CreateIndex
CREATE INDEX "opportunities_assigned_user_id_idx" ON "opportunities"("assigned_user_id");

-- CreateIndex
CREATE INDEX "opportunities_expected_close_date_idx" ON "opportunities"("expected_close_date");

-- CreateIndex
CREATE INDEX "opportunities_closed_date_idx" ON "opportunities"("closed_date");

-- CreateIndex
CREATE INDEX "closed_reasons_is_won_idx" ON "closed_reasons"("is_won");

-- CreateIndex
CREATE INDEX "closed_reasons_active_idx" ON "closed_reasons"("active");

-- CreateIndex
CREATE UNIQUE INDEX "closed_reasons_tenant_id_code_key" ON "closed_reasons"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_closed_reason_code" ON "closed_reasons"("code") WHERE ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "closed_reason_translations_language_id_idx" ON "closed_reason_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "closed_reason_translations_closed_reason_id_language_id_key" ON "closed_reason_translations"("closed_reason_id", "language_id");

-- CreateIndex
CREATE INDEX "intrastat_commodity_codes_active_idx" ON "intrastat_commodity_codes"("active");

-- CreateIndex
CREATE INDEX "intrastat_commodity_codes_valid_from_valid_to_idx" ON "intrastat_commodity_codes"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "intrastat_transaction_codes_active_idx" ON "intrastat_transaction_codes"("active");

-- CreateIndex
CREATE INDEX "intrastat_transaction_codes_valid_from_valid_to_idx" ON "intrastat_transaction_codes"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "intrastat_transactions_tenant_id_partner_country_code_idx" ON "intrastat_transactions"("tenant_id", "partner_country_code");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_transactions_document_line_id_is_correction_key" ON "intrastat_transactions"("document_line_id", "is_correction");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_follow_up_activity_id_fkey" FOREIGN KEY ("follow_up_activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_templates" ADD CONSTRAINT "activity_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_default_price_list_id_fkey" FOREIGN KEY ("default_price_list_id") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_tax_rule_id_fkey" FOREIGN KEY ("customer_tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_parent_customer_id_fkey" FOREIGN KEY ("parent_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_supplier_tax_rule_id_fkey" FOREIGN KEY ("supplier_tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_parent_supplier_id_fkey" FOREIGN KEY ("parent_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notes" ADD CONSTRAINT "company_notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notes" ADD CONSTRAINT "company_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_country_code_fkey" FOREIGN KEY ("customer_country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_shipping_country_code_fkey" FOREIGN KEY ("shipping_country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tax_rule_id_fkey" FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_parent_line_id_fkey" FOREIGN KEY ("parent_line_id") REFERENCES "document_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_sequences" ADD CONSTRAINT "document_sequences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relations" ADD CONSTRAINT "document_relations_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relations" ADD CONSTRAINT "document_relations_target_document_id_fkey" FOREIGN KEY ("target_document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_status_history" ADD CONSTRAINT "document_status_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_status_history" ADD CONSTRAINT "document_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_partner_country_code_fkey" FOREIGN KEY ("partner_country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_mode_of_transport_code_fkey" FOREIGN KEY ("mode_of_transport_code") REFERENCES "intrastat_transport_modes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transport_mode_translations" ADD CONSTRAINT "intrastat_transport_mode_translations_transport_mode_code_fkey" FOREIGN KEY ("transport_mode_code") REFERENCES "intrastat_transport_modes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transport_mode_translations" ADD CONSTRAINT "intrastat_transport_mode_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_id_fkey" FOREIGN KEY ("converted_to_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_by_user_id_fkey" FOREIGN KEY ("converted_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_closed_reason_id_fkey" FOREIGN KEY ("closed_reason_id") REFERENCES "closed_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_reasons" ADD CONSTRAINT "closed_reasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_reason_translations" ADD CONSTRAINT "closed_reason_translations_closed_reason_id_fkey" FOREIGN KEY ("closed_reason_id") REFERENCES "closed_reasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_reason_translations" ADD CONSTRAINT "closed_reason_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
