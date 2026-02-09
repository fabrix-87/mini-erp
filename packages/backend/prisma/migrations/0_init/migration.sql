-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'WHATSAPP', 'SMS', 'VIDEO_CALL', 'SITE_VISIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityOutcome" AS ENUM ('SUCCESSFUL', 'NO_ANSWER', 'LEFT_MESSAGE', 'FOLLOW_UP_NEEDED', 'NOT_INTERESTED', 'WRONG_CONTACT', 'CALLBACK_LATER', 'POSTPONED', 'OTHER');

-- CreateEnum
CREATE TYPE "AttributeDisplayType" AS ENUM ('SELECT', 'RADIO', 'COLOR', 'IMAGE');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('PROSPECT', 'CUSTOMER', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditCheckStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "CustomerSize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CustomerPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('VIP', 'GOLD', 'SILVER', 'BRONZE', 'STANDARD');

-- CreateEnum
CREATE TYPE "CompanyTypeEntity" AS ENUM ('JURIDICAL', 'NATURAL', 'FOREIGN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('LEGAL', 'BILLING', 'SHIPPING', 'OFFICE', 'WAREHOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('QUOTE', 'PROFORMA', 'ORDER', 'DELIVERY_NOTE', 'INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE', 'SUPPLIER_ORDER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentStatusCategory" AS ENUM ('DRAFT_PHASE', 'APPROVAL_PHASE', 'ACTIVE_PHASE', 'FULFILLMENT_PHASE', 'PAYMENT_PHASE', 'CLOSED_PHASE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SENT', 'ACCEPTED', 'REJECTED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DocumentRelationType" AS ENUM ('CONVERTS_TO', 'SPLITS_FROM', 'MERGES_INTO', 'CREDITS', 'AMENDS');

-- CreateEnum
CREATE TYPE "IntrastatFlow" AS ENUM ('ARRIVAL', 'DISPATCH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'NURTURING', 'CONVERTED', 'LOST', 'DUPLICATE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL_CAMPAIGN', 'PHONE_CALL', 'COLD_CALL', 'EVENT', 'PARTNER', 'ADVERTISING', 'CONTENT', 'DIRECT', 'CHAT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadQuality" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('OPEN', 'WON', 'LOST', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "SalesStage" AS ENUM ('LEAD_QUALIFICATION', 'PROSPECTING', 'NEEDS_ANALYSIS', 'PROPOSAL_SENT', 'NEGOTIATION', 'COMMITMENT');

-- CreateEnum
CREATE TYPE "OpportunitySource" AS ENUM ('LEAD', 'CUSTOMER', 'INBOUND', 'OUTBOUND', 'REFERRAL', 'PARTNER', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceListType" AS ENUM ('SALE', 'PURCHASE', 'PROMOTION', 'CONTRACT');

-- CreateEnum
CREATE TYPE "PriceListStrategy" AS ENUM ('EXPLICIT', 'PERCENT_DECREASE', 'PERCENT_INCREASE', 'FIXED_DECREASE', 'FIXED_INCREASE');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('STANDARD', 'PACK', 'VIRTUAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "VatNatureCategory" AS ENUM ('EXCLUDED', 'NOT_SUBJECT', 'NOT_TAXABLE', 'EXEMPT', 'MARGIN', 'REVERSE', 'EU_VAT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('PHYSICAL', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('PURCHASE', 'SALE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'INVENTORY_START');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VirtualSyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "ActivityPriority" NOT NULL DEFAULT 'MEDIUM',
    "outcome" "ActivityOutcome",
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "duration" INTEGER,
    "reminderMinutes" INTEGER,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER,
    "customerId" INTEGER,
    "contactId" INTEGER,
    "opportunityId" INTEGER,
    "leadId" INTEGER,
    "assignedUserId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "attachments" JSONB,
    "internalNotes" TEXT,
    "result" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpActivityId" INTEGER,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityParticipant" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "userId" INTEGER,
    "contactId" INTEGER,
    "externalEmail" VARCHAR(255),
    "externalName" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'invited',
    "role" VARCHAR(20) NOT NULL DEFAULT 'participant',
    "responseDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTemplate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "priority" "ActivityPriority" NOT NULL DEFAULT 'MEDIUM',
    "defaultDuration" INTEGER,
    "defaultSubject" VARCHAR(255) NOT NULL,
    "defaultDescription" TEXT,
    "checklist" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeGroup" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "displayType" "AttributeDisplayType" NOT NULL DEFAULT 'SELECT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeGroupTranslation" (
    "id" SERIAL NOT NULL,
    "attributeGroupId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "publicName" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "attributeGroupId" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "colorHex" VARCHAR(7),
    "colorHex2" VARCHAR(7),
    "colorPms" VARCHAR(20),
    "colorPms2" VARCHAR(20),
    "imageUrl" VARCHAR(500),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeTranslation" (
    "id" SERIAL NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantAttribute" (
    "productVariantId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,

    CONSTRAINT "ProductVariantAttribute_pkey" PRIMARY KEY ("productVariantId","attributeId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "code" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "description" TEXT,
    "linkRewrite" VARCHAR(255),
    "metaTitle" VARCHAR(255),
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "tradeName" VARCHAR(255),
    "legalForm" VARCHAR(100),
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "entityType" "CompanyTypeEntity" NOT NULL DEFAULT 'JURIDICAL',
    "vatNumber" VARCHAR(20),
    "taxCode" VARCHAR(20),
    "sdiCode" VARCHAR(7),
    "pec" VARCHAR(255),
    "eoriNumber" VARCHAR(20),
    "vatId" VARCHAR(20),
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "taxRegime" VARCHAR(20),
    "vatExempt" BOOLEAN NOT NULL DEFAULT false,
    "vatExemptReason" VARCHAR(100),
    "mainEmail" VARCHAR(255),
    "mainPhone" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstOrderDate" TIMESTAMP(3),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "assignedUserId" INTEGER,
    "customFields" JSONB,
    "openingHours" JSONB,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "priority" "CustomerPriority" NOT NULL DEFAULT 'LOW',
    "segment" "CustomerSegment" NOT NULL DEFAULT 'STANDARD',
    "size" "CustomerSize" NOT NULL DEFAULT 'SMALL',
    "type" "CustomerType" NOT NULL DEFAULT 'PROSPECT',
    "creditStatus" "CreditCheckStatus" NOT NULL DEFAULT 'PENDING',
    "defaultPriceListId" INTEGER,
    "customerTaxRuleId" INTEGER,
    "paymentMethodId" INTEGER,
    "creditLimit" DECIMAL(15,2),
    "firstSaleDate" TIMESTAMP(3),
    "lastSaleDate" TIMESTAMP(3),
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "customerSince" TIMESTAMP(3),
    "lastInteractionAt" TIMESTAMP(3),
    "averageOrderValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "lifetimeValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "churnRisk" SMALLINT NOT NULL DEFAULT 0,
    "healthScore" SMALLINT NOT NULL DEFAULT 50,
    "npsScore" SMALLINT,
    "satisfactionRate" DECIMAL(3,2),
    "lastSurveyDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "paymentTerms" VARCHAR(100),
    "creditLimit" DECIMAL(15,2),
    "bankAccount" VARCHAR(100),
    "leadTimeDays" INTEGER DEFAULT 0,
    "transportCost" DECIMAL(10,2),
    "firstOrderDate" TIMESTAMP(3),
    "lastOrderDate" TIMESTAMP(3),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "rating" INTEGER DEFAULT 5,
    "supplierTaxRuleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAddress" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "addressType" "AddressType" NOT NULL DEFAULT 'LEGAL',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isLegal" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "provinceCode" CHAR(2),
    "zipCode" VARCHAR(20) NOT NULL,
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "phone" VARCHAR(50),
    "openingHours" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "mobilePhone" VARCHAR(50),
    "position" VARCHAR(100),
    "department" VARCHAR(100),
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyNote" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEU" BOOLEAN NOT NULL DEFAULT false,
    "iso3" VARCHAR(3) NOT NULL,
    "numericCode" VARCHAR(3) NOT NULL,
    "phoneCode" VARCHAR(4) NOT NULL,
    "continent" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "currencyCode" CHAR(3) NOT NULL DEFAULT 'EUR',

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "code" CHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "namePlural" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "symbolNative" VARCHAR(10) NOT NULL,
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "rounding" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "symbolPosition" VARCHAR(10) NOT NULL DEFAULT 'before',
    "decimalSeparator" VARCHAR(1) NOT NULL DEFAULT ',',
    "thousandSeparator" VARCHAR(1) NOT NULL DEFAULT '.',
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1.0,
    "exchangeRateUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exchangeRateSource" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "countryCode" CHAR(2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRateHistory" (
    "id" SERIAL NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "rate" DECIMAL(12,6) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyTranslation" (
    "id" SERIAL NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "namePlural" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "statusCategory" "DocumentStatusCategory" NOT NULL DEFAULT 'DRAFT_PHASE',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "documentNumber" TEXT,
    "sequenceNumber" INTEGER,
    "documentYear" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "customerId" INTEGER,
    "supplierId" INTEGER,
    "contactId" INTEGER,
    "opportunityId" INTEGER,
    "leadId" INTEGER,
    "warehouseId" INTEGER,
    "documentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "sentDate" TIMESTAMP(3),
    "parentDocumentId" INTEGER,
    "customerName" TEXT NOT NULL,
    "customerVatNumber" TEXT,
    "customerTaxCode" TEXT,
    "customerPec" TEXT,
    "customerSdiCode" TEXT,
    "customerAddress" TEXT,
    "customerCity" TEXT,
    "customerPostalCode" TEXT,
    "customerProvince" TEXT,
    "customerCountryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "shippingName" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingPostalCode" TEXT,
    "shippingProvince" TEXT,
    "shippingCountryCode" CHAR(2),
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "shippingCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "shippingTaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currencyCode" CHAR(3) NOT NULL DEFAULT 'EUR',
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1.0,
    "exchangeRateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseCurrencyCode" CHAR(3) NOT NULL DEFAULT 'EUR',
    "paymentMethodId" INTEGER,
    "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    "paymentTerms" VARCHAR(100),
    "bankName" VARCHAR(100),
    "bankIban" TEXT,
    "bankSwift" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "termsAndConditions" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "assignedUserId" INTEGER,
    "deletedBy" INTEGER,
    "customFields" JSONB,
    "statusHistory" JSONB,
    "approvedAt" TIMESTAMP(3),
    "invoicedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "voidedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentLine" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "productVariantId" INTEGER,
    "productId" INTEGER,
    "lineNumber" INTEGER NOT NULL,
    "lineType" VARCHAR(20) NOT NULL DEFAULT 'product',
    "code" TEXT,
    "nameSystem" VARCHAR(255) NOT NULL,
    "descriptionSystem" TEXT,
    "nameCustomer" VARCHAR(255),
    "descriptionCustomer" TEXT,
    "quantity" DECIMAL(15,6) NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'pz',
    "unitPrice" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxRuleId" INTEGER,
    "taxPercent" DECIMAL(5,2) NOT NULL DEFAULT 22,
    "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "vatNatureCode" VARCHAR(10),
    "vatNormReference" VARCHAR(255),
    "lineTotalWithTax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "customFields" JSONB,
    "warehouseId" INTEGER,
    "parentLineId" INTEGER,
    "isComponent" BOOLEAN NOT NULL DEFAULT false,
    "quantityInvoiced" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "quantityDelivered" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "quantityReturned" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "originalUnitPrice" DECIMAL(20,6),
    "priceOverrideReason" TEXT,

    CONSTRAINT "DocumentLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPaymentInstallment" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "installmentNumber" INTEGER NOT NULL DEFAULT 1,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "paymentMethodId" INTEGER,
    "paymentReference" VARCHAR(100),
    "bankTransactionId" VARCHAR(100),
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "lateFeeAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentPaymentInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" SERIAL NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "prefix" VARCHAR(10),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRelation" (
    "sourceDocumentId" INTEGER NOT NULL,
    "targetDocumentId" INTEGER NOT NULL,
    "relationType" "DocumentRelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRelation_pkey" PRIMARY KEY ("sourceDocumentId","targetDocumentId","relationType")
);

-- CreateTable
CREATE TABLE "IntrastatTransaction" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "documentLineId" INTEGER NOT NULL,
    "flow" "IntrastatFlow" NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "transactionCode" CHAR(2) NOT NULL,
    "commodityCode" CHAR(8) NOT NULL,
    "partnerCountryCode" CHAR(2) NOT NULL,
    "invoicedValue" DECIMAL(15,2) NOT NULL,
    "statisticalValue" DECIMAL(15,2) NOT NULL,
    "netMass" DECIMAL(15,3) NOT NULL,
    "supplementaryUnits" INTEGER,
    "modeOfTransport" VARCHAR(2),
    "isCorrection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntrastatTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntrastatTransactionCode" (
    "code" CHAR(2) NOT NULL,
    "descriptionIT" VARCHAR(255) NOT NULL,
    "descriptionEN" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntrastatTransactionCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "IntrastatCommodityCode" (
    "code" CHAR(8) NOT NULL,
    "descriptionIT" VARCHAR(500) NOT NULL,
    "descriptionEN" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntrastatCommodityCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "iso_code" CHAR(2) NOT NULL,
    "language_code" CHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "tradeName" VARCHAR(255),
    "website" VARCHAR(255),
    "vatNumber" VARCHAR(20),
    "taxCode" VARCHAR(20),
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "contactFirstName" VARCHAR(100) NOT NULL,
    "contactLastName" VARCHAR(100) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(50),
    "contactMobile" VARCHAR(50),
    "contactPosition" VARCHAR(100),
    "contactDepartment" VARCHAR(100),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "provinceCode" CHAR(2),
    "zipCode" VARCHAR(20),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "quality" "LeadQuality" NOT NULL DEFAULT 'COLD',
    "score" SMALLINT NOT NULL DEFAULT 0,
    "estimatedValue" DECIMAL(15,2),
    "estimatedSize" "CustomerSize",
    "industry" VARCHAR(100),
    "employeesCount" INTEGER,
    "annualRevenue" DECIMAL(15,2),
    "budget" DECIMAL(15,2),
    "purchaseTimeframe" VARCHAR(50),
    "decisionAuthority" VARCHAR(50),
    "primaryNeed" TEXT,
    "interestedIn" TEXT,
    "assignedUserId" INTEGER,
    "convertedAt" TIMESTAMP(3),
    "convertedToId" INTEGER,
    "convertedByUserId" INTEGER,
    "lostReason" TEXT,
    "lostDate" TIMESTAMP(3),
    "firstContactDate" TIMESTAMP(3),
    "lastContactDate" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "contactAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastStatusChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bantQualified" BOOLEAN NOT NULL DEFAULT false,
    "bantNotes" TEXT,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyConsentDate" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentDate" TIMESTAMP(3),
    "doNotCall" BOOLEAN NOT NULL DEFAULT false,
    "doNotEmail" BOOLEAN NOT NULL DEFAULT false,
    "campaignName" VARCHAR(100),
    "utmMedium" VARCHAR(50),
    "utmSource" VARCHAR(50),
    "utmCampaign" VARCHAR(50),
    "landingPage" VARCHAR(255),
    "referrer" VARCHAR(255),
    "notes" TEXT,
    "description" TEXT,
    "customFields" JSONB,
    "competitors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "leadId" INTEGER,
    "customerId" INTEGER NOT NULL,
    "source" "OpportunitySource" NOT NULL DEFAULT 'OTHER',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "stage" "SalesStage" NOT NULL DEFAULT 'LEAD_QUALIFICATION',
    "estimatedValue" DECIMAL(15,2),
    "weightedValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "actualValue" DECIMAL(15,2),
    "expectedCloseDate" TIMESTAMP(3),
    "closedDate" TIMESTAMP(3),
    "closedReasonId" INTEGER,
    "closedNotes" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "assignedUserId" INTEGER,
    "lastStageChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysInCurrentStage" INTEGER NOT NULL DEFAULT 0,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "proposedProducts" JSONB,
    "notes" TEXT,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosedReason" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isWon" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosedReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTermDetail" (
    "id" SERIAL NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "termType" VARCHAR(50) NOT NULL DEFAULT 'days_from_invoice',
    "dueDays" INTEGER NOT NULL DEFAULT 0,
    "isEndOfMonth" BOOLEAN NOT NULL DEFAULT false,
    "isFixedDate" BOOLEAN NOT NULL DEFAULT false,
    "fixedDay" INTEGER,
    "fixedMonthOffset" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTermDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodTranslation" (
    "id" SERIAL NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currencyCode" CHAR(3) NOT NULL DEFAULT 'EUR',
    "type" "PriceListType" NOT NULL DEFAULT 'SALE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parentListId" INTEGER,
    "strategy" "PriceListStrategy" NOT NULL DEFAULT 'EXPLICIT',
    "strategyValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "roundingMethod" VARCHAR(20) DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" SERIAL NOT NULL,
    "priceListId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(19,4) NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "taxRuleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'STANDARD',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "reference" VARCHAR(64) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "availableForOrder" BOOLEAN NOT NULL DEFAULT true,
    "showPrice" BOOLEAN NOT NULL DEFAULT true,
    "onlineOnly" BOOLEAN NOT NULL DEFAULT false,
    "onSale" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "wholesalePrice" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "ecotax" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "defaultTaxRuleId" INTEGER NOT NULL,
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'both',
    "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
    "showCondition" BOOLEAN NOT NULL DEFAULT false,
    "manufacturerId" INTEGER,
    "supplierId" INTEGER,
    "additionalShippingCost" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "carrierReferenceIds" JSONB,
    "deliveryTimeNoteType" INTEGER NOT NULL DEFAULT 0,
    "redirectType" VARCHAR(10) NOT NULL DEFAULT '404',
    "redirectTarget" INTEGER NOT NULL DEFAULT 0,
    "coverThumbnailUrl" VARCHAR(500),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantTranslation" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "shortDescription" VARCHAR(500),
    "tags" VARCHAR(500),
    "metaTitle" VARCHAR(255),
    "metaDescription" TEXT,
    "metaKeywords" VARCHAR(500),
    "linkRewrite" VARCHAR(255),
    "availableNowLabel" VARCHAR(100) NOT NULL DEFAULT 'In stock',
    "availableLaterLabel" VARCHAR(100) NOT NULL DEFAULT 'Available soon',
    "deliveryTimeInStockNote" VARCHAR(255),
    "deliveryTimeOutOfStockNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantCode" VARCHAR(64) NOT NULL,
    "sku" VARCHAR(64),
    "ean13" VARCHAR(13),
    "upc" VARCHAR(12),
    "isbn" VARCHAR(32),
    "mpn" VARCHAR(40),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minimalQuantity" INTEGER NOT NULL DEFAULT 1,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(50),
    "packStockType" INTEGER NOT NULL DEFAULT 0,
    "outOfStockType" INTEGER NOT NULL DEFAULT 0,
    "availableDate" TIMESTAMP(3),
    "price" DECIMAL(20,6),
    "wholesalePrice" DECIMAL(20,6),
    "unitPriceRatio" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "weight" DECIMAL(20,6) DEFAULT 0,
    "width" DECIMAL(20,6) DEFAULT 0,
    "height" DECIMAL(20,6) DEFAULT 0,
    "depth" DECIMAL(20,6) DEFAULT 0,
    "commodityCode" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "availableForOrder" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageType" VARCHAR(20) NOT NULL DEFAULT 'extra',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "altText" JSONB,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "parentRoleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(20) NOT NULL DEFAULT 'own',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "userId" INTEGER,
    "changes" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" SERIAL NOT NULL,
    "tenantCode" VARCHAR(20),
    "companyName" VARCHAR(255) NOT NULL,
    "vatNumber" VARCHAR(20) NOT NULL,
    "taxCode" VARCHAR(20) NOT NULL,
    "sdiCode" VARCHAR(7),
    "pec" VARCHAR(255),
    "fiscalAddress" TEXT,
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "taxRegime" VARCHAR(50),
    "defaultSalesTaxRuleId" INTEGER,
    "defaultPurchasesTaxRuleId" INTEGER,
    "defaultCurrency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "defaultLanguageId" INTEGER,
    "sdiTransmissionFormat" VARCHAR(10),
    "sdiCertificatePath" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VatNature" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "category" "VatNatureCategory" NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "extendedDescription" TEXT,
    "legalReference" VARCHAR(255),
    "applicableToEntityTypes" VARCHAR(10),
    "validForSales" BOOLEAN NOT NULL DEFAULT true,
    "validForPurchases" BOOLEAN NOT NULL DEFAULT false,
    "vatReturnLine" VARCHAR(10),
    "requiresNormReference" BOOLEAN NOT NULL DEFAULT false,
    "usageExamples" TEXT,
    "operationalNotes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT '2021-01-01 00:00:00 +00:00',
    "validTo" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "replacedByCode" VARCHAR(10),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VatNature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VatNatureTranslation" (
    "id" SERIAL NOT NULL,
    "vatNatureId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VatNatureTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatNatureId" INTEGER,
    "normativeReference" VARCHAR(255),
    "countryCode" CHAR(2) NOT NULL DEFAULT 'IT',
    "applicableFor" VARCHAR(20) NOT NULL DEFAULT 'both',
    "productCategory" VARCHAR(50),
    "customerType" VARCHAR(20),
    "isSplitPayment" BOOLEAN NOT NULL DEFAULT false,
    "deductibilityPercent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "vatDeductible" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRuleTranslation" (
    "id" SERIAL NOT NULL,
    "taxRuleId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRuleTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" CHAR(64),
    "emailVerificationExpires" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "resetPasswordToken" CHAR(64),
    "resetPasswordExpires" TIMESTAMP(3),
    "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastPasswordResetAt" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "twoFactorBackupCodes" JSONB,
    "lastPasswordChangeAt" TIMESTAMP(3),
    "passwordChangedBy" INTEGER,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLoginAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "consentGivenAt" TIMESTAMP(3),
    "dataRetentionExpiresAt" TIMESTAMP(3),
    "preferredLanguageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDetails" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "profilePicture" VARCHAR(500),
    "phone" VARCHAR(20),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zipCode" VARCHAR(20),
    "country" CHAR(2) DEFAULT 'IT',
    "dateOfBirth" DATE,
    "gender" "Gender" NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
    "bio" TEXT,
    "lastLogin" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" "WarehouseType" NOT NULL DEFAULT 'PHYSICAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "referenceId" TEXT,
    "note" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitCost" DECIMAL(20,6),
    "totalCost" DECIMAL(20,2),
    "documentId" INTEGER,
    "documentLineId" INTEGER,
    "batchNumber" VARCHAR(50),
    "serialNumber" VARCHAR(50),
    "expiryDate" TIMESTAMP(3),
    "createdByUserId" INTEGER,
    "status" "MovementStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualStock" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "VirtualSyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "expectedAvailableDate" TIMESTAMP(3),
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "supplierPrice" DECIMAL(20,6),
    "supplierCurrencyCode" CHAR(3),

    CONSTRAINT "VirtualStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBatch" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "batchNumber" VARCHAR(50) NOT NULL,
    "manufacturedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "supplierId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT "StockBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReservation" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "documentLineId" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "batchNumber" VARCHAR(50),

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CountryToLanguage" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CountryToLanguage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE INDEX "Activity_priority_idx" ON "Activity"("priority");

-- CreateIndex
CREATE INDEX "Activity_companyId_idx" ON "Activity"("companyId");

-- CreateIndex
CREATE INDEX "Activity_customerId_idx" ON "Activity"("customerId");

-- CreateIndex
CREATE INDEX "Activity_opportunityId_idx" ON "Activity"("opportunityId");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_assignedUserId_idx" ON "Activity"("assignedUserId");

-- CreateIndex
CREATE INDEX "Activity_scheduledStart_idx" ON "Activity"("scheduledStart");

-- CreateIndex
CREATE INDEX "Activity_scheduledEnd_idx" ON "Activity"("scheduledEnd");

-- CreateIndex
CREATE INDEX "ActivityParticipant_activityId_idx" ON "ActivityParticipant"("activityId");

-- CreateIndex
CREATE INDEX "ActivityParticipant_userId_idx" ON "ActivityParticipant"("userId");

-- CreateIndex
CREATE INDEX "ActivityParticipant_contactId_idx" ON "ActivityParticipant"("contactId");

-- CreateIndex
CREATE INDEX "ActivityTemplate_type_idx" ON "ActivityTemplate"("type");

-- CreateIndex
CREATE INDEX "ActivityTemplate_active_idx" ON "ActivityTemplate"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeGroup_code_key" ON "AttributeGroup"("code");

-- CreateIndex
CREATE INDEX "AttributeGroup_position_idx" ON "AttributeGroup"("position");

-- CreateIndex
CREATE INDEX "AttributeGroupTranslation_languageId_idx" ON "AttributeGroupTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeGroupTranslation_attributeGroupId_languageId_key" ON "AttributeGroupTranslation"("attributeGroupId", "languageId");

-- CreateIndex
CREATE INDEX "Attribute_attributeGroupId_idx" ON "Attribute"("attributeGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_attributeGroupId_code_key" ON "Attribute"("attributeGroupId", "code");

-- CreateIndex
CREATE INDEX "AttributeTranslation_languageId_idx" ON "AttributeTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeTranslation_attributeId_languageId_key" ON "AttributeTranslation"("attributeId", "languageId");

-- CreateIndex
CREATE INDEX "ProductVariantAttribute_attributeId_idx" ON "ProductVariantAttribute"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- CreateIndex
CREATE INDEX "Category_level_idx" ON "Category"("level");

-- CreateIndex
CREATE INDEX "CategoryTranslation_languageId_idx" ON "CategoryTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_languageId_key" ON "CategoryTranslation"("categoryId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE INDEX "Company_vatNumber_idx" ON "Company"("vatNumber");

-- CreateIndex
CREATE INDEX "Company_taxCode_idx" ON "Company"("taxCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_key" ON "Customer"("companyId");

-- CreateIndex
CREATE INDEX "Customer_deletedAt_idx" ON "Customer"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_companyId_key" ON "Supplier"("companyId");

-- CreateIndex
CREATE INDEX "Supplier_deletedAt_idx" ON "Supplier"("deletedAt");

-- CreateIndex
CREATE INDEX "CompanyAddress_companyId_isLegal_idx" ON "CompanyAddress"("companyId", "isLegal");

-- CreateIndex
CREATE INDEX "CompanyAddress_addressType_idx" ON "CompanyAddress"("addressType");

-- CreateIndex
CREATE INDEX "CompanyAddress_provinceCode_idx" ON "CompanyAddress"("provinceCode");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAddress_companyId_addressType_isPrimary_key" ON "CompanyAddress"("companyId", "addressType", "isPrimary");

-- CreateIndex
CREATE INDEX "Contact_companyId_isPrimaryContact_idx" ON "Contact"("companyId", "isPrimaryContact");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_isPrimaryContact_idx" ON "Contact"("isPrimaryContact");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_companyId_email_key" ON "Contact"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "Currency_code_idx" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "Currency_active_idx" ON "Currency"("active");

-- CreateIndex
CREATE INDEX "Currency_isBaseCurrency_idx" ON "Currency"("isBaseCurrency");

-- CreateIndex
CREATE INDEX "ExchangeRateHistory_currencyId_date_idx" ON "ExchangeRateHistory"("currencyId", "date");

-- CreateIndex
CREATE INDEX "ExchangeRateHistory_date_idx" ON "ExchangeRateHistory"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRateHistory_currencyId_date_key" ON "ExchangeRateHistory"("currencyId", "date");

-- CreateIndex
CREATE INDEX "CurrencyTranslation_languageId_idx" ON "CurrencyTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyTranslation_currencyId_languageId_key" ON "CurrencyTranslation"("currencyId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");

-- CreateIndex
CREATE INDEX "Document_currencyCode_idx" ON "Document"("currencyCode");

-- CreateIndex
CREATE INDEX "Document_deletedAt_idx" ON "Document"("deletedAt");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_companyId_idx" ON "Document"("companyId");

-- CreateIndex
CREATE INDEX "Document_customerId_idx" ON "Document"("customerId");

-- CreateIndex
CREATE INDEX "Document_supplierId_idx" ON "Document"("supplierId");

-- CreateIndex
CREATE INDEX "Document_opportunityId_idx" ON "Document"("opportunityId");

-- CreateIndex
CREATE INDEX "Document_leadId_idx" ON "Document"("leadId");

-- CreateIndex
CREATE INDEX "Document_documentYear_idx" ON "Document"("documentYear");

-- CreateIndex
CREATE INDEX "Document_customerCountryCode_idx" ON "Document"("customerCountryCode");

-- CreateIndex
CREATE INDEX "Document_shippingCountryCode_idx" ON "Document"("shippingCountryCode");

-- CreateIndex
CREATE INDEX "Document_documentType_documentYear_documentNumber_idx" ON "Document"("documentType", "documentYear", "documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentType_documentYear_sequenceNumber_key" ON "Document"("documentType", "documentYear", "sequenceNumber");

-- CreateIndex
CREATE INDEX "DocumentLine_warehouseId_idx" ON "DocumentLine"("warehouseId");

-- CreateIndex
CREATE INDEX "DocumentLine_parentLineId_idx" ON "DocumentLine"("parentLineId");

-- CreateIndex
CREATE INDEX "DocumentLine_documentId_lineNumber_idx" ON "DocumentLine"("documentId", "lineNumber");

-- CreateIndex
CREATE INDEX "DocumentLine_documentId_idx" ON "DocumentLine"("documentId");

-- CreateIndex
CREATE INDEX "DocumentLine_productId_idx" ON "DocumentLine"("productId");

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_status_dueDate_idx" ON "DocumentPaymentInstallment"("status", "dueDate");

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_documentId_idx" ON "DocumentPaymentInstallment"("documentId");

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_dueDate_idx" ON "DocumentPaymentInstallment"("dueDate");

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_status_idx" ON "DocumentPaymentInstallment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_documentType_key" ON "DocumentSequence"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_documentType_year_key" ON "DocumentSequence"("documentType", "year");

-- CreateIndex
CREATE INDEX "DocumentRelation_targetDocumentId_idx" ON "DocumentRelation"("targetDocumentId");

-- CreateIndex
CREATE INDEX "IntrastatTransaction_transactionDate_idx" ON "IntrastatTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "IntrastatTransaction_partnerCountryCode_idx" ON "IntrastatTransaction"("partnerCountryCode");

-- CreateIndex
CREATE UNIQUE INDEX "IntrastatTransaction_documentLineId_key" ON "IntrastatTransaction"("documentLineId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_iso_code_key" ON "Language"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "Language_language_code_key" ON "Language"("language_code");

-- CreateIndex
CREATE INDEX "Language_iso_code_idx" ON "Language"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_code_key" ON "Lead"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedToId_key" ON "Lead"("convertedToId");

-- CreateIndex
CREATE INDEX "Lead_code_idx" ON "Lead"("code");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_quality_idx" ON "Lead"("quality");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE INDEX "Lead_assignedUserId_idx" ON "Lead"("assignedUserId");

-- CreateIndex
CREATE INDEX "Lead_contactEmail_idx" ON "Lead"("contactEmail");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUpDate_idx" ON "Lead"("nextFollowUpDate");

-- CreateIndex
CREATE INDEX "Lead_convertedToId_idx" ON "Lead"("convertedToId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_lastContactDate_idx" ON "Lead"("lastContactDate");

-- CreateIndex
CREATE INDEX "Lead_status_assignedUserId_idx" ON "Lead"("status", "assignedUserId");

-- CreateIndex
CREATE INDEX "Lead_quality_score_idx" ON "Lead"("quality", "score");

-- CreateIndex
CREATE INDEX "Opportunity_leadId_idx" ON "Opportunity"("leadId");

-- CreateIndex
CREATE INDEX "Opportunity_customerId_idx" ON "Opportunity"("customerId");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE INDEX "Opportunity_stage_idx" ON "Opportunity"("stage");

-- CreateIndex
CREATE INDEX "Opportunity_source_idx" ON "Opportunity"("source");

-- CreateIndex
CREATE INDEX "Opportunity_assignedUserId_idx" ON "Opportunity"("assignedUserId");

-- CreateIndex
CREATE INDEX "Opportunity_expectedCloseDate_idx" ON "Opportunity"("expectedCloseDate");

-- CreateIndex
CREATE INDEX "Opportunity_closedDate_idx" ON "Opportunity"("closedDate");

-- CreateIndex
CREATE UNIQUE INDEX "ClosedReason_code_key" ON "ClosedReason"("code");

-- CreateIndex
CREATE INDEX "ClosedReason_isWon_idx" ON "ClosedReason"("isWon");

-- CreateIndex
CREATE INDEX "ClosedReason_active_idx" ON "ClosedReason"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_active_idx" ON "PaymentMethod"("active");

-- CreateIndex
CREATE INDEX "PaymentTermDetail_paymentMethodId_idx" ON "PaymentTermDetail"("paymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentTermDetail_position_idx" ON "PaymentTermDetail"("position");

-- CreateIndex
CREATE INDEX "PaymentMethodTranslation_languageId_idx" ON "PaymentMethodTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodTranslation_paymentMethodId_languageId_key" ON "PaymentMethodTranslation"("paymentMethodId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_code_key" ON "PriceList"("code");

-- CreateIndex
CREATE INDEX "PriceList_active_idx" ON "PriceList"("active");

-- CreateIndex
CREATE INDEX "PriceList_validFrom_validTo_idx" ON "PriceList"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "PriceListItem_variantId_idx" ON "PriceListItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListItem_priceListId_variantId_minQuantity_key" ON "PriceListItem"("priceListId", "variantId", "minQuantity");

-- CreateIndex
CREATE UNIQUE INDEX "Product_reference_key" ON "Product"("reference");

-- CreateIndex
CREATE INDEX "Product_reference_idx" ON "Product"("reference");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "Product_supplierId_idx" ON "Product"("supplierId");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantTranslation_linkRewrite_key" ON "ProductVariantTranslation"("linkRewrite");

-- CreateIndex
CREATE INDEX "ProductVariantTranslation_productVariantId_idx" ON "ProductVariantTranslation"("productVariantId");

-- CreateIndex
CREATE INDEX "ProductVariantTranslation_languageId_idx" ON "ProductVariantTranslation"("languageId");

-- CreateIndex
CREATE INDEX "ProductVariantTranslation_linkRewrite_idx" ON "ProductVariantTranslation"("linkRewrite");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantTranslation_productVariantId_languageId_key" ON "ProductVariantTranslation"("productVariantId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_variantCode_key" ON "ProductVariant"("variantCode");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_variantCode_idx" ON "ProductVariant"("variantCode");

-- CreateIndex
CREATE INDEX "ProductVariant_isDefault_idx" ON "ProductVariant"("isDefault");

-- CreateIndex
CREATE INDEX "ProductVariant_deletedAt_idx" ON "ProductVariant"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_ean13_key" ON "ProductVariant"("ean13");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- CreateIndex
CREATE INDEX "ProductImage_imageType_idx" ON "ProductImage"("imageType");

-- CreateIndex
CREATE INDEX "ProductImage_position_idx" ON "ProductImage"("position");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_scope_key" ON "Permission"("resource", "action", "scope");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantCode_key" ON "TenantSettings"("tenantCode");

-- CreateIndex
CREATE INDEX "TenantSettings_defaultSalesTaxRuleId_idx" ON "TenantSettings"("defaultSalesTaxRuleId");

-- CreateIndex
CREATE INDEX "TenantSettings_defaultPurchasesTaxRuleId_idx" ON "TenantSettings"("defaultPurchasesTaxRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "VatNature_code_key" ON "VatNature"("code");

-- CreateIndex
CREATE INDEX "VatNature_code_idx" ON "VatNature"("code");

-- CreateIndex
CREATE INDEX "VatNature_category_idx" ON "VatNature"("category");

-- CreateIndex
CREATE INDEX "VatNature_active_displayOrder_idx" ON "VatNature"("active", "displayOrder");

-- CreateIndex
CREATE INDEX "VatNature_validFrom_validTo_idx" ON "VatNature"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "VatNatureTranslation_languageId_idx" ON "VatNatureTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VatNatureTranslation_vatNatureId_languageId_key" ON "VatNatureTranslation"("vatNatureId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRule_code_key" ON "TaxRule"("code");

-- CreateIndex
CREATE INDEX "TaxRule_code_idx" ON "TaxRule"("code");

-- CreateIndex
CREATE INDEX "TaxRule_rate_idx" ON "TaxRule"("rate");

-- CreateIndex
CREATE INDEX "TaxRule_vatNatureId_idx" ON "TaxRule"("vatNatureId");

-- CreateIndex
CREATE INDEX "TaxRule_countryCode_idx" ON "TaxRule"("countryCode");

-- CreateIndex
CREATE INDEX "TaxRule_active_isDefault_idx" ON "TaxRule"("active", "isDefault");

-- CreateIndex
CREATE INDEX "TaxRule_validFrom_validTo_idx" ON "TaxRule"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "TaxRule_applicableFor_idx" ON "TaxRule"("applicableFor");

-- CreateIndex
CREATE INDEX "TaxRuleTranslation_languageId_idx" ON "TaxRuleTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRuleTranslation_taxRuleId_languageId_key" ON "TaxRuleTranslation"("taxRuleId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_emailVerificationToken_idx" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "User_resetPasswordToken_idx" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "User_lockedUntil_idx" ON "User"("lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "UserDetails_userId_key" ON "UserDetails"("userId");

-- CreateIndex
CREATE INDEX "UserDetails_firstName_idx" ON "UserDetails"("firstName");

-- CreateIndex
CREATE INDEX "UserDetails_lastName_idx" ON "UserDetails"("lastName");

-- CreateIndex
CREATE INDEX "StockMovement_productVariantId_idx" ON "StockMovement"("productVariantId");

-- CreateIndex
CREATE INDEX "StockMovement_warehouseId_idx" ON "StockMovement"("warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_movementDate_idx" ON "StockMovement"("movementDate");

-- CreateIndex
CREATE INDEX "StockMovement_documentId_idx" ON "StockMovement"("documentId");

-- CreateIndex
CREATE INDEX "StockMovement_batchNumber_idx" ON "StockMovement"("batchNumber");

-- CreateIndex
CREATE INDEX "StockMovement_serialNumber_idx" ON "StockMovement"("serialNumber");

-- CreateIndex
CREATE INDEX "StockMovement_status_idx" ON "StockMovement"("status");

-- CreateIndex
CREATE INDEX "VirtualStock_supplierCurrencyCode_idx" ON "VirtualStock"("supplierCurrencyCode");

-- CreateIndex
CREATE INDEX "VirtualStock_syncStatus_lastSyncAt_idx" ON "VirtualStock"("syncStatus", "lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualStock_productVariantId_warehouseId_key" ON "VirtualStock"("productVariantId", "warehouseId");

-- CreateIndex
CREATE INDEX "StockBatch_expiryDate_idx" ON "StockBatch"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "StockBatch_productVariantId_batchNumber_key" ON "StockBatch"("productVariantId", "batchNumber");

-- CreateIndex
CREATE INDEX "StockReservation_productVariantId_warehouseId_status_idx" ON "StockReservation"("productVariantId", "warehouseId", "status");

-- CreateIndex
CREATE INDEX "StockReservation_documentId_idx" ON "StockReservation"("documentId");

-- CreateIndex
CREATE INDEX "StockReservation_expiresAt_idx" ON "StockReservation"("expiresAt");

-- CreateIndex
CREATE INDEX "_CountryToLanguage_B_index" ON "_CountryToLanguage"("B");

-- CreateIndex
CREATE INDEX "_UserRoles_B_index" ON "_UserRoles"("B");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_followUpActivityId_fkey" FOREIGN KEY ("followUpActivityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityParticipant" ADD CONSTRAINT "ActivityParticipant_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeGroupTranslation" ADD CONSTRAINT "AttributeGroupTranslation_attributeGroupId_fkey" FOREIGN KEY ("attributeGroupId") REFERENCES "AttributeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeGroupTranslation" ADD CONSTRAINT "AttributeGroupTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_attributeGroupId_fkey" FOREIGN KEY ("attributeGroupId") REFERENCES "AttributeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeTranslation" ADD CONSTRAINT "AttributeTranslation_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeTranslation" ADD CONSTRAINT "AttributeTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttribute" ADD CONSTRAINT "ProductVariantAttribute_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttribute" ADD CONSTRAINT "ProductVariantAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_defaultPriceListId_fkey" FOREIGN KEY ("defaultPriceListId") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerTaxRuleId_fkey" FOREIGN KEY ("customerTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierTaxRuleId_fkey" FOREIGN KEY ("supplierTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNote" ADD CONSTRAINT "CompanyNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyNote" ADD CONSTRAINT "CompanyNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRateHistory" ADD CONSTRAINT "ExchangeRateHistory_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyTranslation" ADD CONSTRAINT "CurrencyTranslation_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyTranslation" ADD CONSTRAINT "CurrencyTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerCountryCode_fkey" FOREIGN KEY ("customerCountryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_shippingCountryCode_fkey" FOREIGN KEY ("shippingCountryCode") REFERENCES "Country"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_parentLineId_fkey" FOREIGN KEY ("parentLineId") REFERENCES "DocumentLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPaymentInstallment" ADD CONSTRAINT "DocumentPaymentInstallment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPaymentInstallment" ADD CONSTRAINT "DocumentPaymentInstallment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRelation" ADD CONSTRAINT "DocumentRelation_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRelation" ADD CONSTRAINT "DocumentRelation_targetDocumentId_fkey" FOREIGN KEY ("targetDocumentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntrastatTransaction" ADD CONSTRAINT "IntrastatTransaction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntrastatTransaction" ADD CONSTRAINT "IntrastatTransaction_documentLineId_fkey" FOREIGN KEY ("documentLineId") REFERENCES "DocumentLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntrastatTransaction" ADD CONSTRAINT "IntrastatTransaction_transactionCode_fkey" FOREIGN KEY ("transactionCode") REFERENCES "IntrastatTransactionCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntrastatTransaction" ADD CONSTRAINT "IntrastatTransaction_commodityCode_fkey" FOREIGN KEY ("commodityCode") REFERENCES "IntrastatCommodityCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedToId_fkey" FOREIGN KEY ("convertedToId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedByUserId_fkey" FOREIGN KEY ("convertedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_closedReasonId_fkey" FOREIGN KEY ("closedReasonId") REFERENCES "ClosedReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTermDetail" ADD CONSTRAINT "PaymentTermDetail_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_parentListId_fkey" FOREIGN KEY ("parentListId") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_defaultTaxRuleId_fkey" FOREIGN KEY ("defaultTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantTranslation" ADD CONSTRAINT "ProductVariantTranslation_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantTranslation" ADD CONSTRAINT "ProductVariantTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_commodityCode_fkey" FOREIGN KEY ("commodityCode") REFERENCES "IntrastatCommodityCode"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_defaultSalesTaxRuleId_fkey" FOREIGN KEY ("defaultSalesTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_defaultPurchasesTaxRuleId_fkey" FOREIGN KEY ("defaultPurchasesTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_defaultLanguageId_fkey" FOREIGN KEY ("defaultLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatNature" ADD CONSTRAINT "VatNature_replacedByCode_fkey" FOREIGN KEY ("replacedByCode") REFERENCES "VatNature"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatNatureTranslation" ADD CONSTRAINT "VatNatureTranslation_vatNatureId_fkey" FOREIGN KEY ("vatNatureId") REFERENCES "VatNature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatNatureTranslation" ADD CONSTRAINT "VatNatureTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_vatNatureId_fkey" FOREIGN KEY ("vatNatureId") REFERENCES "VatNature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleTranslation" ADD CONSTRAINT "TaxRuleTranslation_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "TaxRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleTranslation" ADD CONSTRAINT "TaxRuleTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_documentLineId_fkey" FOREIGN KEY ("documentLineId") REFERENCES "DocumentLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualStock" ADD CONSTRAINT "VirtualStock_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualStock" ADD CONSTRAINT "VirtualStock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualStock" ADD CONSTRAINT "VirtualStock_supplierCurrencyCode_fkey" FOREIGN KEY ("supplierCurrencyCode") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBatch" ADD CONSTRAINT "StockBatch_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBatch" ADD CONSTRAINT "StockBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_documentLineId_fkey" FOREIGN KEY ("documentLineId") REFERENCES "DocumentLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_B_fkey" FOREIGN KEY ("B") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

